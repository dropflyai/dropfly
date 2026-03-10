# Test Pyramid Pattern

## Problem

Teams invest testing effort without a structural framework, leading to either top-heavy suites dominated by slow, brittle E2E tests (the "ice cream cone") or bottom-heavy suites with extensive unit tests but no integration confidence. Both imbalances produce poor defect detection per unit of testing investment.

## Context

This pattern applies when:
- A team is establishing or restructuring its test automation strategy
- Test execution time is growing faster than the test suite's defect detection capability
- The team has engineers capable of writing tests at multiple abstraction levels
- The system under test has distinguishable unit, integration, and E2E boundaries

This pattern does NOT apply when:
- The system is a pure data pipeline (use the diamond pattern instead)
- The system is a thin API gateway with no business logic (contract tests dominate)
- The team has zero test automation capability (start with the highest-value layer first)

## Solution

### Structure

Organize test automation into three layers with explicit investment ratios:

```
Layer 1 - Unit Tests (65-80% of automated tests)
├── Scope: Individual functions, classes, modules in isolation
├── Dependencies: All external dependencies mocked or stubbed
├── Execution time: Full suite < 2 minutes
├── Ownership: Written by the developer who writes the code
├── Trigger: Every commit, every PR, pre-push hook
└── Value: Fast feedback, precise defect localization

Layer 2 - Integration Tests (15-25% of automated tests)
├── Scope: Interactions between components (service + database, service + service)
├── Dependencies: Real infrastructure (Testcontainers), mocked external services
├── Execution time: Full suite < 15 minutes
├── Ownership: Written by developers, reviewed by QA
├── Trigger: Every PR, nightly full run
└── Value: Validates component interaction contracts

Layer 3 - E2E Tests (5-10% of automated tests)
├── Scope: Complete user journeys through the full stack
├── Dependencies: Full system deployment (staging or ephemeral environment)
├── Execution time: Critical path suite < 15 minutes, full suite < 60 minutes
├── Ownership: Written by QA engineers, maintained by the team
├── Trigger: Pre-merge (critical path), nightly (full suite)
└── Value: Validates that the system delivers user value end-to-end
```

### Investment Rules

1. **New feature**: Write unit tests first (TDD), add integration tests for component boundaries, add E2E tests only for critical user journeys
2. **Bug fix**: Write a failing unit test that reproduces the bug, fix the bug, verify the test passes. Add integration/E2E test only if the bug was an interaction failure
3. **Refactor**: Verify existing tests pass before and after. If tests break due to internal restructuring (not behavior change), update them

### Pyramid Variants by System Type

| System Type | Recommended Shape | Primary Investment Layer |
|-------------|------------------|------------------------|
| Library/SDK | Traditional pyramid | Unit tests (80%+) |
| Microservice | Pyramid with strong middle | Integration + contract tests |
| Frontend SPA | Trophy (Dodds model) | Integration/component tests |
| Data pipeline | Diamond | Integration/transformation tests |
| Monolith | Traditional pyramid | Unit + selective E2E |

### Anti-Pattern Detection

Monitor these metrics to detect pyramid inversion:
- E2E test count growing faster than unit test count
- E2E suite execution time growing faster than integration suite
- More than 50% of CI time spent on E2E tests
- Developers not running unit tests locally because they "take too long"

## Consequences

**Benefits:**
- Fast feedback loop (unit tests in seconds, not minutes)
- Precise defect localization (unit test failure pinpoints the function)
- Reduced maintenance cost (unit tests are simpler and more stable than E2E)
- Parallel execution scales well at the unit level

**Trade-offs:**
- Requires discipline to maintain the ratio as the codebase grows
- Unit tests with mocked dependencies can miss integration failures
- E2E test coverage must be curated, not comprehensive
- Different testing skills required at each layer

## Related Patterns

- **Quality Gate Pattern**: Gates enforce minimum coverage at each pyramid layer
- **Regression Prevention Pattern**: Regression tests are distributed across all pyramid layers
