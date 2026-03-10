# AI Evaluation Template

## Instructions

Use this template to design and document a comprehensive evaluation plan for an AI system. Complete this before beginning evaluation. Update with results as evaluation progresses. This template covers evaluation dataset design, metric selection, test execution, analysis, and go/no-go decisions.

---

## 1. Evaluation Overview

### System Under Evaluation

| Field | Value |
|-------|-------|
| System Name | <!-- e.g., "Customer Support AI Assistant v2.0" --> |
| System Type | <!-- e.g., RAG, Agent, Classifier, Generator --> |
| Model(s) Used | <!-- e.g., "Claude Sonnet for generation, Haiku for classification" --> |
| Evaluation Date | <!-- YYYY-MM-DD --> |
| Evaluator | <!-- Name and role --> |
| Previous Evaluation | <!-- Link to previous evaluation, if any --> |

### Evaluation Purpose

<!-- Why is this evaluation being conducted? (Pre-launch, post-update, periodic review, incident investigation) -->

### Scope

<!-- What aspects of the system are being evaluated? What is out of scope? -->

| In Scope | Out of Scope |
|----------|-------------|
|          |             |
|          |             |

---

## 2. Evaluation Dataset

### Dataset Specification

| Attribute | Value |
|-----------|-------|
| Total Examples | <!-- e.g., 150 --> |
| Creation Method | <!-- Expert-created / Production sampling / Synthetic / Mixed --> |
| Ground Truth Source | <!-- Who created and verified ground truth answers --> |
| Date Created | <!-- YYYY-MM-DD --> |
| Last Updated | <!-- YYYY-MM-DD --> |
| Version | <!-- Dataset version --> |

### Dataset Composition

| Category | Count | Percentage | Description |
|----------|-------|-----------|-------------|
| Easy | <!-- e.g., 50 --> | <!-- e.g., 33% --> | <!-- e.g., "Single-turn factual questions" --> |
| Medium | <!-- e.g., 60 --> | <!-- e.g., 40% --> | <!-- e.g., "Multi-step reasoning, cross-document" --> |
| Hard | <!-- e.g., 25 --> | <!-- e.g., 17% --> | <!-- e.g., "Ambiguous queries, contradictory sources" --> |
| Edge Cases | <!-- e.g., 10 --> | <!-- e.g., 7% --> | <!-- e.g., "No relevant data, out-of-domain" --> |
| Adversarial | <!-- e.g., 5 --> | <!-- e.g., 3% --> | <!-- e.g., "Prompt injection, manipulation attempts" --> |

### Topic Distribution

<!-- Break down by the primary dimension of the task -->

| Topic/Category | Count | Real-World Frequency |
|---------------|-------|---------------------|
|               |       |                     |
|               |       |                     |
|               |       |                     |

### Dataset Quality Checks

- [ ] Ground truth verified by at least 2 independent reviewers
- [ ] No overlap with training data
- [ ] Distribution matches expected production distribution
- [ ] Edge cases and failure modes are represented
- [ ] Adversarial examples included
- [ ] Dataset version is pinned and reproducible

---

## 3. Metrics

### Primary Metrics

<!-- The most important metrics for this evaluation. These determine go/no-go. -->

| Metric | Definition | Target | Priority |
|--------|-----------|--------|----------|
|        |           |        | P0       |
|        |           |        | P0       |

### Secondary Metrics

<!-- Additional metrics that provide useful insight but do not determine go/no-go. -->

| Metric | Definition | Target | Priority |
|--------|-----------|--------|----------|
|        |           |        | P1       |
|        |           |        | P1       |
|        |           |        | P2       |

### RAG-Specific Metrics (if applicable)

| Metric | Definition | Target |
|--------|-----------|--------|
| Context Precision | Fraction of retrieved chunks that are relevant | > 0.8 |
| Context Recall | Fraction of relevant chunks that were retrieved | > 0.7 |
| Faithfulness | Fraction of answer claims supported by context | > 0.9 |
| Answer Relevance | Degree to which the answer addresses the query | > 0.85 |

### Fairness Metrics (if applicable)

| Metric | Groups | Target Disparity Ratio |
|--------|--------|----------------------|
|        |        | > 0.8                |

### Performance Metrics

| Metric | Target |
|--------|--------|
| Latency P50 |  |
| Latency P95 |  |
| Latency P99 |  |
| Throughput |  |
| Cost per Request |  |

---

## 4. Evaluation Methods

### Automated Evaluation

| Method | Tool | Metrics Covered | Automated? |
|--------|------|----------------|------------|
| Exact Match | Custom | Accuracy | Yes |
| Schema Validation | JSON Schema | Format Compliance | Yes |
| RAGAS | ragas library | RAG Triad | Yes |
| Content Safety | Safety classifier | Safety pass rate | Yes |

### LLM-as-Judge Evaluation

**Judge Model**: <!-- e.g., Claude Opus -->
**Judge Prompt**: <!-- Link to judge prompt or include below -->

```
<!-- Judge prompt for scoring model outputs -->
```

**Scoring Rubric**:

| Dimension | Score 1 | Score 3 | Score 5 |
|-----------|---------|---------|---------|
| <!-- e.g., Accuracy --> | <!-- Description --> | <!-- Description --> | <!-- Description --> |
| <!-- e.g., Completeness --> |  |  |  |
| <!-- e.g., Clarity --> |  |  |  |

**Calibration**: <!-- Has the LLM judge been calibrated against human evaluators? -->

