# State Management Patterns

## What This Enables

State management is the discipline of controlling how data flows through an application, when it changes, and who is notified. A rigorous understanding of state management patterns prevents an entire class of bugs -- stale renders, lost user input, race conditions between server and client, and UI that contradicts the underlying data model. This document formalizes the taxonomy of state, the architectural patterns that govern its flow, and the persistence and synchronization strategies that keep distributed clients coherent. Engineers who internalize these patterns can design systems where state is predictable, debuggable, and minimal.

---

## State Taxonomy

Before selecting a state management strategy, we must classify the state we are managing. Different categories of state have fundamentally different lifetimes, ownership semantics, and consistency requirements.

### UI State

**Definition:** State that exists solely to control the visual presentation layer and has no meaning outside the current rendering context. Examples include whether a modal is open, which tab is selected, whether a tooltip is visible, or the current scroll position.

**Properties:**
- Lifetime bounded by the component or view that owns it.
- No server-side counterpart. Losing it on page refresh is acceptable.
- Should be colocated with the component that uses it. Lifting UI state into global stores is a common anti-pattern that increases coupling without benefit.

### Server State

**Definition:** State that is authoritative on a remote server and is asynchronously mirrored to the client. Examples include user profiles, product listings, order histories, and any data fetched via API.

**Properties:**
- The client holds a cache, not the source of truth. The cache may be stale.
- Governed by cache invalidation policies (TTL, stale-while-revalidate, manual invalidation).
- Requires handling of loading, error, and success states -- a three-state minimum that naive implementations frequently collapse into two.

### URL State

**Definition:** State encoded in the URL (path segments, query parameters, hash fragments). Examples include the current page, search filters, pagination offsets, and sort order.

**Properties:**
- Shareable and bookmarkable by design.
- Acts as a serialization boundary: only primitive types or simple structures belong here.
- The URL is a form of global state. Changes to URL state trigger navigation and should be treated as a user intent signal, not a side effect of rendering.

### Form State

**Definition:** State representing the current values, validation status, touched/dirty flags, and submission status of user input. Examples include login forms, multi-step wizards, and inline editing interfaces.

**Properties:**
- Highly transient. Rarely needs to survive a page refresh (though autosave patterns exist).
- Requires field-level granularity for validation and error display.
- The interaction between form state and server state (submission, server-side validation errors) is a frequent source of bugs when not explicitly modeled.

### Ephemeral State

**Definition:** State that exists only for the duration of a single interaction or animation and is never persisted or shared. Examples include drag coordinates during a drag-and-drop operation, the intermediate position of an element during an animation, or the current selection during a multi-select gesture.

**Properties:**
- Lifetime measured in milliseconds to seconds.
- Should never enter a global store. Managing ephemeral state in Redux or similar libraries introduces unnecessary overhead and complexity.
- Often best managed with refs, local variables, or animation-specific APIs rather than reactive state primitives.

---

## Unidirectional Data Flow: Redux and Flux

### The Flux Architecture (Facebook, 2014)

Flux was introduced to solve the problem of unpredictable data flow in large Facebook applications, where bidirectional data binding between models and views created cascading update cycles that were nearly impossible to debug.

**Core constraint:** Data flows in a single direction: Action -> Dispatcher -> Store -> View.

- **Actions** are plain objects describing what happened (not what should happen).
- The **Dispatcher** is a singleton that broadcasts actions to all registered stores.
- **Stores** contain application state and logic. They respond to actions and emit change events.
- **Views** (React components) listen to stores and re-render when state changes.

The critical insight is that views never mutate stores directly. They dispatch actions, which the dispatcher routes to stores, which update and notify views. This eliminates circular dependencies between data and presentation.

### Redux (Abramov, 2015)

Redux refined Flux into three principles:

1. **Single source of truth.** The entire application state is stored in one object tree within a single store.
2. **State is read-only.** The only way to change state is to dispatch an action -- a plain object describing the change.
3. **Changes are made with pure functions.** Reducers are pure functions of the form `(previousState, action) -> newState`. They must not mutate the previous state, perform side effects, or call non-pure functions.

**Formal structure:**

