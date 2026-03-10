# CI — Continuous Integration Recipe

> **Brain:** Engineering Brain
> **Category:** Solutions / Recipes
> **Last Updated:** 2026-02-19
> **Cross-References:** `Automations/Recipes/CI-CD.md`, `Verification/TripleVerification.md`, `Solutions/SolutionIndex.md`

---

## CI Philosophy

Continuous Integration exists to serve one purpose: **fast, honest feedback on every change**.

### Core Principles

1. **Fast Feedback** — Developers must know within minutes whether their change is safe. A CI pipeline that takes 30+ minutes is a pipeline people learn to ignore.
2. **Fail Fast** — The cheapest checks run first. Lint failures should surface in seconds, not after a 10-minute build.
3. **Reproducible Builds** — The same commit must produce the same result on every run. No flaky environments, no ambient state, no "works on my machine."
4. **Green Means Green** — A passing pipeline means the change is safe to merge. If the pipeline lies (flaky tests, skipped checks), trust erodes and velocity collapses.
5. **Pipeline as Code** — CI configuration lives in the repository alongside the code it validates. No click-ops, no snowflake configurations.

---

## Pipeline Structure

The stage order is intentional. Each stage acts as a gate — if it fails, later stages do not run.

```
lint --> type-check --> test --> build --> scan
```

### Stage Rationale

| Stage | Purpose | Why This Order |
|-------|---------|----------------|
| **Lint** | Catch formatting, style, and static errors | Fastest check (~10s). Catches trivial mistakes before anything else runs. |
| **Type-Check** | Verify type safety across the codebase | Fast (~30s). Catches structural errors that lint misses. Cheaper than running tests. |
| **Test** | Run unit and integration test suites | Medium speed (~2-8 min). Validates behavior. Depends on code being well-formed (lint + types). |
| **Build** | Compile/bundle the production artifact | Slower (~3-10 min). Confirms the artifact can be produced. Depends on tests passing. |
| **Scan** | Security scanning, license auditing, SAST | Runs on the final artifact or codebase. Catches vulnerabilities before merge. |

### Why Not Build Before Test?

Building before testing wastes time when tests fail. Tests validate logic; builds validate packaging. Logic errors are more common than packaging errors, so test first.

---

## GitHub Actions Configuration Patterns

### Workflow Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  merge_group:
    types: [checks_requested]
```

- **push** on main/develop: Validates the merge result.
- **pull_request**: Validates proposed changes before review.
- **merge_group**: Supports merge queue (see below).

### Environment Pinning

```yaml
env:
  NODE_VERSION: '20.11.0'
  PNPM_VERSION: '8.15.1'
```

Pin exact versions. Never use `node-version: 20` (resolves to latest 20.x, which changes under you).

### Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

Always declare explicit permissions. Never use `permissions: write-all`.

---

## Branch Protection Integration

### Required Settings

| Setting | Value | Reason |
|---------|-------|--------|
| Require status checks | Enabled | Pipeline must pass before merge |
| Require branches up to date | Enabled | Merge skew causes false greens |
| Required checks | `lint`, `typecheck`, `test`, `build`, `scan` | All five stages are merge gates |
| Require review | 1+ approvals | Human review is non-negotiable |
| Dismiss stale reviews | Enabled | New pushes invalidate old approvals |
| Require linear history | Enabled | Clean history, no merge commits |

### How Required Checks Work

GitHub blocks the merge button until every required check reports `success`. If a check is `skipped` (e.g., path-filtered), it must still report status or the PR hangs.

---

## Caching Strategies

### Dependency Caching

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: ${{ env.PNPM_VERSION }}

- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'
```

The `cache: 'pnpm'` directive caches the pnpm store keyed on `pnpm-lock.yaml`. Cache hit = skip `pnpm install` download phase.

### Build Caching

```yaml
- name: Cache build artifacts
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      node_modules/.cache
    key: build-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('src/**') }}
    restore-keys: |
      build-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-
      build-${{ runner.os }}-
```

