# Prompt Library Template

## Instructions

Use this template to document and organize prompts for an AI-powered application. Each prompt entry captures the complete specification needed to reproduce, evaluate, and maintain the prompt. A prompt library is a living document that evolves as prompts are tested, optimized, and versioned.

---

## Library Metadata

| Field | Value |
|-------|-------|
| Application | <!-- Name of the application these prompts serve --> |
| Library Version | <!-- e.g., 2.1.0 --> |
| Last Updated | <!-- YYYY-MM-DD --> |
| Owner | <!-- Team or individual responsible --> |
| Total Prompts | <!-- Count of prompts in this library --> |

---

## Prompt Index

<!-- List all prompts in this library for quick reference -->

| ID | Name | Type | Model | Status |
|----|------|------|-------|--------|
| P-001 | <!-- e.g., "Ticket Classifier" --> | System | <!-- e.g., Claude Haiku --> | Active |
| P-002 | <!-- e.g., "Response Generator" --> | System + User | <!-- e.g., Claude Sonnet --> | Active |
| P-003 | <!-- e.g., "Quality Checker" --> | System | <!-- e.g., Claude Haiku --> | Testing |

---

## Prompt Entry Template

### Prompt: [P-XXX] [Name]

#### Metadata

| Field | Value |
|-------|-------|
| Prompt ID | <!-- Unique identifier, e.g., P-001 --> |
| Name | <!-- Descriptive name --> |
| Version | <!-- Semantic version --> |
| Status | <!-- Draft / Testing / Active / Deprecated --> |
| Model | <!-- Target model and version --> |
| Temperature | <!-- Recommended temperature --> |
| Max Tokens | <!-- Recommended max_tokens --> |
| Author | <!-- Who wrote this prompt --> |
| Last Modified | <!-- YYYY-MM-DD --> |
| Last Evaluated | <!-- YYYY-MM-DD --> |
| Evaluation Score | <!-- Overall score from last evaluation --> |

#### Purpose

<!-- 1-2 sentences describing what this prompt does and when it is used in the application flow. -->

#### System Prompt

```
<!-- The complete system prompt. Copy-paste ready. -->
```

#### User Message Template

```
<!-- The user message template with {{variable}} placeholders. -->
<!-- Document each variable below. -->
```

#### Variables

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| {{variable_1}} |  |  |  |  |
| {{variable_2}} |  |  |  |  |

#### Expected Output Format

<!-- Describe the exact expected output format. Include a complete example. -->

```
<!-- Example output -->
```

#### Output Schema (if structured)

```json
{
  "field_1": {
    "type": "string",
    "description": ""
  },
  "field_2": {
    "type": "number",
    "description": ""
  }
}
```

#### Few-Shot Examples (if applicable)

**Example 1:**
- Input: <!-- example input -->
- Output: <!-- expected output -->

**Example 2:**
- Input: <!-- example input -->
- Output: <!-- expected output -->

**Example 3:**
- Input: <!-- example input -->
- Output: <!-- expected output -->

#### Tools (if applicable)

<!-- List any tools this prompt uses -->

| Tool Name | Purpose | When Used |
|-----------|---------|-----------|
|           |         |           |

#### Evaluation Results

| Metric | Score | Target | Date Evaluated |
|--------|-------|--------|---------------|
| Accuracy |  |  |  |
| Format Compliance |  |  |  |
| Consistency (10-run) |  |  |  |
| Latency (avg) |  |  |  |
| Cost (avg) |  |  |  |

#### Test Cases

<!-- Key test cases that must pass for this prompt version -->

| Test ID | Input Summary | Expected Output | Status |
|---------|--------------|-----------------|--------|
| T-001 |  |  | Pass/Fail |
| T-002 |  |  |  |
| T-003 |  |  |  |
| T-004 (edge case) |  |  |  |
| T-005 (adversarial) |  |  |  |

#### Known Limitations

1. <!-- e.g., "Does not handle multi-language inputs" -->
2. <!-- e.g., "May produce verbose output for simple queries" -->

#### Dependencies

<!-- Other prompts or system components this prompt depends on -->

| Dependency | Type | Description |
|-----------|------|-------------|
|           |      |             |

#### Change History

| Version | Date | Author | Changes | Eval Score |
|---------|------|--------|---------|------------|
|         |      |        |         |            |
|         |      |        |         |            |

---

## Prompt Composition Map

<!-- Show how prompts relate to each other in the application flow -->

```
User Input
    |
    v
[P-001: Input Classifier]
    |
    +--> Category A --> [P-002: Response Generator (Category A)]
    |                       |
    |                       v
    |                   [P-004: Quality Checker]
    |                       |
    |                       v
    |                   Response to User
    |
    +--> Category B --> [P-003: Response Generator (Category B)]
                            |
                            v
                        [P-004: Quality Checker]
                            |
                            v
                        Response to User
```

---

## Shared Components

### Shared System Prompt Blocks

<!-- Reusable prompt blocks shared across multiple prompts -->

#### Block: Safety Instructions
```
<!-- Standard safety instructions included in all user-facing prompts -->
```

#### Block: Output Format Instructions
```
<!-- Standard output format instructions -->
```

#### Block: Citation Instructions
```
<!-- Standard citation instructions for RAG-based prompts -->
```

---

## Prompt Optimization Log

<!-- Track optimization experiments across the library -->

| Date | Prompt | Change | Metric | Before | After | Decision |
|------|--------|--------|--------|--------|-------|----------|
|      |        |        |        |        |       | Adopted/Rejected |
|      |        |        |        |        |       |          |

---

## Review Schedule

| Prompt | Last Review | Next Review | Reviewer |
|--------|------------|-------------|----------|
|        |            |             |          |
|        |            |             |          |

---

## Library Governance

### Adding a New Prompt
1. Create a new entry using the Prompt Entry Template above
2. Write at least 5 test cases
3. Evaluate against test cases and document scores
4. Submit for peer review
5. Upon approval, set status to "Active"

### Modifying an Existing Prompt
1. Create a new version (do not modify in place)
2. Run full test suite on new version
3. Compare evaluation scores to previous version
4. If improved or neutral on all metrics, submit for review
5. If regression on any metric, document justification
6. Upon approval, update status and deprecate old version

### Retiring a Prompt
1. Set status to "Deprecated"
2. Document the replacement prompt (if any)
3. Remove from production after transition period
4. Retain in library for historical reference

---

*Template version: 1.0 | AI Brain | Last updated: [date]*
