# Architectural Anti-Patterns

## What This Prevents

Architectural anti-patterns are structural defects that compound over time. Unlike localized
code smells, they afflict the macro-level organization of a system, warping team topology,
deployment cadence, and cognitive load simultaneously. Left unaddressed, they transform
change from an engineering activity into an archaeological excavation. This document
catalogs six canonical architectural anti-patterns drawn from peer-reviewed and
practitioner literature, providing detection heuristics, causal analysis, measured harms,
recovery paths, and prevention strategies suitable for systems at any scale.

Every anti-pattern below follows a common template:

1. **Description** -- formal definition and canonical reference.
2. **Why It Happens** -- root-cause analysis across organizational and technical axes.
3. **Detection Signals** -- observable symptoms in code, metrics, and team behavior.
4. **Recovery Path** -- incremental refactoring strategy with checkpoints.
5. **Prevention Strategy** -- architectural and process guardrails.

---

## 1. Big Ball of Mud

### Description

Foote and Yoder (1997) define the Big Ball of Mud as "a haphazardly structured, sprawling,
sloppy, duct-tape-and-bailing-wire, spaghetti-code jungle." It is a system that lacks
discernible architecture: no clear module boundaries, no enforced layering, no separation
of concerns. The term was introduced specifically to acknowledge that this is the most
commonly deployed software architecture in the world -- not because engineers choose it,
but because they drift into it under sustained schedule pressure.

### Why It Happens

- **Piecemeal growth.** Features are added to the nearest convenient location rather than
  to a structurally appropriate module, because the cost of proper placement exceeds the
  sprint's time budget.
- **Absence of architectural ownership.** When no individual or team holds authority over
  system structure, local optimizations accumulate into global incoherence.
- **Throwaway code that persists.** Prototypes intended for validation become load-bearing
  production components because rewriting is never prioritized.
- **Inadequate onboarding.** New engineers, unable to discern implicit structure, extend
  the system in ways that further erode whatever boundaries existed.

### Detection Signals

- Cyclomatic dependency depth exceeds three layers in any direction (measurable via
  dependency analysis tools such as Structure101, NDepend, or `madge`).
- A single change to one domain concept requires modifications in five or more files
  across three or more directories.
- No engineer on the team can draw the system's module dependency graph from memory or
  from documentation -- because neither exists.
- Build times grow super-linearly with codebase size, indicating absence of compilation
  unit boundaries.
- Test suites require the entire system to be running; there are no unit-level isolation
  boundaries.

### Recovery Path

1. **Identify seams.** Use Michael Feathers' concept of seams (Feathers, 2004, *Working
   Effectively with Legacy Code*) to find points where behavior can be altered without
   editing existing code.
2. **Strangle fig migration.** Introduce a facade at each seam; route new traffic through
   the facade while old code remains operational behind it. Incrementally replace the
   internals.
3. **Enforce bounded contexts.** Apply Domain-Driven Design (Evans, 2003) to define
   explicit context boundaries. Each bounded context gets its own module or service with
   a published contract.
4. **Automate boundary enforcement.** Use ArchUnit (Java), `dependency-cruiser` (JS/TS),
   or custom lint rules to make boundary violations fail CI.

### Prevention Strategy

- Require an Architecture Decision Record (ADR) for any cross-boundary dependency.
- Enforce module boundaries in CI with static analysis.
- Designate an architectural owner per bounded context.
- Schedule quarterly architecture review sessions with the explicit goal of identifying
  boundary erosion.

---

## 2. Distributed Monolith

### Description

A distributed monolith is a system that has adopted the operational complexity of
microservices -- separate deployment units, network boundaries, serialization overhead --
without achieving any of the independence benefits. Services are coupled at the data layer,
the API contract layer, or both, requiring lockstep deployments.

### Why It Happens

