# Code Review Checklist Template

Structured review framework for evaluating pull requests. Every code review MUST use this checklist to ensure consistent quality, catch defects early, and maintain engineering standards.

---

## Review Metadata

| Field | Value |
|-------|-------|
| **PR Title** | [Title] |
| **PR URL** | [Link] |
| **Author** | [Name] |
| **Reviewer** | [Name] |
| **Date** | YYYY-MM-DD |
| **Review Round** | 1 / 2 / 3 |
| **Lines Changed** | +[X] / -[Y] |
| **Risk Level** | Low / Medium / High / Critical |

### Risk Level Criteria

| Level | Definition |
|-------|-----------|
| Low | Cosmetic changes, documentation, test additions, minor refactoring |
| Medium | New features with tests, non-breaking API changes, dependency updates |
| High | Database migrations, authentication changes, payment logic, breaking API changes |
| Critical | Security-sensitive code, data deletion, infrastructure changes, production hotfixes |

---

## Section 1: PR Quality (Gate Check)

These must ALL pass before detailed review begins.

- [ ] **PR description explains the "why"** -- not just what changed, but why it changed
- [ ] **PR is appropriately scoped** -- single concern, not a kitchen-sink PR
- [ ] **PR size is reviewable** -- under 400 lines changed (if larger, should be split)
- [ ] **Linked to issue/ticket** -- references the work item that prompted this change
- [ ] **Branch is up to date** -- rebased or merged with latest `main`
- [ ] **CI passes** -- all automated checks are green
- [ ] **No merge conflicts** -- clean merge possible
- [ ] **Self-review completed** -- author has reviewed their own diff

> If any gate check fails, return PR to author before proceeding.

---

## Section 2: Correctness

Does the code do what it claims to do?

- [ ] **Logic is correct** -- algorithms produce expected results for all inputs
- [ ] **Edge cases handled** -- null, empty, zero, negative, boundary values, overflow
- [ ] **Error handling is complete** -- all failure paths are caught and handled gracefully
- [ ] **No off-by-one errors** -- loops, array indices, pagination boundaries
- [ ] **Async operations are correct** -- proper await, no race conditions, error propagation
- [ ] **State management is sound** -- no stale state, proper cleanup, no memory leaks
- [ ] **Data types are correct** -- no implicit coercions, proper type narrowing
- [ ] **Business logic matches requirements** -- behavior aligns with spec/ticket

### Correctness Notes
```
[Reviewer notes on correctness issues found]
```

---

## Section 3: Security

Is the code safe from attack vectors and data exposure?

- [ ] **No secrets in code** -- no API keys, tokens, passwords, or connection strings
- [ ] **Input validation** -- all user input is validated and sanitized
- [ ] **SQL injection prevention** -- parameterized queries, no string concatenation
- [ ] **XSS prevention** -- output encoding, CSP headers, no dangerouslySetInnerHTML without sanitization
- [ ] **Authentication enforced** -- protected routes require valid session
- [ ] **Authorization enforced** -- users can only access their own resources (RLS, middleware)
- [ ] **CSRF protection** -- state-changing operations use CSRF tokens or SameSite cookies
- [ ] **Sensitive data handling** -- PII is encrypted at rest and in transit, not logged
- [ ] **Dependency security** -- no known vulnerabilities in new dependencies
- [ ] **Rate limiting** -- public endpoints have appropriate rate limits
- [ ] **File upload safety** -- if applicable, type validation, size limits, no path traversal

### Security Notes
```
[Reviewer notes on security concerns]
```

---

## Section 4: Performance

Will this code perform acceptably at expected scale?

- [ ] **No N+1 queries** -- database queries are batched/joined appropriately
- [ ] **Appropriate indexing** -- new query patterns have supporting database indices
- [ ] **No unnecessary re-renders** -- React components memoized where beneficial
- [ ] **Pagination implemented** -- large data sets are not loaded entirely into memory
- [ ] **Caching strategy** -- frequently accessed, rarely changed data is cached
- [ ] **Bundle size impact** -- new dependencies do not significantly increase bundle
- [ ] **No blocking operations** -- long-running tasks are async or queued
- [ ] **Resource cleanup** -- connections, listeners, and subscriptions are properly closed
- [ ] **Image/asset optimization** -- images are compressed, lazy-loaded where appropriate
- [ ] **API response size** -- responses return only needed fields, not entire objects

### Performance Notes
```
[Reviewer notes on performance concerns]
```

---

