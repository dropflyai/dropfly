# Model Card Template

## Instructions

Complete this model card for every model deployed to production. Model cards provide stakeholders with the information needed to understand what a model does, how well it performs, and what its limitations are. Update this card whenever the model is retrained, fine-tuned, or its deployment context changes.

---

## 1. Model Details

### Basic Information

| Field | Value |
|-------|-------|
| Model Name | <!-- e.g., "Customer Support Ticket Classifier v2.3" --> |
| Model Version | <!-- Semantic version: MAJOR.MINOR.PATCH --> |
| Model Type | <!-- e.g., Fine-tuned classifier, RAG system, Agent --> |
| Base Model | <!-- e.g., "Claude Sonnet 4", "Llama 3 8B" --> |
| Date Created | <!-- YYYY-MM-DD --> |
| Last Updated | <!-- YYYY-MM-DD --> |
| Owner | <!-- Team or individual responsible --> |
| Contact | <!-- Email or Slack channel for questions --> |

### Model Architecture

<!-- Describe the model's architecture. For fine-tuned models, describe the base model and fine-tuning approach. For systems using API models, describe the prompt architecture and any additional components (RAG, agents, chains). -->

### Training Summary

| Field | Value |
|-------|-------|
| Fine-Tuning Method | <!-- e.g., LoRA rank 16, QLoRA, Full fine-tuning, N/A (prompt-only) --> |
| Training Data Size | <!-- e.g., "5,000 labeled examples" --> |
| Training Duration | <!-- e.g., "3 epochs, 2 hours on 1x A100" --> |
| Training Cost | <!-- e.g., "$15 in compute" --> |
| Key Hyperparameters | <!-- e.g., "lr=2e-4, batch_size=8, lora_rank=16" --> |

---

## 2. Intended Use

### Primary Use Cases

<!-- List the specific use cases this model is designed for. Be precise. -->

1. <!-- e.g., "Classify incoming customer support tickets into 12 categories" -->
2. <!-- e.g., "Route tickets to the appropriate support team based on classification" -->
3.

### Intended Users

| User Group | How They Use the Model |
|-----------|----------------------|
|           |                      |
|           |                      |

### Out-of-Scope Use Cases

<!-- Explicitly list use cases this model should NOT be used for. -->

1. <!-- e.g., "Should NOT be used for medical triage or emergency classification" -->
2. <!-- e.g., "Should NOT be used without human review for legal document classification" -->
3.

---

## 3. Training Data

### Data Description

| Attribute | Value |
|-----------|-------|
| Data Sources | <!-- Where did the training data come from? --> |
| Total Examples | <!-- Number of training examples --> |
| Date Range | <!-- Time range of the data --> |
| Languages | <!-- Languages represented --> |
| Preprocessing | <!-- Key preprocessing steps --> |

### Data Distribution

<!-- Describe the distribution of the training data across key dimensions (categories, demographics, sources). Include a table showing distribution across the primary task dimension. -->

| Category | Count | Percentage |
|----------|-------|-----------|
|          |       |           |
|          |       |           |
|          |       |           |

### Known Data Limitations

<!-- Describe any known limitations of the training data that may affect model performance. -->

1. <!-- e.g., "Training data is predominantly English; performance on non-English text is not validated" -->
2. <!-- e.g., "Data was collected from Jan-Jun 2024; seasonal patterns may not be captured" -->
3.

---

## 4. Evaluation Results

### Standard Benchmarks

<!-- For fine-tuned models, report standard benchmark results to assess capability retention. -->

| Benchmark | Base Model Score | Fine-Tuned Score | Delta |
|-----------|-----------------|------------------|-------|
| MMLU |  |  |  |
| HumanEval |  |  |  |
| MT-Bench |  |  |  |

### Task-Specific Evaluation

<!-- Report performance on the primary task using the task-specific evaluation dataset. -->

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Accuracy |  |  | <!-- Pass/Fail --> |
| Precision |  |  |  |
| Recall |  |  |  |
| F1 Score |  |  |  |
| Latency (P95) |  |  |  |
| Cost per Request |  |  |  |

### Per-Category Performance

<!-- Break down performance by the primary task dimension (e.g., classification categories). -->

| Category | Precision | Recall | F1 | Support |
|----------|-----------|--------|-----|---------|
|          |           |        |     |         |
|          |           |        |     |         |