```
State: S
Action: A = { type: string, payload?: any }
Reducer: R: (S, A) -> S
Store: { getState: () -> S, dispatch: (A) -> void, subscribe: (listener) -> unsubscribe }
```

**The reducer composition pattern:** Complex state trees are managed by composing reducers. Each reducer manages a subtree of the state. The root reducer delegates to child reducers by state key. This is a direct application of the algebraic property that the composition of pure functions is itself a pure function.

**Middleware** intercepts actions between dispatch and the reducer. This is where side effects (API calls, logging, analytics) are handled. The middleware signature `store => next => action => result` forms a pipeline that preserves the purity of reducers while enabling impure operations at a well-defined boundary.

**Limitations of Redux:**
- Boilerplate: action types, action creators, reducers, and selectors for every state change.
- Performance: naive implementations re-render on every state change; selectors and memoization are required.
- Async complexity: side effects require middleware (redux-thunk, redux-saga, redux-observable), each with a different mental model.

Redux Toolkit (RTK) addresses the boilerplate problem with `createSlice`, `createAsyncThunk`, and built-in Immer for immutable updates, but the underlying architecture remains the same.

---

## Server State Management

### The Stale-While-Revalidate Pattern

The `stale-while-revalidate` cache control directive (RFC 5861, Nottingham 2010) formalized a pattern that HTTP caches had used informally: serve stale content immediately while fetching fresh content in the background.

**Applied to client-side state**, this pattern means:
1. Return cached data instantly (stale but fast).
2. Initiate a background revalidation request.
3. When fresh data arrives, update the cache and re-render.

This eliminates the loading spinner for data that has been fetched before, providing perceived performance gains while maintaining eventual freshness.

### TanStack Query (formerly React Query)

TanStack Query models server state as a cache with automatic lifecycle management. Its key abstractions:

- **Query keys** identify cached data. Keys are serializable arrays that form a hierarchy (e.g., `['users', userId, 'posts']`).
- **Query functions** are the async functions that fetch data. The library manages invocation, caching, deduplication, and retry.
- **Stale time** (`staleTime`) defines how long data remains fresh. During this window, subsequent mounts use cached data without refetching.
- **Cache time** (`gcTime`) defines how long inactive data remains in memory before garbage collection.
- **Background refetching** occurs on window focus, network reconnect, interval, or manual trigger.

**Deduplication:** If multiple components mount simultaneously and request the same query key, only one network request is made. All subscribers receive the same result.

### SWR (Vercel)

SWR implements the same stale-while-revalidate pattern with a simpler API surface. Its `useSWR(key, fetcher)` hook returns `{ data, error, isLoading, isValidating, mutate }`. The `mutate` function enables both local cache updates and revalidation triggers.

Both TanStack Query and SWR solve the same fundamental problem: server state is not application state. It is a cache of remote data with its own lifecycle (stale, fresh, fetching, error, paused) that does not belong in a Redux store or React context.

---

## State Machines and Statecharts

### Finite State Machines

A finite state machine (FSM) is a quintuple `M = (Q, Sigma, delta, q0, F)` where:
- `Q` is a finite set of states.
- `Sigma` is a finite set of input symbols (events).
- `delta: Q x Sigma -> Q` is the transition function.
- `q0` is the initial state.
- `F` is the set of final (accepting) states.

Applied to UI engineering, FSMs eliminate impossible states by construction. A fetch operation modeled as a state machine with states `{idle, loading, success, error}` and transitions `{FETCH, RESOLVE, REJECT, RETRY}` makes it structurally impossible to be simultaneously loading and in an error state -- a bug that boolean flag management (`isLoading`, `isError`, `data`) permits trivially.

### Statecharts (Harel, 1987)

David Harel's statecharts extend FSMs with three mechanisms that make them practical for complex systems:

1. **Hierarchy (nested states).** A state may contain substates. The machine may be "in" a parent state and one of its children simultaneously. This enables abstraction: a `loggedIn` state may contain `dashboard`, `settings`, and `profile` substates without the parent needing to enumerate all leaf states.

2. **Orthogonality (parallel states).** A statechart may be in multiple states simultaneously across independent regions. A media player may be in `{playing, unmuted}` or `{paused, muted}` where the playback and volume axes are orthogonal.