## Section 5: Readability and Maintainability

Can the next engineer understand and modify this code?

- [ ] **Naming is clear** -- variables, functions, and files have descriptive, unambiguous names
- [ ] **Functions are focused** -- each function does one thing (< 30 lines preferred)
- [ ] **No magic numbers** -- constants are named and documented
- [ ] **Comments explain "why"** -- not "what" (code should be self-documenting for "what")
- [ ] **No dead code** -- commented-out code, unused imports, unreachable branches removed
- [ ] **Consistent style** -- follows project conventions (enforced by linter/formatter)
- [ ] **Appropriate abstraction level** -- not over-abstracted, not under-abstracted
- [ ] **No unnecessary complexity** -- YAGNI applied, no premature optimization
- [ ] **File organization** -- code is in the right directory, follows project structure conventions
- [ ] **Type definitions** -- interfaces/types are clear and reusable

### Readability Notes
```
[Reviewer notes on readability improvements]
```

---

## Section 6: Testing

Is the code adequately tested?

- [ ] **New code has tests** -- features and fixes include corresponding test cases
- [ ] **Tests are meaningful** -- test behavior, not implementation details
- [ ] **Edge cases tested** -- boundary values, error conditions, empty states
- [ ] **Test names are descriptive** -- describe the scenario and expected outcome
- [ ] **No flaky tests** -- tests are deterministic, no timing dependencies
- [ ] **Mocks are appropriate** -- external dependencies mocked, internal logic tested directly
- [ ] **Coverage maintained** -- overall coverage does not decrease
- [ ] **Integration tests for critical paths** -- auth flows, payment flows, data mutations
- [ ] **Snapshot tests updated** -- if applicable, snapshots reflect intentional changes

### Testing Notes
```
[Reviewer notes on testing gaps]
```

---

## Section 7: Database and Data (if applicable)

- [ ] **Migration is reversible** -- includes both up and down migration
- [ ] **Migration is safe** -- no data loss, handles existing data
- [ ] **Schema changes are backwards compatible** -- or migration plan documented
- [ ] **RLS policies updated** -- new tables have appropriate Row Level Security
- [ ] **Indexes added** -- new query patterns have supporting indexes
- [ ] **Data types are appropriate** -- using correct Postgres types (uuid, timestamptz, etc.)
- [ ] **Foreign keys and constraints** -- referential integrity maintained
- [ ] **Seed data updated** -- development seed reflects new schema

---

## Section 8: API Design (if applicable)

- [ ] **RESTful conventions followed** -- proper HTTP methods, status codes, URL structure
- [ ] **Request/response types documented** -- TypeScript types or OpenAPI spec
- [ ] **Error responses are consistent** -- standard error format with codes and messages
- [ ] **Versioning considered** -- breaking changes handled appropriately
- [ ] **Idempotency** -- POST/PUT operations are idempotent where expected
- [ ] **Backwards compatible** -- existing clients are not broken

---

## Section 9: DevOps and Infrastructure (if applicable)

- [ ] **Environment variables documented** -- new variables added to `.env.example`
- [ ] **Deployment configuration updated** -- Vercel, Docker, etc. configs reflect changes
- [ ] **Feature flags** -- large features behind flags for safe rollout
- [ ] **Rollback plan** -- documented how to revert if deployment fails
- [ ] **Monitoring updated** -- new features have appropriate alerts and logging

---

## Review Summary

### Verdict

- [ ] **Approved** -- ship it
- [ ] **Approved with minor comments** -- can merge after addressing non-blocking feedback
- [ ] **Request changes** -- must address blocking issues before re-review
- [ ] **Reject** -- fundamental approach is wrong, needs redesign

### Blocking Issues
1. [Issue description and suggested fix]
2. [Issue description and suggested fix]

### Non-Blocking Suggestions
1. [Suggestion]
2. [Suggestion]

### Praise (what was done well)
1. [What was good about this PR]

---

## Review Turnaround Standards

| PR Size | Target Review Time |
|---------|-------------------|
| Small (< 100 lines) | < 4 hours |
| Medium (100-400 lines) | < 8 hours |
| Large (400+ lines) | < 24 hours (should be split) |

---

## Usage Notes

- Every section should be reviewed. Mark items as N/A if they do not apply.
- High/Critical risk PRs require two reviewers.
- If you are unsure about a section, call the relevant specialist brain.
- Security section is mandatory for all PRs, regardless of risk level.
- This checklist should be pasted into the PR review comment for traceability.
