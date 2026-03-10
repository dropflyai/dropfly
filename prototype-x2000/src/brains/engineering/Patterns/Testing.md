# Testing Patterns

## What This Enables

A rigorous testing strategy is the primary mechanism by which engineering teams
establish and maintain confidence in software correctness over time. The patterns
here are grounded in decades of academic research. Mastery enables an organization to:

- Reason formally about the boundary between verified and unverified behavior.
- Construct test suites that maximize defect-detection probability per unit of
  execution time, following the economic principles of the test pyramid.
- Deploy test doubles with precision using Meszaros's taxonomy rather than
  conflating distinct concepts under the overloaded term "mock."
- Move beyond example-based testing toward property-based and mutation-based
  approaches that provide stronger guarantees across the input space.
- Implement consumer-driven contract testing to verify integration boundaries
  without the brittleness of full end-to-end environments.
- Make principled decisions about TDD versus BDD based on formal properties
  rather than tribal preference.

This document is written for principal-level engineers. Every section includes
the academic lineage so that claims can be traced to their source.

---

### The Test Pyramid

**Origin.** Introduced by Mike Cohn in *Succeeding with Agile* (2009) and
formalized by Martin Fowler (2012). The model encodes an economic argument
about test granularity.

**Formal Definition.** Let T be a test suite partitioned into layers
L_1, L_2, ..., L_k ordered by increasing scope (L_1 = unit, L_k = E2E).
The pyramid asserts: `|L_1| >> |L_2| >> ... >> |L_k|`, and is optimal when
`cost(L_i) < cost(L_{i+1})` and `signal(L_i) > signal(L_{i+1})` for all i.

**Layers.** Unit tests (L_1) verify a single unit in isolation in milliseconds
and pinpoint defects precisely. Integration tests (L_2) verify module
collaboration across boundaries in seconds. E2E tests (L_k) verify complete
user journeys in minutes but provide poor defect localization.

**The Ice Cream Cone Anti-Pattern.** Inverting the pyramid -- many E2E tests,
few unit tests -- produces a slow, flaky, expensive suite (Alister Scott, 2012).

**Calibration.** A typical web application targets roughly 70% unit, 20%
integration, 10% E2E by count. The correct distribution depends on
architecture and risk profile.

---

### Test Doubles Taxonomy

**Origin.** Gerard Meszaros, *xUnit Test Patterns* (2007). Resolves the
persistent ambiguity in "mock" by defining five distinct types.

1. **Dummy.** Satisfies a parameter list but is never used. If invoked, the
   test has a design flaw.
2. **Stub.** Returns predetermined responses. Provides indirect input to the
   system under test without verifying it was called.
3. **Spy.** A stub that records call information (arguments, count, order).
   Enables post-hoc interaction assertions.
4. **Mock.** Pre-programmed with expectations; verifies behavior during the
   act phase. Fails immediately on unexpected calls.
5. **Fake.** A lightweight functional implementation (in-memory DB, local SMTP).
   Has working logic but takes shortcuts unsuitable for production.

| Concern | Double |
|---------|--------|
| Fill a parameter, no behavior needed | Dummy |
| Control indirect inputs | Stub |
| Verify indirect outputs after the fact | Spy |
| Enforce a specific interaction protocol | Mock |
| Need a working but simplified collaborator | Fake |

**Pitfall.** Over-mocking couples tests to implementation details. Prefer stubs
and fakes; reserve mocks for when the interaction protocol is specified behavior.

---

### Property-Based Testing

**Origin.** Claessen & Hughes, "QuickCheck: A Lightweight Tool for Random
Testing of Haskell Programs" (ICFP 2000). Ported to Hypothesis (Python),
fast-check (JS), PropEr (Erlang), jqwik (Java).

**Formal Basis.** A property-based test specifies:
`forall (x : A). precondition(x) => property(f(x))`. The framework generates
random inhabitants of A, filters by precondition, and checks the property.
On counterexample, it applies shrinking to find the minimal failing input.