3. **History states.** A state can remember which substate was last active and return to it. When a user navigates away from a wizard and returns, a history state restores them to their previous step.

**Guards** are boolean conditions on transitions. A transition fires only if its guard evaluates to true. **Actions** are side effects executed on transitions (or on state entry/exit). The combination of guards and actions with statecharts provides a complete behavioral specification.

XState is the predominant implementation of Harel statecharts in JavaScript. It represents machines as serializable JSON, enabling visualization, testing, and formal verification of UI behavior.

---

## Optimistic Updates with Conflict Resolution

### The Optimistic Update Pattern

An optimistic update assumes a mutation will succeed and updates the UI immediately, before the server confirms. If the server rejects the mutation, the UI rolls back to the previous state.

**Formal procedure:**
1. Snapshot the current state: `S_prev = cache.get(key)`.
2. Apply the mutation locally: `cache.set(key, applyMutation(S_prev, mutation))`.
3. Send the mutation to the server.
4. On success: optionally refetch to reconcile server-computed fields.
5. On failure: `cache.set(key, S_prev)` -- rollback to snapshot.

### Conflict Resolution Strategies

When multiple clients perform optimistic updates concurrently, conflicts arise. Resolution strategies include:

- **Last-write-wins (LWW).** The most recent write (by timestamp) overwrites all previous writes. Simple but lossy. Requires synchronized clocks or hybrid logical clocks (Kulkarni et al., 2014).
- **Operational Transformation (OT).** Transforms concurrent operations so they can be applied in any order and converge to the same state. Used by Google Docs. Complex to implement correctly -- the transformation functions must satisfy convergence properties (TP1, TP2).
- **CRDTs (Conflict-free Replicated Data Types).** Data structures with mathematically guaranteed convergence under concurrent updates. The merge function forms a join-semilattice: it is associative, commutative, and idempotent. See Shapiro et al. (2011). Used in Figma, linear, and other collaborative applications.
- **Application-level merge.** Present conflicts to the user for manual resolution (git-style). Appropriate when automatic resolution would lose semantic meaning.

### Versioning and Concurrency Control

**Optimistic concurrency control** attaches a version number or ETag to each resource. On update, the client sends its known version. The server rejects the update if the version has changed (`409 Conflict`), forcing the client to refetch and retry. This is the HTTP `If-Match` / `ETag` pattern.

---

## Persistence Strategies

### localStorage

- Synchronous, blocking API. Reads and writes block the main thread.
- ~5-10 MB limit per origin (browser-dependent).
- String-only values. Objects require `JSON.stringify` / `JSON.parse`, which is not free for large payloads.
- Survives page refreshes, tab closes, and browser restarts.
- **Use case:** Small, non-critical state. User preferences, theme selection, dismissed banners.

### sessionStorage

- Same API as localStorage but scoped to the browser tab.
- Cleared when the tab is closed.
- **Use case:** State that should not leak between tabs. Wizard progress, temporary auth tokens during OAuth flows.

### IndexedDB

- Asynchronous, transactional, structured storage.
- Significantly larger storage limits (hundreds of MB to GB).
- Supports indexes, cursors, and range queries on structured data.
- **Use case:** Offline-first applications, large datasets, binary data (Blobs). The persistence layer for libraries like Dexie.js, idb, and localForage.

### Choosing a Strategy

| Criterion | localStorage | sessionStorage | IndexedDB |
|-----------|-------------|----------------|-----------|
| Capacity | ~5-10 MB | ~5-10 MB | 100+ MB |
| API | Sync | Sync | Async |
| Data types | Strings | Strings | Structured, Blobs |
| Scope | Origin | Tab | Origin |
| Persistence | Permanent | Tab session | Permanent |
| Transactions | No | No | Yes |

---

## Derived State and Memoization

### Derived (Computed) State

Derived state is any value that can be computed from other state. It should never be stored independently because doing so creates a synchronization obligation: every update to the source state must also update the derived value, and failing to do so produces inconsistency.

**Principle:** If a value can be computed, compute it. Store the minimal canonical state and derive everything else.

**Examples:**
- `fullName` derived from `firstName` and `lastName`.
- `totalPrice` derived from `items` array.
- `filteredList` derived from `list` and `filterCriteria`.

