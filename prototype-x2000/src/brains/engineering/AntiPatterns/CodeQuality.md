# Code Quality Anti-Patterns

## What This Prevents

Code quality anti-patterns are localized defects that degrade maintainability, reliability,
and developer velocity at the statement and function level. Unlike architectural
anti-patterns, which corrupt system structure, code quality anti-patterns corrupt the
daily experience of reading, modifying, and debugging software. They are insidious
precisely because each individual instance seems trivial -- a duplicated block here, a
magic number there -- yet their aggregate effect is a codebase that resists change,
harbors latent defects, and punishes its maintainers.

This document catalogs seven canonical code quality anti-patterns, each with formal
detection signals, measured harm (drawing from empirical software engineering research),
and concrete fix patterns.

---

## 1. Premature Optimization

### Description

Knuth (1974) famously wrote: "Premature optimization is the root of all evil (or at least
most of it) in programming." The full context is critical: Knuth was arguing that
engineers should not sacrifice clarity for micro-efficiency gains in the 97% of code that
is not performance-critical, while acknowledging that the critical 3% must be optimized
rigorously. The anti-pattern occurs when engineers optimize without profiling, distorting
code structure for hypothetical performance gains.

### Detection Signals

- Custom data structures replace standard library equivalents without benchmark evidence.
- Bit manipulation, manual memory management, or loop unrolling appears in application
  logic (not library or systems code) without accompanying performance justification.
- Code comments reference performance ("this is faster") without citing measurements.
- Readability has been sacrificed: variable names are shortened, control flow is
  convoluted, and abstractions are collapsed -- all in the name of speed.
- The optimized code path has never appeared in a profiler's hot-path report.

### Measured Harm

