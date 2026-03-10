# Refactoring Patterns

## What This Enables

Refactoring is the disciplined technique of restructuring existing code without altering its observable behavior. Mastery of refactoring patterns enables engineers to continuously improve internal code quality, reduce accumulated technical debt, and maintain long-term system evolvability. This document synthesizes the foundational work of Fowler (1999, 2018), Feathers (2004), and the SQALE method into an actionable reference for principal-level engineering decisions. It covers the canonical code smell taxonomy, the core refactoring catalog, strategies for legacy system migration, technical debt quantification, and the critical judgment of when refactoring is inappropriate.

---

## Fowler's Definition and Taxonomy

### The Dual Definition

Martin Fowler established the authoritative definition of refactoring in *Refactoring: Improving the Design of Existing Code* (1999), refined in the second edition (2018):

- **As a noun:** A change made to the internal structure of software to make it easier to understand and cheaper to modify without changing its observable behavior.
- **As a verb:** To restructure software by applying a series of refactorings without changing its observable behavior.

The critical constraint is **behavior preservation**. A change that alters external semantics is not a refactoring; it is a rewrite, a feature change, or a bug fix. This distinction is non-negotiable. Refactoring operates under the invariant that all existing tests continue to pass after every atomic transformation.

### Fowler's Taxonomy (2018 Edition)

Fowler organizes refactorings into six categories reflecting the structural dimension they address:

1. **Basic Refactorings** -- Extract Function, Inline Function, Extract Variable, Rename Variable, Encapsulate Variable, Introduce Parameter Object.
2. **Encapsulation** -- Encapsulate Record, Encapsulate Collection, Replace Primitive with Object, Replace Temp with Query.
3. **Moving Features** -- Move Function, Move Field, Move Statements into Function, Split Loop, Replace Loop with Pipeline.
4. **Organizing Data** -- Split Variable, Rename Field, Replace Derived Variable with Query.
5. **Simplifying Conditional Logic** -- Decompose Conditional, Consolidate Conditional Expression, Replace Nested Conditional with Guard Clauses, Replace Conditional with Polymorphism.
6. **Refactoring APIs** -- Separate Query from Modifier, Parameterize Function, Remove Flag Argument, Preserve Whole Object.

Each refactoring is specified as a mechanical procedure: motivation, mechanics (step-by-step), and example. This mechanical nature is what makes refactoring safe -- each step is small enough to verify independently.

---

## Code Smell Catalog

Code smells are heuristic indicators that the code may benefit from refactoring. They are not bugs; they are structural symptoms of design degradation. The following catalog draws from Fowler (1999, 2018), Beck's contributions in Fowler's original text, and Wake (2003).

### Long Method

A method that has grown beyond cohesive responsibility. Empirical studies (Abbes et al., 2011) demonstrate that methods exceeding approximately 20--30 lines of executable code impose measurable cognitive load penalties. Long methods resist comprehension, testing, and reuse. Primary remedy: **Extract Method**, guided by identifying semantic clusters of statements that operate on a shared conceptual purpose.

### Large Class

A class that has accumulated too many responsibilities, violating the Single Responsibility Principle (Martin, 2003). Symptoms include many instance variables, many methods, and duplicated code across methods. Remedies include **Extract Class** to split along responsibility boundaries and **Extract Subclass** when responsibilities align with type hierarchies.

### Feature Envy

A method that references data or methods of another class more than its own. This smell indicates misplaced behavior -- the method belongs in the class it envies. Remedy: **Move Function** to the class whose data the method predominantly accesses.

### Data Clumps

Groups of data items that repeatedly appear together across method signatures, constructors, or field declarations (e.g., `startDate` and `endDate` appearing as separate parameters in multiple methods). Remedy: **Introduce Parameter Object** or **Extract Class** to encapsulate the clump into a first-class abstraction.

### Primitive Obsession

Using primitive types (strings, integers, floats) to represent domain concepts that warrant their own types -- currency amounts as floats, phone numbers as strings, status codes as integers. This forfeits type safety, domain semantics, and validation encapsulation. Remedy: **Replace Primitive with Object** (Fowler 2018) or **Replace Type Code with Subclasses**.

### Switch Statements (Repeated Conditional Logic)

Repeated switch or if-else chains that dispatch on type codes. When the same conditional structure appears in multiple locations, adding a new case requires modifying every occurrence -- a violation of the Open-Closed Principle. Remedy: **Replace Conditional with Polymorphism**, introducing a class hierarchy where each case becomes a subclass with its own overridden method.

### Parallel Inheritance Hierarchies