### Memoization

Derivation has a cost. Recomputing derived values on every render is wasteful if the source data has not changed. Memoization caches the result of a computation and returns the cached value when the inputs are unchanged.

**Formal definition:** A memoized function `memo(f)` satisfies: if `memo(f)(x)` has been called and `x` has not changed (by reference equality or a custom comparator), return the cached result without invoking `f`.

**Selector pattern (Reselect / Redux):**

```
createSelector(
  [inputSelector1, inputSelector2, ...],
  resultFunction
)
```

Input selectors extract values from the state tree. The result function computes derived state from those values. The selector recomputes only when an input selector returns a new reference. This is structural memoization: the cache key is the identity of the inputs, not their deep equality.

**Pitfall:** Memoization assumes referential stability of inputs. If a new object or array is created on every render (e.g., inline `filter()` or `map()` in a selector input), memoization breaks. All intermediate computations must preserve reference identity when the underlying data has not changed.

---

## State Normalization

### The Problem

Nested or denormalized state creates multiple representations of the same entity. When a user's name appears in a `posts` array, a `comments` array, and a `friends` list, updating the name requires finding and updating every occurrence -- an O(n) operation that is error-prone and produces inconsistency when any occurrence is missed.

### The Normalization Pattern

Normalization borrows from relational database design (Codd, 1970). Entities are stored in flat lookup tables keyed by unique identifier. Relationships are expressed as references (IDs) rather than nested objects.

**Denormalized:**
```json
{
  "posts": [
    { "id": 1, "author": { "id": 42, "name": "Alice" }, "comments": [...] }
  ]
}
```

**Normalized:**
```json
{
  "entities": {
    "users": { "42": { "id": 42, "name": "Alice" } },
    "posts": { "1": { "id": 1, "authorId": 42, "commentIds": [101, 102] } },
    "comments": { "101": { "id": 101, "authorId": 42, "text": "..." } }
  }
}
```

**Benefits:**
- Single source of truth for each entity. Updates are O(1) by ID.
- No data duplication. Consistency is structural, not procedural.
- Efficient lookups by ID. Selectors compose entity references into denormalized views at the component level.

**Tooling:** `normalizr` (Abramov) automates the normalization and denormalization of nested API responses using schema definitions. Redux Toolkit's `createEntityAdapter` provides a standardized normalized state shape with built-in CRUD operations and sorted ID arrays.

---

## Practical Implications

1. **Classify state before choosing tools.** UI state belongs in component-local state (useState, useReducer). Server state belongs in a cache library (TanStack Query, SWR). URL state belongs in the router. Global application state (authentication, feature flags) belongs in a lightweight store. Putting everything in Redux is not architecture; it is abdication of design responsibility.

2. **Server state is not your state.** Treat API data as a cache with a TTL, not as a global store you manually keep synchronized. Libraries that model this correctly (TanStack Query, SWR, Apollo Client) eliminate entire categories of bugs: stale data after mutation, duplicate fetches, loading state management, and retry logic.

3. **Model complex flows as state machines.** Any workflow with more than three states and conditional transitions (onboarding flows, payment processing, multi-step forms) benefits from an explicit state machine. The machine definition serves as both documentation and runtime enforcement of valid transitions.

4. **Normalize early if entities are shared.** If the same entity appears in multiple places in the UI, normalize it in the store. The cost of normalization and selector-based denormalization is lower than the cost of inconsistency bugs in a denormalized structure.

5. **Memoize at the selector layer, not the component layer.** Component-level memoization (React.memo, useMemo) is a patch for poor state design. If selectors are well-structured and return referentially stable values, downstream components re-render only when their data actually changes.

6. **Optimistic updates require rollback plans.** Every optimistic mutation must have a defined rollback path. Snapshot the previous state, handle server rejection, and consider retry semantics. Without rollback, optimistic updates are simply bugs that happen to work most of the time.

7. **Persistence is not free.** Synchronizing state to localStorage or IndexedDB introduces serialization cost, storage limits, and schema migration obligations. Persist only what is necessary, version the schema, and handle deserialization failures gracefully (corrupt or outdated data).