- **Service boundaries drawn along technical layers** (e.g., "the database service," "the
  API service") rather than along business capabilities, violating Conway's Law.
- **Shared database schemas.** Multiple services read from and write to the same tables,
  creating implicit coupling that no API contract can abstract away.
- **Synchronous RPC chains.** Service A calls B calls C calls D in a synchronous chain;
  any single failure cascades, and all four services must be deployed together to maintain
  compatibility.
- **Premature decomposition.** Teams split a monolith before understanding domain
  boundaries, producing services that mirror the original monolith's internal structure.

### Detection Signals

- Deployments require coordinating more than one service simultaneously.
- A schema migration in one service's database breaks another service.
- Latency traces show synchronous fan-out depth greater than two hops for common
  operations.
- Teams report they "can't deploy independently" despite having separate repositories.
- Shared libraries contain business logic, not just utilities.

### Recovery Path

1. **Map coupling.** Construct a service dependency matrix. Identify clusters of services
   that always deploy together -- these are candidates for re-merging.
2. **Re-merge first.** It is often faster to merge tightly coupled services back into a
   well-structured modular monolith and then re-decompose correctly than to untangle
   them in place.
3. **Introduce asynchronous boundaries.** Replace synchronous RPC with event-driven
   communication (domain events via a message broker) where temporal coupling is not
   required.
4. **Enforce database isolation.** Each service owns its schema exclusively. Cross-service
   data access occurs only through published APIs or event streams.

### Prevention Strategy

- Apply the "can this team deploy independently?" litmus test before approving any new
  service boundary.
- Mandate that shared libraries contain only pure utility code (serialization, logging,
  observability) -- never domain logic.
- Use consumer-driven contract testing (Pact) to detect coupling at the API layer.

---

## 3. God Object

### Description

The God Object (also God Class) is a single class or module that accumulates
disproportionate responsibility, violating the Single Responsibility Principle (Martin,
2003). It typically knows about or controls most of the system's behavior, creating a
gravitational well that attracts further additions because "it already has access to
everything needed."

### Why It Happens

- **Convenience-driven development.** Adding a method to an existing class with broad
  access is cheaper in the short term than creating a new class with proper dependencies.
- **Lack of domain modeling.** When engineers think in terms of "the app" rather than
  discrete domain concepts, a single class becomes the app's avatar.
- **Fear of creating new files.** In codebases without clear module conventions, engineers
  hesitate to introduce new abstractions.

### Detection Signals

- A single class exceeds 1,000 lines or has more than 20 public methods.
- The class is imported by more than 40% of the codebase's modules.
- Merge conflicts in the class occur on more than 30% of pull requests.
- The class name contains generic terms: `Manager`, `Handler`, `Processor`, `Service`,
  `Utils`, `Helper`.

### Recovery Path

1. **Identify responsibility clusters.** Group the class's methods by the domain concept
   they operate on.
2. **Extract collaborators.** For each cluster, create a new class that encapsulates that
   concern. The God Object delegates to the new collaborator.
3. **Invert dependencies.** Apply dependency inversion so that callers depend on
   abstractions (interfaces), not on the God Object directly.
4. **Delete forwarding methods.** Once all callers use the extracted classes directly,
   remove the delegation layer from the former God Object.

### Prevention Strategy

- Enforce maximum class size via linter rules (e.g., 300 lines as a soft cap).
- Require domain model review for any class that grows beyond 500 lines.
- Use the "newspaper metaphor" (Clean Code, Martin 2008): a class should read like a
  single article about one topic, not an entire newspaper.

---

## 4. Shared Database Anti-Pattern

### Description

Multiple applications or services read from and write to the same database schema without
an intermediary API layer. The schema becomes a de facto integration contract, but one
that is never versioned, tested for compatibility, or governed by a single owner. Hohpe
and Woolf (2003) identify this as the most pernicious form of integration coupling.

### Why It Happens

- **Speed of initial integration.** Direct database access is the fastest way to share
  data between two systems -- requiring zero new code for the provider.
- **Absence of API discipline.** Teams that lack API design skills or tooling default to
  the database as a communication channel.
- **Legacy migration pressure.** When replacing a monolith, teams often let new services
  read from the monolith's database "temporarily," and that temporariness becomes
  permanent.

### Detection Signals

- Multiple applications hold credentials to the same database.
- Schema migrations require impact analysis across team boundaries.
- A column rename or type change in one service causes runtime failures in another.
- No single team can explain the full read/write pattern for a given table.

### Recovery Path

1. **Audit access patterns.** Instrument the database to log which application performs
   which queries against which tables.
2. **Assign table ownership.** Each table is owned by exactly one service. Other services
   must request access through that owner's API.
3. **Introduce read replicas or views.** As a transitional step, create read-only views
   or materialized views that other services can consume while APIs are being built.
4. **Migrate consumers to APIs.** One consumer at a time, replace direct database access
   with API calls or event subscriptions.

### Prevention Strategy

- Enforce a policy: one service, one schema, one set of credentials.
- Use network-level controls (security groups, firewall rules) to prevent unauthorized
  database access.
- Require an ADR for any proposed cross-service database access.

---

## 5. Premature Abstraction

### Description

Premature abstraction is the introduction of generalization before sufficient concrete
instances exist to justify it. Sandi Metz (2014) captures this as "duplication is far
cheaper than the wrong abstraction." The anti-pattern manifests as interfaces with a
single implementation, generic frameworks built for one use case, and inheritance
hierarchies designed for hypothetical future requirements.

### Why It Happens

- **DRY misapplication.** Engineers interpret Don't Repeat Yourself as "never write
  similar code twice," rather than its intended meaning of "every piece of knowledge
  should have a single, unambiguous representation."
- **Resume-driven development.** Engineers introduce patterns (Strategy, Visitor,
  Abstract Factory) to demonstrate mastery rather than to solve a present problem.
- **Speculative generality.** Product uncertainty is translated into code flexibility
  via parameterization, configuration layers, and plugin architectures that are never
  exercised.

### Detection Signals

- Interfaces or abstract classes with exactly one concrete implementation and no
  foreseeable second.
- Configuration systems that are more complex than the behavior they configure.
- Engineers cannot articulate a concrete second use case for a generalization.
- Code navigation requires traversing more than three levels of indirection to reach
  actual behavior.
- The phrase "we might need this later" appears in code review comments as
  justification.

### Recovery Path

1. **Inline the abstraction.** Replace the interface with its single implementation.
   Delete the indirection layer.
2. **Apply the Rule of Three.** Wait until three concrete, distinct instances of similar
   code exist before extracting a shared abstraction.
3. **Prefer composition over inheritance.** When abstraction is warranted, favor
   composing small, concrete objects over building deep inheritance trees.
4. **Make the implicit explicit.** If an abstraction hides important domain semantics,
   replace it with named, domain-specific constructs.

### Prevention Strategy

- Adopt the Rule of Three as a team norm: no abstraction until three concrete uses exist.
- In code review, require that every interface or abstract class be accompanied by a
  justification citing at least two known, distinct consumers.
- Favor duplication over premature generalization in early-stage code.

---

## 6. Anemic Domain Model

### Description

Fowler (2003) defines the Anemic Domain Model as a domain model composed of classes that
contain only data (getters and setters) with no behavior. All business logic resides in
separate "service" classes that operate on the anemic objects, effectively recreating
procedural programming in an object-oriented language. The domain objects are reduced to
data transfer objects with domain-sounding names.

### Why It Happens

- **Framework-driven design.** ORMs and serialization frameworks encourage plain data
  objects, and engineers extend this pattern to the entire domain layer.
- **Transaction script habit.** Engineers trained in procedural or script-oriented
  paradigms naturally gravitate toward service classes that manipulate passive data.
- **Separation of concerns misunderstanding.** Teams interpret "separate data from logic"
  as a design principle, when the actual principle is "separate concerns," which in DDD
  means co-locating data with the behavior that governs it.

### Detection Signals

- Domain classes contain only fields, getters, setters, and possibly `toString()` or
  `equals()` methods -- no business methods.
- Service classes contain conditional logic that inspects domain object state to make
  decisions (feature envy smell).
- The same validation logic is duplicated across multiple services because the domain
  object does not enforce its own invariants.
- Domain objects can be constructed in invalid states because construction is not
  guarded by the object itself.

### Recovery Path

1. **Identify behavioral candidates.** For each service method, ask: "Does this logic
   belong to the entity it operates on?" If yes, move it.
2. **Push invariants into constructors.** Make it impossible to create a domain object
   in an invalid state by validating in the constructor or factory method.
3. **Replace getters with intention-revealing methods.** Instead of `order.getStatus()`,
   provide `order.isShippable()`, encoding the business rule inside the entity.
4. **Introduce value objects.** Extract primitive fields (email, money, date ranges)
   into value objects that encapsulate their own validation and behavior.

### Prevention Strategy

- Require that domain classes contain at least one behavior method beyond accessors.
- Use code review checklists that flag "service classes with more than five methods
  operating on the same entity" as candidates for behavior migration.
- Train teams in Domain-Driven Design tactical patterns (entities, value objects,
  aggregates, domain events).

---

## Practical Implications

These six anti-patterns interact. A Big Ball of Mud often contains God Objects operating
on Anemic Domain Models via a Shared Database. A Distributed Monolith frequently arises
from Premature Abstraction of service boundaries. Detection and recovery must therefore
be systemic -- addressing one anti-pattern in isolation may simply shift entropy to
another.

The engineering evaluation rubric (see `../eval/`) penalizes these anti-patterns
explicitly. Architecture scores of 8+ require demonstrable absence of all six patterns.
Scores below 5 indicate the presence of two or more in load-bearing paths.

---

## Further Reading

- Foote, B., & Yoder, J. (1997). "Big Ball of Mud." *Pattern Languages of Program Design 4*.
- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.
- Fowler, M. (2003). "AnemicDomainModel." martinfowler.com.
- Feathers, M. (2004). *Working Effectively with Legacy Code*. Prentice Hall.
- Martin, R. C. (2003). *Agile Software Development: Principles, Patterns, and Practices*. Prentice Hall.
- Martin, R. C. (2008). *Clean Code*. Prentice Hall.
- Hohpe, G., & Woolf, B. (2003). *Enterprise Integration Patterns*. Addison-Wesley.
- Metz, S. (2014). "The Wrong Abstraction." sandimetz.com.
- Newman, S. (2021). *Building Microservices*, 2nd ed. O'Reilly.
- Richards, M., & Ford, N. (2020). *Fundamentals of Software Architecture*. O'Reilly.