A special case of Shotgun Surgery: every time you create a subclass of one hierarchy, you must create a corresponding subclass in another. This indicates that two hierarchies are coupled and should be merged or mediated. Remedy: **Move Method** and **Move Field** to collapse one hierarchy into the other.

### Lazy Class

A class that does too little to justify its existence -- perhaps reduced by prior refactorings or created speculatively. Maintaining every class has a cost (cognitive overhead, indirection, file management). Remedy: **Inline Class** to absorb it into its only client, or **Collapse Hierarchy** if it adds no behavior over its superclass.

### Speculative Generality

Abstractions, hooks, parameters, or class hierarchies introduced to handle future requirements that never materialized. This violates YAGNI (You Ain't Gonna Need It). Speculative generality increases surface area and cognitive load without delivering value. Remedy: **Collapse Hierarchy**, **Inline Function**, **Inline Class**, or **Remove Dead Code**.

### Temporary Field

Instance variables that are set only under certain circumstances and are undefined or null otherwise. Their existence misleads readers into believing they are always meaningful. Remedy: **Extract Class** to house the temporary field alongside the code that uses it, or **Introduce Special Case** (Null Object pattern) to eliminate null checks.

### Message Chains

A client asks object A for object B, then asks B for object C, then asks C for something -- creating a chain of coupled navigational dependencies (`a.getB().getC().doThing()`). This couples the client to the entire chain structure. Remedy: **Hide Delegate** to provide a direct method on A, or **Extract Function** to encapsulate the chain traversal.

### Middle Man

The opposite of Message Chains: a class whose methods do nothing but delegate to another object. When more than half of a class's methods are pure delegation, the class is an unnecessary intermediary. Remedy: **Remove Middle Man** to let clients talk to the delegate directly, or **Inline Function** for individual delegating methods.

### Divergent Change

A single class that must be modified for multiple unrelated reasons -- e.g., it changes when the database schema changes *and* when the UI requirements change. This indicates the class conflates multiple responsibilities. Remedy: **Extract Class** to separate each axis of change into its own module.

### Shotgun Surgery

The inverse of Divergent Change: a single conceptual change requires modifying many classes scattered across the codebase. This indicates that a responsibility is fragmented. Remedy: **Move Function** and **Move Field** to consolidate related logic, or **Inline Class** to merge overly fine-grained decompositions.

---

## Core Refactoring Catalog

### Extract Method (Extract Function)
**Intent:** Decompose a long method into named, cohesive units.
**Mechanics:** (1) Identify a code fragment that can be grouped. (2) Create a new method with a name that communicates *what* it does, not *how*. (3) Copy the fragment into the new method. (4) Identify local variables scoped to the fragment; pass as parameters or return as results. (5) Replace the original fragment with a call to the new method. (6) Compile and test.
**When to apply:** When you need to write a comment explaining what a block of code does -- the comment's text often becomes the method name.

### Inline Method (Inline Function)
**Intent:** Remove unnecessary indirection when a method body is as clear as its name.
**Mechanics:** (1) Verify the method is not polymorphic (not overridden in subclasses). (2) Find all call sites. (3) Replace each call with the method body. (4) Remove the method definition. (5) Test.
**When to apply:** When a method's body is trivially readable, when excessive delegation obscures control flow, or as a preparatory step before re-extracting differently.

### Move Function
**Intent:** Relocate a function to the module where it conceptually belongs.
**Mechanics:** (1) Examine the function's current context and dependencies. (2) Determine the best target context based on data access patterns. (3) Copy the function to the target. (4) Adjust references. (5) Turn the original into a delegating wrapper, then inline it. (6) Test.
**When to apply:** When a function references more elements from another module than from its own (Feature Envy).

### Extract Class
**Intent:** Split a class that has grown to hold multiple responsibilities.
**Mechanics:** (1) Identify a coherent subset of fields and methods. (2) Create a new class named after that subset's concept. (3) Create a link from the old class to the new. (4) Move fields and methods one at a time, testing after each move. (5) Review interfaces and minimize bidirectional references.
**When to apply:** When a class exhibits Divergent Change, Large Class, or has two clear clusters of state and behavior.

### Replace Conditional with Polymorphism
**Intent:** Eliminate switch/case or if-else chains by distributing behavior across a class hierarchy or strategy objects.
**Mechanics:** (1) If the conditional does not already have a class hierarchy, create one using the type code as the discriminator. (2) Create subclasses for each case. (3) Override a polymorphic method in each subclass with the logic from the corresponding branch. (4) Replace the conditional with a call to the polymorphic method. (5) Test.
**When to apply:** When the same conditional structure appears in multiple methods, or when adding a new case requires modifying existing code.

### Introduce Parameter Object
**Intent:** Replace recurring groups of parameters with a single object.
**Mechanics:** (1) Identify parameter groups that travel together across method signatures. (2) Create a class to hold them. (3) Modify each method to accept the new object. (4) Update all callers. (5) Look for behavior that can be moved onto the new object. (6) Test.
**Significance:** This refactoring frequently catalyzes deeper design improvements -- the new object often attracts behavior, evolving from a data carrier into a meaningful domain concept.

### Replace Temp with Query
**Intent:** Eliminate temporary variables by extracting their computation into a method.
**Mechanics:** (1) Verify the temp is assigned only once. (2) Extract the right-hand side of the assignment into a new method. (3) Replace all references to the temp with calls to the new method. (4) Remove the temp declaration and assignment. (5) Test.
**When to apply:** When temps obscure the flow of data, when you want to make a computation available to other methods, or as preparation for Extract Method.

---

## Strangler Fig Pattern

### Origin and Metaphor
Coined by Martin Fowler (2004), the Strangler Fig pattern draws its name from tropical strangler fig trees that grow around a host tree, gradually replacing it while the host decomposes. Applied to software, it describes incrementally replacing a legacy system component by component, rather than performing a high-risk wholesale rewrite.

### Mechanics
1. **Identify a functional seam** in the legacy system -- a boundary where new behavior can intercept requests.
2. **Build the replacement component** for that seam using the target architecture.
3. **Route traffic** through a facade or proxy that dispatches to either the legacy or new component based on feature flags, URL patterns, or API versioning.
4. **Validate equivalence** by running both systems in parallel (shadow mode) or by progressively shifting traffic (canary deployment).
5. **Decommission the legacy component** once the replacement is verified.
6. **Repeat** for the next seam.

### Critical Properties
- **Reversibility:** At every stage, routing can revert to the legacy system.
- **Incrementality:** Value is delivered with each migrated component, not only at final completion.
- **Risk containment:** Failure affects only the component under migration.

The Strangler Fig pattern is the antithesis of the "big bang rewrite," which Spolsky (2000) identified as the single worst strategic mistake a software company can make.

---

## Working Effectively with Legacy Code (Feathers, 2004)

### The Legacy Code Dilemma
Michael Feathers defines legacy code as **code without tests**. This definition is deliberately provocative: regardless of age, language, or architectural style, code that lacks automated tests cannot be safely modified. The central challenge of legacy code is the *refactoring paradox*: you need tests to refactor safely, but you need to refactor to make the code testable.

### Characterization Tests
Feathers introduces **characterization tests** as the resolution to this paradox. A characterization test does not assert what the code *should* do; it asserts what the code *actually does*. The procedure:
1. Write a test that calls the code under study.
2. Use a deliberately wrong assertion.
3. Run the test and observe the actual output.
4. Replace the assertion with the observed value.
5. The test now *characterizes* the current behavior, including any bugs.

Characterization tests provide a safety net for refactoring without requiring full specification knowledge. They document de facto behavior, enabling structural changes while preserving functional equivalence.

### Seams
A **seam** is a place in the code where you can alter behavior without editing the source at that point. Feathers identifies three types:
- **Object seams:** Substitute behavior by overriding methods in a subclass or injecting a dependency (the most common technique in OOP languages).
- **Preprocessing seams:** In languages with preprocessors (C/C++), alter behavior via macro substitution or conditional compilation.
- **Link seams:** Substitute behavior by changing what is linked at build time (e.g., replacing a library with a test double).

The concept of seams is fundamental: identifying seams is the first step toward making legacy code testable without modifying its structure -- which would be unsafe without tests.

### The Legacy Code Change Algorithm
Feathers prescribes a disciplined sequence for modifying legacy code:
1. Identify the change points.
2. Find the test points (where to observe the effects).
3. Break dependencies (using seams).
4. Write characterization tests.
5. Make the change and refactor.

This algorithm resolves the refactoring paradox by creating a minimal safety net at the precise point of change, avoiding the prohibitive cost of comprehensively testing an entire legacy system before any modification.

---

## SQALE Method for Technical Debt Measurement

### Overview
The Software Quality Assessment based on Lifecycle Expectations (SQALE) method, formalized by Letouzey (2012) and adopted as ISO 25010 quality model alignment, provides a systematic framework for quantifying technical debt in terms of remediation cost.

### The SQALE Quality Model
SQALE organizes code quality into a strict hierarchy of characteristics, ordered by dependency:
1. **Testability** -- can the code be tested?
2. **Reliability** -- does it behave correctly?
3. **Changeability** -- can it be modified safely?
4. **Efficiency** -- does it perform adequately?
5. **Security** -- is it resistant to attack?
6. **Maintainability** -- can it be understood?
7. **Portability** -- can it be transferred?
8. **Reusability** -- can it be repurposed?

The ordering is consequential: a deficiency in testability (level 1) must be remediated before addressing changeability (level 3), because untestable code cannot be safely changed.

### The SQALE Technical Debt Ratio
The SQALE Technical Debt Ratio (TDR) expresses debt as:
```
TDR = Remediation Cost / Development Cost
```
A TDR of 5% means that 5% of the original development effort would be required to resolve all identified quality issues. This metric enables cross-project comparison and executive communication of technical debt in financial terms. Tools implementing SQALE analysis include SonarQube, which maps static analysis findings to the SQALE quality model and reports debt in time-to-fix units (minutes, hours, days).

---

## Branch by Abstraction

### Purpose
Branch by Abstraction (Hammant, 2007; Fowler, 2014) is a technique for making large-scale changes to a codebase while maintaining a releasable trunk at all times. It replaces long-lived feature branches with a sequence of commits on mainline, each individually safe.

### Mechanics
1. **Introduce an abstraction layer** (interface, abstract class, or function pointer) over the component to be replaced.
2. **Migrate all clients** to use the abstraction instead of the concrete implementation.
3. **Create the new implementation** behind the same abstraction.
4. **Switch the binding** from the old implementation to the new, using feature flags or configuration.
5. **Remove the old implementation** once the new one is validated.
6. **Optionally remove the abstraction layer** if it no longer serves a purpose (avoid Speculative Generality).

### Relationship to Continuous Integration
Branch by Abstraction is a prerequisite for trunk-based development at scale. It eliminates merge conflicts from long-lived branches, ensures every commit is a candidate release, and enables gradual migration without code freezes. It is the in-code counterpart to the Strangler Fig pattern's system-level approach.

---

## When NOT to Refactor

Refactoring is not always appropriate. The decision to refactor requires a risk analysis that weighs expected benefit against potential harm.

### Do Not Refactor When:
- **The code is being replaced.** If a module is scheduled for deletion or full replacement within the current planning horizon, refactoring it is waste.
- **There are no tests and no budget for writing them.** Refactoring without tests is reckless. Feathers' characterization tests provide a minimum safety net, but even these require time.
- **The system is under acute production pressure.** During incident response or critical deadline convergence, refactoring diverts attention from the immediate objective. Stabilize first, refactor second.
- **The refactoring scope exceeds the team's understanding.** Refactoring code that is poorly understood risks introducing subtle behavioral changes. Invest in comprehension first.
- **The cost exceeds the benefit.** A module that is stable, rarely modified, and adequately tested may have cosmetic imperfections not worth the risk of change.
- **External interfaces are at stake.** Refactoring a published API, database schema, or wire protocol has downstream effects on all consumers requiring coordination beyond behavior-preservation guarantees.

### The Refactoring Decision Framework
1. Is the code going to change soon? If no, defer.
2. Are there tests? If no, write characterization tests first.
3. Is the team familiar with this code? If no, invest in comprehension.
4. Is the scope bounded? If no, apply Strangler Fig or Branch by Abstraction to decompose.
5. Is there organizational support? If no, make the economic case using SQALE metrics.

---

## Practical Implications

1. **Refactoring is not rewriting.** Every refactoring must preserve observable behavior. If you change what the code does, you are not refactoring.
2. **Refactor in micro-steps.** Each step must compile and pass tests. Large refactorings are composed of many small, individually safe transformations. Commit after each meaningful step.
3. **Never refactor and add features in the same commit.** Fowler's "two hats" metaphor: you are either wearing the refactoring hat or the feature hat. Mixing them makes it impossible to isolate the cause of regressions.
4. **Use code smells as diagnostic heuristics, not mandates.** A code smell signals *potential* for improvement. Context determines whether the improvement is worthwhile.
5. **Characterization tests are the key to legacy systems.** When you inherit code without tests, write characterization tests at the seams before any structural change.
6. **Quantify technical debt to justify refactoring.** Use SQALE or equivalent frameworks to express debt in remediation cost. "This module has 12 days of technical debt" is actionable; "this code is messy" is not.
7. **Prefer Strangler Fig over big-bang rewrites.** Incremental migration delivers value earlier, reduces risk, and maintains reversibility.
8. **Branch by Abstraction enables large refactorings on trunk.** Avoid long-lived branches for refactoring work. Introduce an abstraction, migrate clients, swap implementations, remove the old code.
9. **IDE tooling makes refactoring mechanical.** Modern IDEs (IntelliJ, VS Code with language servers) automate Extract Method, Rename, Move, and Inline with semantic correctness. Prefer automated refactoring over manual edits.
10. **Refactoring is a daily practice, not a phase.** Schedule refactoring opportunistically -- improve code in the vicinity of every feature change. The Boy Scout Rule: leave the campground cleaner than you found it.

---

## Common Misconceptions

**"Refactoring means cleaning up code."**
Refactoring is a specific discipline with defined mechanics and a behavior-preservation invariant. General "cleanup" that changes interfaces, fixes bugs, or restructures APIs is not refactoring in the Fowlerian sense. Conflating the two leads to uncontrolled changes labeled as "refactoring" that introduce regressions.

**"Refactoring requires dedicated sprints."**
This is the single most damaging misconception. Dedicating entire sprints to refactoring decouples it from feature delivery, making it politically vulnerable and economically unjustifiable. Refactoring should be continuous and incremental, embedded in every development task.

**"Code smells are always bad."**
Code smells are heuristics with false-positive rates. A God Class in a prototyping context may be acceptable. A Long Method that is a straightforward sequential script may be clearer than a decomposed version. Engineering judgment determines whether a smell warrants action.

**"Refactoring is risk-free because behavior does not change."**
Behavior preservation is the *goal*, not the *guarantee*. Without adequate test coverage, refactoring can introduce subtle behavioral changes. The safety of refactoring is proportional to the comprehensiveness of the test suite.

**"Legacy code cannot be refactored."**
Feathers (2004) disproved this comprehensively. The combination of seam identification, characterization tests, and incremental dependency breaking makes any codebase amenable to refactoring -- given sufficient discipline and patience.

**"Automated refactoring tools eliminate the need for understanding."**
Tools automate the mechanics but not the judgment. Deciding *what* to refactor, *why*, and *when* requires deep understanding of the domain, the architecture, and the team's current priorities. Tools are force multipliers, not substitutes for engineering skill.

---

## Further Reading

1. Fowler, M. (1999). *Refactoring: Improving the Design of Existing Code*. Addison-Wesley. (The foundational text; established the vocabulary and mechanics of refactoring.)
2. Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code*, 2nd Edition. Addison-Wesley. (Modernized with JavaScript examples; revised catalog and updated taxonomy.)
3. Feathers, M. (2004). *Working Effectively with Legacy Code*. Prentice Hall. (Definitive treatment of characterization tests, seams, and dependency breaking techniques.)
4. Kerievsky, J. (2004). *Refactoring to Patterns*. Addison-Wesley. (Bridges refactoring mechanics with GoF design patterns; shows pattern-directed refactoring sequences.)
5. Wake, W. (2003). *Refactoring Workbook*. Addison-Wesley. (Exercise-driven complement to Fowler's catalog; useful for developing pattern recognition.)
6. Letouzey, J.-L. (2012). "The SQALE Method for Evaluating Technical Debt." *Proceedings of the Third International Workshop on Managing Technical Debt*, IEEE. (Formal specification of the SQALE quality model and debt ratio.)
7. Opdyke, W. (1992). "Refactoring Object-Oriented Frameworks." PhD Dissertation, University of Illinois at Urbana-Champaign. (The doctoral thesis that originated formal refactoring in OOP contexts.)
8. Griswold, W. (1991). "Program Restructuring as an Aid to Software Maintenance." PhD Dissertation, University of Washington. (Foundational academic work on behavior-preserving program transformation.)
9. Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. (Complements Fowler with emphasis on naming, function size, and code-level readability heuristics.)
10. Hammant, P. (2007). "Branch by Abstraction." Blog post, later expanded by Fowler, M. (2014) on martinfowler.com. (Canonical description of the technique for large-scale trunk-based refactoring.)
11. Spolsky, J. (2000). "Things You Should Never Do, Part I." *Joel on Software*. (The definitive argument against big-bang rewrites, using the Netscape Navigator case study.)
12. Abbes, M., Khomh, F., Gueheneuc, Y.-G., & Antoniol, G. (2011). "An Empirical Study of the Impact of Two Antipatterns, Blob and Spaghetti Code, on Program Comprehension." *Proceedings of the 15th European Conference on Software Maintenance and Reengineering (CSMR)*, IEEE. (Empirical evidence linking code smells to measurable comprehension degradation.)