8. **Derived state must not be stored.** Storing computed values alongside their sources creates synchronization debt. Compute derived values in selectors or computed properties. Memoize if the computation is expensive. Never store both `items` and `itemCount` in the same store.

---

## Common Misconceptions

1. **"Global state management is always needed."** Most applications need far less global state than developers assume. With server state handled by a cache library and UI state colocated in components, the remaining global state (auth, theme, feature flags) is often trivially small. Reaching for Redux or Zustand by default is premature architecture.

2. **"Immutability is slow because it copies everything."** Structural sharing ensures that immutable updates reuse unchanged subtrees. When updating one field of a deeply nested object, only the nodes on the path from root to the changed field are copied. Everything else shares references with the previous version. This is O(depth), not O(size).

3. **"State machines are overkill for UI."** State machines are precisely the right level of formalism for UI. The alternative -- ad hoc boolean flags -- produces exponential state spaces (n booleans produce 2^n possible states, most of which are invalid). State machines enumerate only valid states and transitions, reducing the state space by construction.

4. **"useEffect is for synchronizing state."** useEffect is for synchronizing React with external systems (DOM manipulation, subscriptions, network requests). Using useEffect to derive state from other state (the "state synchronization" anti-pattern) creates unnecessary render cycles and is a symptom of storing derived state instead of computing it.

5. **"Context is a state management solution."** React Context is a dependency injection mechanism, not a state management library. It provides no optimization for selective re-rendering: every consumer re-renders when the context value changes, regardless of which part of the value they use. Using Context for frequently changing state causes performance problems that are architectural, not incidental.

6. **"Optimistic updates are always better UX."** Optimistic updates are appropriate when the mutation is highly likely to succeed and the rollback UX is acceptable. For destructive operations (deleting data), financial transactions, or operations with complex server-side validation, a pessimistic approach (show loading, wait for confirmation) is safer and more honest.

7. **"Normalized state is always better."** Normalization has costs: selector complexity, loss of locality, and cognitive overhead. For small, read-heavy datasets that are never updated in place, denormalized state is simpler and sufficient. Normalize when entities are shared across views and updated independently.

---

## Further Reading

- **Abramov, D.** "You Might Not Need Redux" (2016) - The creator of Redux argues against its reflexive adoption. Essential reading for understanding when global state management is and is not warranted.
- **Harel, D.** "Statecharts: A Visual Formalism for Complex Systems" *Science of Computer Programming* 8(3), 231-274 (1987) - The foundational paper on statecharts. Introduces hierarchy, orthogonality, and history states.
- **Shapiro, M., Preguica, N., Baquero, C., & Zawirski, M.** "Conflict-Free Replicated Data Types" *Proc. 13th International Symposium on Stabilization, Safety, and Security of Distributed Systems (SSS)* (2011) - The formal definition and convergence proofs for CRDTs.
- **Codd, E.F.** "A Relational Model of Data for Large Shared Data Banks" *Communications of the ACM* 13(6), 377-387 (1970) - The paper that introduced normalization to data management. The principles apply directly to client-side state stores.
- **Nottingham, M.** "HTTP Cache-Control Extensions for Stale Content" RFC 5861 (2010) - Formalizes stale-while-revalidate and stale-if-error directives.
- **Kulkarni, S., Demirbas, M., Madeppa, D., Avva, B., & Leone, M.** "Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases" *Proc. 18th International Conference on Principles of Distributed Systems (OPODIS)* (2014) - Hybrid logical clocks for conflict resolution in distributed systems.
- **Gamma, E., Helm, R., Johnson, R., & Vlissides, J.** *Design Patterns: Elements of Reusable Object-Oriented Software* (1994) - The Observer and Mediator patterns underlie most state management architectures.
- **Ousterhout, J.** *A Philosophy of Software Design* (2018) - Chapters on complexity, deep modules, and information hiding apply directly to state management API design.
- **Kleppmann, M.** *Designing Data-Intensive Applications* (2017) - Chapters 5 (Replication), 7 (Transactions), and 12 (The Future of Data Systems) provide the distributed systems theory underlying server state synchronization.
- **Khourshid, D.** "State Machines in UI Development" (2019) - Practical application of Harel statecharts to frontend engineering using XState.
