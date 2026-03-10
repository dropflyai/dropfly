# Operations Brain -- Patterns Index

## Overview

Patterns are proven, reusable approaches to common operational challenges.
Each pattern documents the context (when to use), the structure (how it
works), the steps (what to do), and the verification (how to confirm success).

Patterns are NOT rigid templates -- they are starting points that must be
adapted to the specific context. The underlying principles are universal;
the specific implementation details will vary.

---

## Available Patterns

### 1. Process Improvement Pattern

**File:** `process_improvement_pattern.md`

**When to Use:**
- A process is underperforming (quality, speed, cost, or reliability)
- Customer complaints or internal pain points indicate process failure
- Metrics show a declining or volatile trend
- A process has not been reviewed or improved in 6+ months

**What It Covers:**
- Problem identification and scoping
- Current state analysis (baseline measurement)
- Root cause analysis (5 Whys, Fishbone, Pareto)
- Solution design and selection
- Implementation planning
- Verification and control
- Handoff to ongoing operations

---

### 2. Scaling Operations Pattern

**File:** `scaling_ops_pattern.md`

**When to Use:**
- The organization is approaching or has reached a 10x growth inflection
- Processes that worked at current scale are showing strain
- Headcount is growing faster than revenue (linear scaling problem)
- Manual processes cannot keep up with demand
- Quality or delivery is degrading under increasing volume

**What It Covers:**
- Scaling audit (what will break at 10x)
- Standardization (SOP creation and deployment)
- Automation prioritization and implementation
- Capacity planning and resource allocation
- Knowledge management system design
- Metrics and monitoring for scaled operations
- Continuous improvement at scale

---

### 3. Vendor Onboarding Pattern

**File:** `vendor_onboarding_pattern.md`

**When to Use:**
- A new vendor has been selected and contracted
- An existing vendor is being onboarded for a new scope of work
- A vendor transition is occurring (replacing one vendor with another)
- Outsourcing a function for the first time

**What It Covers:**
- Pre-onboarding preparation (documentation, access, contacts)
- Knowledge transfer protocol (explicit, tacit, tribal knowledge)
- Parallel run design and execution
- Go-live readiness assessment
- Stabilization period management
- Governance structure activation
- Performance baseline establishment

---

## How to Use Patterns

```
PATTERN USAGE PROTOCOL:
1. IDENTIFY the operational challenge
2. SELECT the most applicable pattern
3. READ the full pattern before starting
4. ADAPT the pattern to your specific context
5. EXECUTE the steps in order (do not skip)
6. VERIFY results against success criteria
7. DOCUMENT deviations and lessons learned
8. UPDATE the pattern if improvements are discovered
```

---

## Pattern Governance

- Every pattern has an owner (Operations Brain by default)
- Patterns are reviewed quarterly for relevance and accuracy
- New patterns are created when a successful approach is used 3+ times
- Pattern updates require validation against at least one real use case
- Patterns reference specific modules for detailed background

---

## Cross-References

| Pattern | Primary Modules Referenced |
|---------|--------------------------|
| Process Improvement | `02_process/`, `01_foundations/`, `06_metrics/` |
| Scaling Operations | `05_scaling/`, `06_metrics/`, `02_process/` |
| Vendor Onboarding | `07_vendor/`, `02_process/`, `08_excellence/` |

---

**Patterns encode operational wisdom. Use them as starting points, adapt
them to context, and contribute improvements back when you discover better
approaches.**