Build caches use a cascading key strategy: exact match first, then progressively looser fallbacks.

### Cache Invalidation Rules

- Lockfile changes: Full cache miss (correct behavior).
- Source changes only: Partial cache hit on dependencies (correct behavior).
- Never cache `node_modules` directly. Cache the package manager store instead.

---

## Parallelization

### Matrix Strategy

```yaml
jobs:
  test:
    strategy:
      fail-fast: true
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: pnpm test --shard=${{ matrix.shard }}/4
```

- `fail-fast: true` — Cancel remaining shards when one fails. No point waiting for shard 4 if shard 1 already failed.
- Shard count should match test suite size. 4 shards is a good starting point for 500+ tests.

### Independent Stage Parallelization

Lint and type-check have no dependencies on each other. Run them in parallel:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  typecheck:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    needs: [lint, typecheck]
    runs-on: ubuntu-latest
    steps: [...]
```

Test waits for both lint and typecheck. Build waits for test. Scan waits for build.

---

## Flaky Test Handling

Flaky tests are **trust poison**. They train developers to ignore failures.

### Three-Tier Response

| Tier | Action | Timeline |
|------|--------|----------|
| **Detect** | Track test pass/fail rates per test. Flag any test with <99% pass rate. | Automated |
| **Quarantine** | Move flaky test to a quarantine suite that runs but does not block merge. | Within 24 hours |
| **Fix or Delete** | Either fix the root cause or delete the test. Quarantine is not permanent. | Within 1 week |

### Retry Strategy

```yaml
- name: Run tests with retry
  uses: nick-fields/retry@v3
  with:
    timeout_minutes: 10
    max_attempts: 2
    command: pnpm test
```

Retries are a **diagnostic tool**, not a fix. If a test needs retries to pass, it is flaky and must enter the quarantine pipeline.

### Flaky Test Tracking

Log every retry occurrence. If the same test retries more than twice in a week, it is automatically flagged for quarantine review.

---

## Merge Queue Patterns

Merge queues serialize merges to prevent "semantic merge conflicts" where two PRs pass individually but break when combined.

### GitHub Merge Queue Configuration

```yaml
on:
  merge_group:
    types: [checks_requested]
```

### How It Works

1. Developer clicks "Merge when ready."
2. GitHub creates a temporary merge branch combining the PR with the current queue.
3. CI runs on this temporary branch.
4. If CI passes, the PR merges. If it fails, the PR is removed from the queue.

### When to Use Merge Queues

- Repositories with >5 active contributors.
- Main branch receives >10 PRs per day.
- Integration test failures after merge are common.

---

## Required Checks Configuration

### Defining Required Checks

In repository settings under "Branch protection rules":

```
Required status checks:
  - ci / lint
  - ci / typecheck
  - ci / test
  - ci / build
  - ci / scan
```

### Naming Convention

Use the `job_name` from the workflow file. GitHub matches on `workflow_name / job_name`. Keep names stable -- renaming a job silently removes it from required checks.

### Path-Filtered Checks

If a check only runs on certain paths (e.g., docs changes skip tests), use `paths-ignore` carefully. The check must still report a status, or the PR will hang waiting for a check that never runs.

Solution: Use `dorny/paths-filter` to conditionally skip steps but always report the job status.

---

## Example Pipeline YAML

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  merge_group:
    types: [checks_requested]

permissions:
  contents: read

env:
  NODE_VERSION: '20.11.0'
  PNPM_VERSION: '8.15.1'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    name: Test
    needs: [lint, typecheck]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: pnpm test --shard=${{ matrix.shard }}/4

  build:
    name: Build
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: '${{ env.PNPM_VERSION }}' }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  scan:
    name: Security Scan
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

---

## Maintenance

- Review pipeline speed monthly. If total time exceeds 15 minutes, investigate.
- Audit required checks quarterly. Remove checks that no longer provide value.
- Update pinned versions when security patches are released.
- Log any CI-related discoveries to `Memory/ExperienceLog.md`.