**Key Properties.** Roundtrip (`decode(encode(x)) == x`), idempotence
(`f(f(x)) == f(x)`), commutativity, invariant preservation, and model
equivalence (oracle testing against a reference implementation).

**Shrinking.** Reduces counterexamples to minimal form. Integrated shrinking
(Hypothesis) interleaves generation and shrinking, avoiding manual shrink
function definitions required by classical QuickCheck.

**When to Apply.** When the function has a clear algebraic specification, the
input space is large, edge cases are hard to enumerate, or the function is pure.

---

### Mutation Testing

**Origin.** DeMillo, Lipton & Sayward, "Hints on Test Data Selection" (1978).
Comprehensive survey: Jia & Harman, IEEE TSE (2011).

**Definition.** Given program P and test suite T, mutant P' is produced by a
single syntactic transformation. Mutation score:
`MS(P, T) = killed / (total - equivalent)`. A mutant is killed if any test
produces a different result on P' than P.

**Standard Operators.** AOR (arithmetic replacement), ROR (relational
replacement), LCR (logical connector replacement), UOI (unary operator
insertion), SDL (statement deletion).

**Competent Programmer Hypothesis.** Programs are close to correct; if T kills
all first-order mutants, it likely detects real faults. **Coupling Effect**
(Offutt, 1992): tests detecting simple faults tend to detect complex ones,
justifying restriction to first-order mutants.

**Tooling.** Stryker (JS/TS), PIT (Java), mutmut (Python), cargo-mutants (Rust).
Score below 80% indicates significant gaps; above 90% indicates strong detection.

---

### Contract Testing

**Origin.** Ian Robinson (2006), implemented in Pact (2013). Addresses
verifying integration correctness without co-deploying services.

**Mechanism.** (1) Consumer writes a contract specifying expected requests and
responses, generated during test execution with a mock provider. (2) Provider
replays the contract against its real implementation.

**Properties.** Bilateral verification (same contract, no co-deployment),
independent deployability (safe if all contracts pass), consumer-driven
evolution (contracts capture actual usage, not hypothetical surfaces).

**Limitations.** Verifies syntactic compatibility and basic semantics, not
complex business logic, performance, or failure modes. Complements but does
not replace targeted E2E tests.

---

### End-to-End Testing Strategy

**When to use.** Critical user journeys (signup, checkout, payment), smoke
tests (5-15 tests post-deployment), regression gates for defects that escaped
lower layers. **When NOT to use.** Business logic testable at unit level,
coverage-padding, or as a substitute for contract tests.

**Flakiness Mitigation.** Deterministic test data, explicit waits (never
`sleep`), retry with jitter, quarantine mechanisms for flaky tests.

**Tooling.** Playwright (preferred -- multi-browser, auto-waiting), Cypress,
Selenium. See this brain's automation recipes for Playwright configuration.

---

### TDD vs BDD: A Formal Comparison

**TDD** (Beck, 2003): Red-Green-Refactor. Write one failing test, make it
pass with minimum code, refactor while green.

**BDD** (North, 2006): Structured natural language (Gherkin) specifications --
Given/When/Then -- bridging technical and non-technical stakeholders.

| Dimension | TDD | BDD |
|-----------|-----|-----|
| Language | Code (xUnit) | Gherkin |
| Audience | Developers | Cross-functional |
| Granularity | Unit-level | Feature-level |
| Artifact | Test case | Executable specification |
| Refactoring | Intrinsic | Not intrinsic |
| Coupling risk | Low | Medium (step definitions) |

Use TDD for low-level design and algorithmic correctness. Use BDD for
stakeholder alignment on feature behavior. They are complementary: BDD at the
feature level, TDD at the unit level.

---

### Snapshot Testing and Visual Regression

**Snapshot testing** (Jest, 2016) serializes output and compares against a
stored reference. Appropriate for UI component trees and API response shapes.
Inappropriate for volatile structures or as a substitute for semantic assertions.

**Visual regression** extends to pixel-level comparison (Percy, Chromatic,
Playwright screenshots). Requires deterministic render environments (fixed
viewport, fonts, no animations). Anti-aliasing tolerance: 0.1-0.5% pixel diff.

