# Model Card Template — Documentation for Production ML Models

## Instructions

A model card documents a machine learning model's intended use, performance
characteristics, fairness properties, and limitations. Every model deployed to
production must have a completed model card. This template follows the structure
proposed by Mitchell et al. (2019) with extensions for operational deployment.
Update the model card whenever the model is retrained or its use case changes.

References: Mitchell et al. (Model Cards for Model Reporting, 2019),
Google Model Cards, Hugging Face Model Card Guide.

---

## Model Overview [REQUIRED]

```
Model name:           [e.g., churn_predictor_v3]
Model version:        [e.g., 3.2.1]
Model type:           [e.g., XGBoost binary classifier]
Task:                 [e.g., predict 30-day customer churn]
Owner:                [team and individual responsible]
Created:              [YYYY-MM-DD]
Last updated:         [YYYY-MM-DD]
Status:               [Development / Staging / Production / Deprecated]
Model registry URI:   [link to model registry entry]
Code repository:      [link to training code]
```

---

## Intended Use [REQUIRED]

### Primary Use Case
[Describe the primary intended use of this model in 2-3 sentences.]

### Intended Users
| User | Use Case | Interaction |
|------|---------|-------------|
| [role 1] | [how they use the model] | [direct/indirect] |
| [role 2] | [how they use the model] | [direct/indirect] |

### Out-of-Scope Uses
[Explicitly list uses for which this model is NOT appropriate.]

- [Out-of-scope use 1: why it is inappropriate]
- [Out-of-scope use 2: why it is inappropriate]

### Ethical Considerations
```
Decision type:        [advisory / automated / hybrid]
Human oversight:      [yes/no, describe]
Affected population:  [who is impacted by model predictions]
Recourse:             [can affected individuals appeal/contest?]
Stakes:               [low / medium / high]
```

---

## Training Data [REQUIRED]

### Dataset Description
```
Dataset name:         [name and version]
Source:               [where the data comes from]
Collection period:    [start date to end date]
Total samples:        [count]
Training set size:    [count] ([%])
Validation set size:  [count] ([%])
Test set size:        [count] ([%])
Split method:         [random / temporal / stratified]
```

### Label Definition
```
Positive class:       [precise definition]
Negative class:       [precise definition]
Label source:         [how ground truth was determined]
Label delay:          [time from prediction to label availability]
Class distribution:
  Training:   positive=[%], negative=[%]
  Test:       positive=[%], negative=[%]
```

### Feature Summary
| Feature | Type | Description | Missing % | Importance Rank |
|---------|------|-------------|-----------|----------------|
| [feature_1] | numeric | [description] | [%] | [rank] |
| [feature_2] | categorical | [description] | [%] | [rank] |
| [feature_3] | numeric | [description] | [%] | [rank] |

### Data Preprocessing
[Describe all preprocessing steps: imputation, encoding, scaling, feature
engineering. Reference the code that implements these steps.]

### Known Data Limitations
1. [Limitation 1: description and potential impact]
2. [Limitation 2: description and potential impact]

---

## Model Architecture [REQUIRED]

### Algorithm
```
Algorithm:            [e.g., XGBoost (gradient boosted trees)]
Framework:            [e.g., xgboost 2.0.3]
Hyperparameters:
  n_estimators:       [value]
  max_depth:          [value]
  learning_rate:      [value]
  min_child_weight:   [value]
  subsample:          [value]
  colsample_bytree:   [value]
  reg_alpha:          [value]
  reg_lambda:         [value]
```

### Tuning
```
Method:               [grid / random / bayesian / manual]
Trials:               [number of configurations evaluated]
Optimization metric:  [metric optimized during tuning]
Cross-validation:     [strategy, e.g., 5-fold stratified]
```

### Model Size
```
Serialized size:      [MB]
Inference memory:     [MB]
Feature count:        [number]
```

---

## Performance Metrics [REQUIRED]

### Overall Performance

| Metric | Value | 95% CI | Threshold | Status |
|--------|-------|--------|-----------|--------|
| AUC-ROC | [value] | [CI] | >= 0.85 | [pass/fail] |
| AUC-PR | [value] | [CI] | >= 0.50 | [pass/fail] |
| Precision@10% | [value] | [CI] | >= 0.40 | [pass/fail] |
| Recall@50% | [value] | [CI] | >= 0.60 | [pass/fail] |
| Brier Score | [value] | [CI] | <= 0.10 | [pass/fail] |
| Log Loss | [value] | [CI] | <= 0.40 | [pass/fail] |

