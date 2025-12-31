# OUTPUT CONTRACTS
**Mandatory Structure for Engineering Deliverables**

---

## Purpose

Output Contracts define what a "complete" engineering response must include.

They eliminate:
- vague answers
- partial solutions
- unverified claims
- missing artifacts
- ambiguous next steps

If an output does not satisfy the applicable contract, the work is not done.

---

## Universal Rules (Apply to All Outputs)

Every engineering output MUST:

- Declare Artifact Type (see below)
- Be structured, not conversational
- Be reproducible by another engineer
- Reference evidence where claims are made
- Align with Engineering Modes, Checklist, and Playbook
- Explicitly state assumptions (or state "none")

If any of the above are missing, the output is invalid.

---

## Artifact Type Declaration

**REQUIRED for all outputs.**

Before planning or implementation, you MUST explicitly classify the artifact type.

### Valid Artifact Types

- **Full Document** — standalone entry point, directly navigable (e.g., `/index.html`, `/dashboard.html`)
- **Fragment** — router-injected partial, not directly navigable, requires routing context
- **Component** — reusable UI or logic module, consumed by documents or fragments
- **Script** — executable code, automation, or utility
- **Automation** — workflow, CI/CD pipeline, or orchestration logic
- **Test** — verification artifact (unit, integration, UI, etc.)

### Artifact Type Governs

The declared artifact type determines:

- **Navigation strategy** — how users or systems access it
- **CSS strategy** — scoped, global, or injected styling
- **Test entry point** — what URL or interface to verify
- **Verification scope** — what constitutes complete validation
- **Cleanup boundaries** — what files and dependencies are in scope

### Enforcement

- Outputs without an explicit artifact type declaration are **invalid**.
- Treating a Fragment as a Full Document is a **structural error**.
- Planning navigation or tests without declaring artifact type is **forbidden**.

If the artifact type is ambiguous, STOP and request clarification.

### Why This Exists

This rule prevents architectural and testing errors caused by treating different artifact types (documents, fragments, components, scripts) as interchangeable. Fragment vs document confusion leads to incorrect routing assumptions, broken navigation tests, and CSS scope violations. Explicit artifact type declaration makes verification and routing behavior deterministic and ensures cleanup boundaries are correct.

---

## Contract Selection

Before producing output, select the applicable contract(s):

- Design / Architecture
- Code Implementation
- Automation / Scripts
- Debugging / Fix
- Verification / Testing
- Cleanup / Deletion
- Decision / Recommendation

Multiple contracts may apply.

---

## Contract: Design / Architecture

Required sections:

1. **Goal**
2. **Constraints**
3. **Proposed Structure**
4. **Key Decisions**
5. **Non-Goals**
6. **Verification Plan**
7. **Risks & Mitigations**

Artifacts:
- diagrams (if helpful)
- folder structure
- interface definitions

---

## Contract: Code Implementation

Required sections:

1. **Change Summary**
2. **Files Modified**
3. **Code (Exact)**
4. **Why This Works**
5. **Edge Cases**
6. **Verification Steps**
7. **Cleanup Performed**

Rules:
- Code must be complete, not illustrative
- Snippets must compile or run as stated

---

## Contract: Automation / Scripts

Required sections:

1. **Automation Goal**
2. **Preconditions**
3. **Commands / Scripts**
4. **Expected Artifacts**
5. **Verification**
6. **Failure Handling**
7. **Restoration Path**

Rules:
- No "run this and see"
- Commands must be copy-pastable

---

## Contract: Debugging / Fix

Required sections:

1. **Observed Symptom**
2. **Reproduction Steps**
3. **Evidence (Logs/Errors)**
4. **Root Cause**
5. **Fix Applied**
6. **Verification**
7. **Regression Prevention**

Rules:
- Evidence is mandatory
- Guessing is forbidden

---

## Contract: Verification / Testing

Required sections:

1. **What Is Being Verified**
2. **Tooling Used**
3. **Exact Commands**
4. **Expected Results**
5. **Actual Results**
6. **Artifacts Produced**
7. **Pass/Fail Decision**

Rules:
- UI requires Playwright (Chromium default)
- Claims require artifacts

---

## Contract: Cleanup / Deletion

Required sections:

1. **What Was Removed**
2. **Why It Was Safe**
3. **Dependencies Checked**
4. **Files Affected**
5. **Verification**
6. **Resulting State**

Rules:
- Deletions must be explicit
- Silent removal is forbidden

---

## Contract: Decision / Recommendation

Required sections:

1. **Decision**
2. **Alternatives Considered**
3. **Evaluation Criteria**
4. **Tradeoffs**
5. **Final Justification**
6. **Follow-Up Actions**

Rules:
- Opinions must be grounded in constraints
- "Best practice" without justification is invalid

---

## Completion Gate

Before declaring work complete, confirm:

- All required contract sections are present
- Evidence exists for verification claims
- Cleanup and memory updates were considered
- Engineering Checklist passes

If not, continue work.

---

## Enforcement

Outputs that violate contracts must be corrected before proceeding.

Repeated violations may be logged as regressions.

---

**These Output Contracts are binding and enforced.**