---

### Test Isolation and Hermetic Tests

A hermetic test's outcome is determined entirely by its inputs and the code
under test. Properties: deterministic, independent, self-contained, parallelizable.

**Strategies.** In-memory databases or test containers, network mocking
(WireMock, nock, MSW), filesystem temp directories, clock fakes (Sinon),
seeded RNGs.

**Shared Database Anti-Pattern.** Tests sharing a database suffer
order-dependent failures and parallelization hazards. Use per-test containers
or transaction rollback.

---

### Practical Implications

1. Structure suites as a pyramid: many fast unit tests, fewer integration, minimal E2E.
2. Use the correct test double from the Meszaros taxonomy; avoid over-mocking.
3. Adopt property-based testing for functions with algebraic specifications.
4. Run mutation testing in CI; mutation score reveals quality better than coverage.
5. Implement contract testing at every service boundary for independent deployability.
6. Keep E2E tests minimal (5-15); invest in flakiness mitigation.
7. Enforce test isolation from day one; retrofitting is extremely expensive.
8. Use TDD for design feedback: hard-to-test code signals hard-to-use APIs.
9. Use BDD for stakeholder alignment when acceptance criteria are ambiguous.
10. Treat snapshots as change detectors, not correctness proofs.
11. Measure mutation score alongside (not instead of) line coverage.
12. Automate quality gates in CI: coverage, mutation score, contract verification.

---

### Common Misconceptions

**"100% coverage means well-tested."** Coverage measures execution, not
verification. Mutation testing is more meaningful.

**"Mocks and stubs are the same."** Stubs provide indirect input; mocks verify
indirect output. Conflation produces insufficient or brittle tests.

**"E2E tests are most valuable."** Most expensive per defect. A strong pyramid
catches most defects at lower layers for less cost.

**"Property-based testing replaces examples."** Both are necessary. Examples
serve as documentation; properties explore the input space.

**"TDD means writing all tests first."** TDD is incremental: one test, one
implementation, one refactor, repeat.

**"Snapshot tests are low-effort high-value."** Without review discipline,
snapshot approval degenerates into rubber-stamping.

**"Contract testing eliminates E2E."** Contracts verify interface compatibility,
not system-level behavior. Smoke E2E tests remain necessary.

**"Flaky tests are fine with retries."** Normalized flakiness erodes suite
trust. Quarantine and fix or delete.

---

### Further Reading

- Cohn, M. (2009). *Succeeding with Agile*. Addison-Wesley. [Test pyramid.]
- Fowler, M. (2012). "TestPyramid." martinfowler.com.
- Meszaros, G. (2007). *xUnit Test Patterns*. Addison-Wesley. [Test doubles taxonomy.]
- Beck, K. (2003). *Test-Driven Development: By Example*. Addison-Wesley.
- North, D. (2006). "Introducing BDD." dannorth.net.
- Claessen, K. & Hughes, J. (2000). "QuickCheck: A Lightweight Tool for
  Random Testing of Haskell Programs." *ICFP 2000*, ACM.
- MacIver, D. et al. (2019). "Hypothesis." *JOSS*, 4(43), 1891.
- DeMillo, R.A., Lipton, R.J. & Sayward, F.G. (1978). "Hints on Test Data
  Selection." *IEEE Computer*, 11(4).
- Jia, Y. & Harman, M. (2011). "An Analysis and Survey of the Development
  of Mutation Testing." *IEEE TSE*, 37(5).
- Offutt, A.J. (1992). "Investigations of the Software Testing Coupling
  Effect." *ACM TOSEM*, 1(1).
- Robinson, I. (2006). "Consumer-Driven Contracts." martinfowler.com.
- Freeman, S. & Pryce, N. (2009). *Growing Object-Oriented Software, Guided
  by Tests*. Addison-Wesley.
- Whittaker, J.A. et al. (2012). *How Google Tests Software*. Addison-Wesley.
- Winters, T. et al. (2020). *Software Engineering at Google*. O'Reilly.
  [Chapters 11-14: testing philosophy and hermetic tests.]