| Calibration Metric | Value | Acceptable Threshold |
|-------------------|-------|---------------------|
| Correlation with Human Scores |  | > 0.75 |
| Cohen's Kappa |  | > 0.6 |

### Human Evaluation (if applicable)

| Attribute | Value |
|-----------|-------|
| Evaluator Count |  |
| Evaluator Qualification |  |
| Evaluation Method | <!-- Comparative / Absolute scoring / Elo --> |
| Sample Size |  |
| Inter-Annotator Agreement Target | > 0.8 |

---

## 5. Baseline Comparison

### Baselines

| Baseline | Description | Why Included |
|----------|-------------|-------------|
| Base Model | <!-- Unmodified model without fine-tuning/RAG --> | <!-- Measure improvement from customization --> |
| Previous Version | <!-- Previous production version --> | <!-- Ensure no regression --> |
| Rule-Based | <!-- Non-AI approach, if applicable --> | <!-- Justify AI investment --> |
| Human Performance | <!-- Expert human performing same task --> | <!-- Upper bound reference --> |

---

## 6. Results

### Primary Metric Results

| Metric | Target | Baseline | Current | Delta | Status |
|--------|--------|----------|---------|-------|--------|
|        |        |          |         |       | PASS/FAIL |
|        |        |          |         |       |        |

### Secondary Metric Results

| Metric | Target | Baseline | Current | Delta | Status |
|--------|--------|----------|---------|-------|--------|
|        |        |          |         |       |        |
|        |        |          |         |       |        |

### Per-Category Results

| Category | Metric 1 | Metric 2 | Metric 3 | Notes |
|----------|----------|----------|----------|-------|
|          |          |          |          |       |
|          |          |          |          |       |

### Difficulty Stratified Results

| Difficulty | Count | Metric 1 | Metric 2 | Notes |
|-----------|-------|----------|----------|-------|
| Easy |  |  |  |  |
| Medium |  |  |  |  |
| Hard |  |  |  |  |
| Edge Cases |  |  |  |  |

### Fairness Results

| Group | Metric | Value | Disparity Ratio | Status |
|-------|--------|-------|----------------|--------|
|       |        |       |                |        |

### Performance Results

| Metric | Target | Measured | Status |
|--------|--------|---------|--------|
| Latency P50 |  |  |  |
| Latency P95 |  |  |  |
| Cost per Request |  |  |  |

---

## 7. Error Analysis

### Error Categories

| Error Type | Count | Percentage | Severity | Root Cause |
|-----------|-------|-----------|----------|------------|
|           |       |           |          |            |
|           |       |           |          |            |

### Representative Failures

**Failure 1:**
- Input: <!-- Summarize the input -->
- Expected: <!-- What the output should have been -->
- Actual: <!-- What the model produced -->
- Analysis: <!-- Why did the model fail? -->
- Recommended Fix: <!-- How to address this failure -->

**Failure 2:**
- Input:
- Expected:
- Actual:
- Analysis:
- Recommended Fix:

**Failure 3:**
- Input:
- Expected:
- Actual:
- Analysis:
- Recommended Fix:

### Pattern Analysis

<!-- Are there patterns in the failures? Common input types, topics, or formats that cause failures? -->

---

## 8. Safety Evaluation

| Test Category | Tests Run | Pass | Fail | Pass Rate |
|--------------|-----------|------|------|-----------|
| Prompt Injection |  |  |  |  |
| Harmful Content |  |  |  |  |
| PII Leakage |  |  |  |  |
| Jailbreak Attempts |  |  |  |  |
| Bias Probes |  |  |  |  |

### Critical Safety Findings

<!-- List any critical safety findings (severity: High or Critical) -->

| Finding | Severity | Description | Remediation |
|---------|----------|-------------|-------------|
|         |          |             |             |

---

## 9. Go/No-Go Decision

### Decision Criteria

| Criterion | Required | Met | Notes |
|-----------|----------|-----|-------|
| All P0 metrics meet targets | Yes |  |  |
| No P0 metric regression from previous version | Yes |  |  |
| Safety evaluation pass rate > 99% | Yes |  |  |
| No critical safety findings | Yes |  |  |
| Fairness disparity ratios > 0.8 | Yes |  |  |
| P95 latency within target | Yes |  |  |
| Cost per request within budget | Yes |  |  |

### Decision

| Decision | <!-- GO / NO-GO / CONDITIONAL GO --> |
|----------|-------|
| Rationale | <!-- Brief justification --> |
| Conditions (if conditional) | <!-- What must be resolved before full GO --> |
| Next Steps | <!-- What happens next --> |

---

## 10. Recommendations

### Immediate Actions

1. <!-- e.g., "Fix the 3 failure patterns identified in error analysis" -->
2. <!-- e.g., "Add 10 more edge case examples to the evaluation dataset" -->

### Future Improvements

1. <!-- e.g., "Implement semantic caching to reduce latency" -->
2. <!-- e.g., "Fine-tune embedding model on domain data to improve retrieval" -->

### Evaluation Process Improvements

1. <!-- e.g., "Add more adversarial examples for safety testing" -->
2. <!-- e.g., "Improve LLM judge calibration for completeness dimension" -->

---

## Approval

| Role | Name | Date | Decision |
|------|------|------|----------|
| Evaluator |  |  |  |
| Technical Reviewer |  |  |  |
| AI Governance |  |  |  |

---

*Template version: 1.0 | AI Brain | Last updated: [date]*