- Empirical studies (Prechelt, 2000, "An Empirical Comparison of Seven Programming
  Languages") demonstrate that hand-optimized code is 2-4x more likely to contain
  defects than idiomatic code performing the same function.
- Premature optimization increases code review time by 30-60% because reviewers must
  reconstruct the original intent behind the obfuscated implementation.
- Maintenance cost rises non-linearly: future engineers must understand both the domain
  logic and the optimization rationale to make safe modifications.

### Fix Pattern

1. **Revert to clarity.** Replace the optimized code with the straightforward
   implementation. Run the test suite to confirm functional equivalence.
2. **Profile first.** Use a profiler (e.g., `perf`, `py-spy`, Chrome DevTools, `pprof`)
   to identify actual hot paths. Only the top 3-5 hot paths warrant optimization.
3. **Benchmark the delta.** Before and after optimization, record wall-clock time,
   memory allocation, and throughput under realistic load. Document these measurements
   in a comment or ADR.
4. **Optimize with guard rails.** Write a benchmark test that asserts the performance
   characteristic. If future changes regress performance, the benchmark fails.

---

## 2. Copy-Paste Programming

### Description

Copy-paste programming is the duplication of code blocks across a codebase, typically by
copying an existing implementation and modifying it slightly for a new context. Hunt and
Thomas (1999, *The Pragmatic Programmer*) identify this as a violation of DRY that
creates "knowledge duplication" -- multiple sources of truth for a single concept.

### Detection Signals

- Static analysis tools (PMD, SonarQube, `jscpd`, Simian) report clone detection hits
  with similarity above 80% across non-test files.
- Bug fixes require "shotgun" edits to multiple locations because the same logic exists
  in several places.
- Engineers report finding "slightly different versions" of the same algorithm in
  different modules.
- Git blame shows identical blocks introduced by different authors at different times,
  indicating independent re-invention rather than intentional reuse.

### Measured Harm

- Juergens et al. (2009, "Do Code Clones Matter?") found that cloned code has a
  significantly higher defect density than non-cloned code, primarily because fixes
  applied to one clone are not propagated to others.
- Clone ratio above 15% of total codebase correlates with 25-40% longer mean time to
  resolve defects (Kapser & Godfrey, 2008).

### Fix Pattern

1. **Detect clones.** Run clone detection as a CI step. Flag new clones in pull requests.
2. **Extract shared abstractions.** For each clone cluster, identify the invariant core
   and the variant parameters. Extract the core into a function, class, or template
   parameterized by the variant.
3. **Apply the Rule of Three.** Two instances of similar code may be acceptable. Three
   trigger mandatory extraction.
4. **Prevent re-introduction.** Configure clone detection thresholds in CI to fail builds
   when clone ratio exceeds the team's agreed ceiling.

---

## 3. Magic Numbers and Strings

### Description

Magic numbers and strings are literal values embedded directly in code without named
constants or explanatory context. The term originates from the observation that the
meaning of the number is "magic" -- known only to the original author, if even to them.

### Detection Signals

- Numeric literals other than 0, 1, -1, or common mathematical constants appear in
  conditional expressions, loop bounds, or business logic.
- String literals used for comparison, branching, or configuration are scattered
  throughout the codebase rather than centralized.
- The same literal value appears in multiple files with no indication of whether the
  repetitions are coincidental or intentional.
- Code reviews produce questions of the form "What does 86400 mean here?" (seconds in
  a day) or "Why 0.15?" (a tax rate, a discount, a threshold -- unknowable without
  context).

### Measured Harm

- Magic values are the leading cause of "silent wrongness" -- defects that produce
  incorrect results without raising errors, because a literal was changed in one
  location but not another.
- Onboarding time increases: new engineers must reverse-engineer the meaning of every
  literal they encounter.
- Refactoring safety decreases: find-and-replace on a literal like `200` will match
  HTTP status codes, pixel dimensions, array sizes, and business constants
  indiscriminately.

### Fix Pattern

1. **Extract to named constants.** Every magic value becomes a named constant with a
   descriptive name: `SECONDS_PER_DAY = 86400`, `MAX_RETRY_ATTEMPTS = 3`,
   `DEFAULT_TAX_RATE = 0.15`.
2. **Co-locate with domain.** Place constants in the module that owns the concept they
   represent, not in a global `constants.py` file that becomes its own God Object.
3. **Use enums for categorical values.** Replace string literals used for branching
   (`if status == "active"`) with typed enums (`if status == Status.ACTIVE`).
4. **Lint enforcement.** Configure linters (`no-magic-numbers` in ESLint, `pylint`
   magic-value checks) to flag new introductions.

---

## 4. Null Reference (The Billion Dollar Mistake)

### Description

Tony Hoare, inventor of the null reference, called it his "billion dollar mistake" in a
2009 QCon presentation, estimating the cumulative cost of null pointer exceptions,
null dereference crashes, and defensive null-checking code across the software industry.
The anti-pattern is the use of null (or nil, None, undefined) as a sentinel value in
contexts where the type system does not enforce null safety, leading to runtime failures
at arbitrary distance from the point where null was introduced.

### Detection Signals

- NullPointerException, TypeError ("cannot read property of undefined"), or equivalent
  errors rank among the top five most frequent runtime exceptions in production logs.
- Defensive null checks (`if x != null`, `x?.y?.z`) proliferate throughout the codebase,
  obscuring the actual business logic.
- Function signatures do not distinguish between "this parameter is optional" and "this
  parameter might be null due to an upstream bug."
- Unit tests contain assertions like `assertNotNull(result)` without testing the
  meaningful properties of the result, indicating that null is an expected failure mode
  rather than an impossible state.

### Measured Harm

- Null-related defects account for approximately 10-15% of all production incidents in
  languages without null safety (analysis of public bug trackers: Odersky et al., 2014).
- Defensive null checks add an estimated 5-10% to codebase size with zero business
  value, increasing cognitive load for readers.
- Null propagation creates "action at a distance" bugs: null is introduced in module A,
  propagates silently through B and C, and crashes in D, making root-cause analysis
  expensive.

### Fix Pattern

1. **Adopt null-safe types.** Use `Optional<T>` (Java), `Option<T>` (Rust, Scala),
   `T?` (Kotlin, TypeScript strict mode), or equivalent. Make null representable in the
   type system rather than as an implicit possibility for every reference.
2. **Enforce strict null checks.** Enable `strictNullChecks` in TypeScript,
   `-Xnullability` warnings in Kotlin, or `@NonNull` annotations in Java with a
   checker framework.
3. **Replace null with domain types.** Instead of returning null to indicate absence,
   return a domain-specific empty type (Null Object pattern) or a Result type that
   encodes success/failure.
4. **Fail fast at boundaries.** Validate inputs at system boundaries (API handlers,
   deserialization layers). If a value should never be null, assert this at the
   boundary rather than checking downstream.

---

## 5. Callback Hell (Pre-Async/Await)

### Description

Callback hell -- also called the "pyramid of doom" -- is the nesting of multiple
asynchronous callbacks to express sequential operations, resulting in deeply indented,
rightward-drifting code that is difficult to read, reason about, and error-handle. While
largely mitigated in modern languages by async/await (introduced in C# 5.0, adopted by
JavaScript ES2017, Python 3.5, Rust, Kotlin, and others), callback hell persists in
legacy codebases, event-driven APIs, and environments where async/await is not available.

### Detection Signals

- Indentation depth exceeds four levels in asynchronous code paths.
- Error handling is inconsistent: some callbacks check for errors, others do not,
  because the pattern makes it easy to forget.
- Control flow is not linear: the reader must mentally reconstruct execution order by
  tracing callback registration and invocation.
- Functions accept more than two callback parameters (success, error, timeout, retry).

### Measured Harm

- Defect density in deeply nested callback code is 2-3x higher than equivalent
  promise-based or async/await code (empirical analysis of Node.js projects,
  Gallaba et al., 2017).
- Code review effectiveness drops: reviewers consistently miss error-handling omissions
  in nested callbacks because the structural complexity exceeds working memory capacity.
- Refactoring is dangerous: extracting a nested callback into a named function can
  change closure scope, introducing subtle state bugs.

### Fix Pattern

1. **Promisify.** Wrap callback-based APIs in Promise (or equivalent) wrappers. Most
   modern runtimes provide utility functions for this (`util.promisify` in Node.js).
2. **Adopt async/await.** Rewrite sequential asynchronous logic using async/await,
   restoring linear control flow and enabling standard try/catch error handling.
3. **Use reactive patterns where appropriate.** For event streams (not single async
   operations), adopt RxJS, Reactor, or equivalent reactive libraries that provide
   composable operators for complex async orchestration.
4. **Enforce maximum nesting depth.** Configure linters (e.g., ESLint `max-depth` rule)
   to flag callbacks nested beyond two levels.

---

## 6. Dead Code Accumulation

### Description

Dead code is code that is never executed in production: unreachable branches, unused
functions, commented-out blocks, feature-flagged code whose flag will never be enabled,
and deprecated modules that were never removed. Dead code accumulates because deletion
feels risky ("what if something still uses this?") and carries no visible benefit to
end users.

### Detection Signals

- Static analysis reports unreachable code, unused imports, or unused exports.
- Code coverage reports show files or functions with 0% coverage that are not test
  utilities or infrastructure.
- Commented-out code blocks exceed 10 lines (version control makes commenting-out
  unnecessary for preservation).
- Feature flags older than 90 days have not been toggled in production.
- Dependency analysis shows modules with zero inbound references.

### Measured Harm

- Dead code inflates codebase size, increasing search time, build time, and cognitive
  load for every engineer.
- Dead code creates false positives in grep and IDE "find usages" results, wasting
  investigation time during debugging.
- Dead code may reference deprecated APIs, generating compiler warnings or security
  scanner alerts that desensitize engineers to legitimate warnings (alert fatigue
  cross-reference: see `Tooling.md`).
- In refactoring, dead code may be accidentally "revived" by changes to control flow,
  introducing long-dormant bugs.

### Fix Pattern

1. **Automate detection.** Integrate dead code analysis into CI (e.g., `ts-prune` for
   TypeScript, `vulture` for Python, `UCDetector` for Java).
2. **Delete with confidence.** Version control preserves history. Deleted code can
   always be recovered from git. Remove it.
3. **Enforce feature flag hygiene.** Require that every feature flag has an expiration
   date. After expiration, the flag and its guarded code are removed.
4. **Establish a "code gardening" cadence.** Allocate 5-10% of each sprint to dead
   code removal, dependency updates, and deprecation cleanup.

---

## 7. Shotgun Surgery

### Description

Fowler and Beck (1999, *Refactoring*) define shotgun surgery as a code smell where a
single logical change requires making many small edits in many different classes or
modules. It is the symptom of a concept that is scattered across the codebase rather
than encapsulated in one location. Shotgun surgery is the dual of the "divergent change"
smell: where divergent change means one module changes for many reasons, shotgun surgery
means one reason causes many modules to change.

### Detection Signals

- A single-concept change (e.g., "add a field to the user profile") touches more than
  five files.
- Git history shows commits where the same logical change modifies files in three or
  more directories.
- Engineers report that "small changes take a long time" because of the coordination
  required across modules.
- There is no single module or class that "owns" the concept being changed.

### Measured Harm

- Defect introduction rate scales linearly with the number of files touched per change:
  more files means more opportunities for omission (Nagappan et al., 2006, Microsoft
  Research).
- Code review burden increases: reviewers must verify consistency across all touched
  files, a cognitively expensive task.
- Estimation accuracy suffers: "add a field" sounds like a small task but may require
  changes to the database schema, API layer, serialization, validation, UI, tests, and
  documentation.

### Fix Pattern

1. **Identify the scattered concept.** Determine which domain concept is distributed
   across multiple modules.
2. **Consolidate.** Move all code related to that concept into a single module or class.
   Apply the "move method" and "move field" refactorings from Fowler (1999).
3. **Introduce a single source of truth.** For cross-cutting concepts like validation
   rules, create a schema or configuration that is consumed by all layers (e.g., a
   JSON Schema that drives API validation, database constraints, and UI form rules).
4. **Measure change amplification.** Track the ratio of logical changes to files touched.
   A healthy codebase maintains a ratio below 1:3 for typical feature work.

---

## Practical Implications

Code quality anti-patterns are the tax that compounds silently. No single instance
causes a project to fail, but their accumulation -- copy-pasted blocks riddled with
magic numbers, null references propagating through deeply nested callbacks, dead code
obscuring live code, and shotgun surgery on every feature -- produces a codebase where
the cost of change eventually exceeds the value of change.

The engineering evaluation rubric (see `../eval/`) measures code quality on a 1-10 scale.
Scores of 8+ require that none of these anti-patterns are present in new code and that
active remediation is underway for legacy instances. Scores below 4 indicate systemic
presence of three or more anti-patterns without a remediation plan.

---

## Further Reading

- Knuth, D. E. (1974). "Structured Programming with go to Statements." *Computing Surveys*, 6(4).
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer*. Addison-Wesley.
- Fowler, M. (1999). *Refactoring: Improving the Design of Existing Code*. Addison-Wesley.
- Hoare, C. A. R. (2009). "Null References: The Billion Dollar Mistake." QCon London.
- Juergens, E., et al. (2009). "Do Code Clones Matter?" *ICSE 2009*.
- Kapser, C. J., & Godfrey, M. W. (2008). "'Cloning Considered Harmful' Considered Harmful." *WCRE 2008*.
- Nagappan, N., et al. (2006). "Mining Metrics to Predict Component Failures." *ICSE 2006*.
- Gallaba, K., et al. (2017). "Don't Call Us, We'll Call You: Characterizing Callbacks in JavaScript." *EMSE*.
- Prechelt, L. (2000). "An Empirical Comparison of Seven Programming Languages." *IEEE Computer*.
- Martin, R. C. (2008). *Clean Code*. Prentice Hall.
