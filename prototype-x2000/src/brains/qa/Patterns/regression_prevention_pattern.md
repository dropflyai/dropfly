# Regression Prevention Pattern

## Problem

Previously-fixed defects recur because the fix was not accompanied by a test that prevents recurrence. Alternatively, the regression suite grows unboundedly, becoming slow and expensive to maintain, while its defect detection rate decreases because many tests are redundant or obsolete.

## Context

This pattern applies when:
- The team has experienced regression defects (previously-fixed bugs reappearing)
- The regression suite execution time is growing and the team is considering reducing test coverage
- The team is establishing a process for adding and maintaining regression tests
- The system has been in production long enough to have a defect history

This pattern does NOT apply when:
- The system is a prototype with no production users
- The team has no test automation infrastructure
- The defect rate is effectively zero (mature, stable system with minimal changes)

## Solution

### The Regression Prevention Lifecycle

```
Production Defect Discovered
       │
       ▼
1. Root Cause Analysis
   └── Identify the exact code path that caused the failure
       │
       ▼
2. Write Regression Test BEFORE Fixing
   └── Create a test that reproduces the defect
   └── Verify the test FAILS (proves it catches the defect)
       │
       ▼
3. Fix the Defect
   └── Implement the fix
   └── Verify the test PASSES (proves the fix works)
       │
       ▼
4. Classify the Regression Test
   └── Assign to the appropriate pyramid layer (unit > integration > E2E)
   └── Tag with defect ID, severity, and affected component
       │
       ▼
5. Add to Regression Suite
   └── Include in the appropriate CI pipeline stage
   └── Verify it runs in < 10 seconds (for unit) or < 60 seconds (for integration)
       │
       ▼
6. Periodic Regression Suite Audit (Quarterly)
   └── Remove tests for deprecated features
   └── Merge redundant tests (tests that cover identical code paths)
   └── Verify coverage: does the suite still cover the critical paths?
   └── Measure defect detection rate: how many real defects per 1000 test runs?
```

### Regression Test Classification

| Defect Type | Test Layer | Rationale |
|-------------|-----------|-----------|
| Logic error in a single function | Unit test | Fastest, most precise |
| Incorrect database query | Integration test | Requires real database |
| Broken API response format | Contract test | Validates the interface |
| User workflow failure | E2E test | Validates the full journey |
| Performance regression | Performance benchmark | Validates speed |

### The "Two-for-One" Rule

Every production defect generates exactly two artifacts:
1. A regression test that prevents recurrence
2. A process improvement that prevents the defect category

Example: A null pointer exception in the payment handler generates:
1. A unit test with null input to the payment handler
2. A static analysis rule requiring null checks on all external data inputs

### Regression Suite Maintenance Metrics

| Metric | Target | Action if Missed |
|--------|--------|-----------------|
| Suite execution time | < 30 minutes (full), < 10 minutes (critical) | Parallelize, remove slow/redundant tests |
| Flaky test rate | < 1% | Quarantine and fix flaky tests |
| Defect detection rate | > 0.5 defects per 100 runs | Remove tests that never find defects |
| Obsolete test rate | < 5% | Quarterly audit to remove obsolete tests |
| Redundancy rate | < 10% | Coverage analysis to identify overlapping tests |

## Consequences

**Benefits:**
- Production defects can only occur once (recurrence is prevented by test)
- Regression suite grows in proportion to real defects (not speculative risk)
- Root cause analysis produces systemic improvements, not just point fixes
- Quarterly audits prevent suite bloat

**Trade-offs:**
- Requires discipline to write the test before the fix (temptation to fix first)
- Quarterly audits require dedicated time that competes with feature work
- Classification decisions require judgment (unit vs. integration vs. E2E)
- Some production defects are difficult to reproduce in a test environment

## Related Patterns

- **Test Pyramid Pattern**: Regression tests are classified into pyramid layers
- **Quality Gate Pattern**: Regression suite pass rate is a release gate criterion