### Evaluation Dataset

| Attribute | Value |
|-----------|-------|
| Size | <!-- Number of evaluation examples --> |
| Source | <!-- How evaluation data was collected --> |
| Annotation | <!-- Who annotated and inter-annotator agreement --> |
| Last Updated | <!-- YYYY-MM-DD --> |

---

## 5. Fairness Analysis

### Demographic Groups Tested

<!-- List all demographic groups across which fairness was evaluated. -->

| Attribute | Groups Tested |
|-----------|--------------|
|           |              |

### Fairness Metrics

<!-- Report fairness metrics across demographic groups. -->

| Metric | Group A | Group B | Disparity Ratio | Threshold | Status |
|--------|---------|---------|----------------|-----------|--------|
|        |         |         |                | > 0.8     |        |
|        |         |         |                |           |        |

### Intersectional Analysis

<!-- Report results at the intersection of multiple demographic attributes if applicable. -->

| Intersection | Metric | Value | Baseline | Status |
|-------------|--------|-------|----------|--------|
|             |        |       |          |        |

### Bias Mitigation Applied

<!-- Describe any bias mitigation techniques applied. -->

| Technique | Description | Impact |
|-----------|-------------|--------|
|           |             |        |

---

## 6. Ethical Considerations

### Potential Harms

<!-- Identify ways this model could cause harm if misused or if it makes errors. -->

| Harm | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
|      |           |          |            |
|      |           |          |            |

### Human Oversight

<!-- Describe the human oversight mechanisms in place. -->

| Mechanism | Description |
|-----------|-------------|
| Human-in-the-loop | <!-- When is human review required? --> |
| Appeal process | <!-- Can affected individuals appeal model decisions? --> |
| Override capability | <!-- Can operators override model decisions? --> |

### Privacy Considerations

| Consideration | Description |
|--------------|-------------|
| PII in training data | <!-- How was PII handled? --> |
| PII in inputs | <!-- How is PII in production inputs handled? --> |
| Data retention | <!-- How long are model inputs/outputs retained? --> |

---

## 7. Limitations and Caveats

### Known Limitations

<!-- Be specific and honest about what the model cannot do well. -->

1. <!-- e.g., "Performance degrades on inputs longer than 2000 tokens" -->
2. <!-- e.g., "Cannot reliably distinguish between categories X and Y (confusion rate: 15%)" -->
3. <!-- e.g., "Does not support languages other than English" -->

### Known Failure Modes

<!-- Describe specific scenarios where the model is known to fail. -->

| Scenario | Expected Behavior | Actual Behavior | Frequency |
|----------|-------------------|-----------------|-----------|
|          |                   |                 |           |
|          |                   |                 |           |

### Environmental Conditions

<!-- Under what conditions does performance degrade? -->

| Condition | Impact | Mitigation |
|-----------|--------|------------|
| High traffic | <!-- e.g., "Latency increases 2x" --> |  |
| Provider outage | <!-- e.g., "Falls back to rule-based system" --> |  |
| Stale data | <!-- e.g., "Accuracy drops if data not refreshed in 7 days" --> |  |

---

## 8. Deployment Information

### Production Configuration

| Field | Value |
|-------|-------|
| Deployment Environment | <!-- e.g., AWS us-east-1, GCP us-central1 --> |
| Serving Framework | <!-- e.g., vLLM, API-based, custom --> |
| Monitoring Dashboard | <!-- URL --> |
| Alert Configuration | <!-- URL or description --> |
| Rollback Procedure | <!-- Brief description or link --> |

### Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
|           |         |         |

---

## 9. Recommendations for Users

### Best Practices

1. <!-- e.g., "Always verify model output for high-stakes decisions" -->
2. <!-- e.g., "Provide clear, specific inputs for best results" -->
3.

### When to Escalate to Human Review

1. <!-- e.g., "When model confidence is below 0.7" -->
2. <!-- e.g., "When the input falls outside the trained domain" -->
3.

---

## 10. Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
|         |      |        |         |

---

## Approval

| Role | Name | Date |
|------|------|------|
| Model Owner |  |  |
| AI Governance |  |  |
| Technical Reviewer |  |  |

---

*Template version: 1.0 | AI Brain | Based on Mitchell et al. (2019) Model Cards for Model Reporting*