### Performance at Operating Threshold

```
Threshold:            [probability cutoff]
Precision:            [value]
Recall:               [value]
F1:                   [value]
False positive rate:  [value]
```

### Confusion Matrix (at Operating Threshold)

```
                 Predicted Positive  Predicted Negative
Actual Positive      [TP]                [FN]
Actual Negative      [FP]                [TN]
```

### Performance by Segment

| Segment | N | AUC | Precision@10% | Notes |
|---------|---|-----|---------------|-------|
| [segment_1] | [n] | [value] | [value] | [notes] |
| [segment_2] | [n] | [value] | [value] | [notes] |
| [segment_3] | [n] | [value] | [value] | [notes] |

### Calibration

```
Expected Calibration Error (ECE): [value]
Maximum Calibration Error (MCE):  [value]
Calibration method applied:       [Platt scaling / isotonic / none]
```

### Performance Over Time (if retraining)

| Version | Date | AUC | Precision@10% | Data Size |
|---------|------|-----|---------------|-----------|
| v3.0 | [date] | [value] | [value] | [size] |
| v3.1 | [date] | [value] | [value] | [size] |
| v3.2 | [date] | [value] | [value] | [size] |

---

## Fairness Assessment [REQUIRED for models affecting people]

### Protected Attributes Evaluated
[List all protected attributes evaluated: age group, gender, race/ethnicity,
geography, income bracket, etc.]

### Fairness Metrics

| Group | N | Selection Rate | TPR | FPR | Precision | Disparate Impact |
|-------|---|---------------|-----|-----|-----------|-----------------|
| [group_A] | [n] | [%] | [%] | [%] | [%] | [ratio] |
| [group_B] | [n] | [%] | [%] | [%] | [%] | [ratio] |
| [group_C] | [n] | [%] | [%] | [%] | [%] | [ratio] |

### Fairness Assessment

```
Demographic parity difference:    [value] (threshold: < 0.05)
Equalized odds difference:        [value] (threshold: < 0.05)
Disparate impact ratio:           [value] (threshold: > 0.80)
Fairness definition prioritized:  [which definition and why]
```

### Mitigation Applied
[Describe any fairness mitigation applied: pre-processing, in-processing,
or post-processing methods. If none, explain why.]

---

## Operational Details

### Serving Configuration
```
Serving pattern:      [batch / real-time / streaming]
Infrastructure:       [K8s / SageMaker / etc.]
Endpoint:             [URL or path]
Input format:         [JSON / protobuf / etc.]
Output format:        [JSON / protobuf / etc.]
Latency P50:          [ms]
Latency P95:          [ms]
Throughput:           [predictions/second]
```

### Dependencies
```
Feature store:        [name, version]
Upstream pipelines:   [list]
External APIs:        [list]
```

### Monitoring
```
Data drift:           [method, threshold, frequency]
Performance tracking: [metric, window, alert threshold]
Retraining trigger:   [condition]
Last monitored:       [date]
```

### Rollback
```
Previous model:       [version]
Rollback procedure:   [description or link to runbook]
Rollback time:        [estimated minutes]
```

---

## Limitations and Risks [REQUIRED]

### Known Limitations
1. [Limitation 1: what it is and its impact]
2. [Limitation 2: what it is and its impact]
3. [Limitation 3: what it is and its impact]

### Failure Modes
| Scenario | Impact | Mitigation |
|----------|--------|-----------|
| [scenario 1] | [impact] | [mitigation] |
| [scenario 2] | [impact] | [mitigation] |

### Recommendations for Users
[Specific guidance for people interpreting or acting on this model's predictions.]

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| [v3.2] | [date] | [description] | [name] |
| [v3.1] | [date] | [description] | [name] |
| [v3.0] | [date] | [description] | [name] |

---

## Approvals

| Role | Name | Date | Approval |
|------|------|------|----------|
| ML Engineer | [name] | [date] | [approved] |
| ML Reviewer | [name] | [date] | [approved] |
| Product Owner | [name] | [date] | [approved] |
| Ethics Review | [name] | [date] | [approved / N/A] |
