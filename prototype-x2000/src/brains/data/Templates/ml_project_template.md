# ML Project Template — Structured Plan from Problem to Production

## Instructions

Copy this template for every new ML project. Fill in each section before
proceeding to the next phase. Sections marked [REQUIRED] must be completed
before work begins. Sections marked [UPDATE] should be updated as the
project progresses. Delete the instructions and bracketed guidance when
filling in.

---

## 1. Project Overview [REQUIRED]

### 1.1 Project Name
[Project name, version]

### 1.2 Business Problem
[Describe the business problem in plain language. What pain point does this solve?
Who is affected? What happens if we do nothing?]

### 1.3 ML Problem Formulation
[Translate the business problem into an ML task]

```
Task type:        [classification / regression / ranking / clustering / anomaly detection]
Input:            [what features are available at prediction time]
Output:           [what the model predicts]
Grain:            [one prediction per what? per customer? per transaction?]
Prediction trigger: [when does a prediction need to happen?]
Latency requirement: [batch / real-time / near-real-time, with target ms]
```

### 1.4 Success Criteria
[Define what success looks like in both ML and business terms]

```
ML metric:        [e.g., AUC-ROC > 0.85, RMSE < $50]
Business metric:  [e.g., reduce churn by 10%, save $500K annually]
Baseline:         [current performance without ML, or simple heuristic]
Target:           [minimum acceptable performance to ship]
Stretch:          [aspirational performance]
```

### 1.5 Stakeholders
| Role | Name | Responsibility |
|------|------|---------------|
| Project sponsor | [name] | Business case, resource allocation |
| Product owner | [name] | Requirements, acceptance criteria |
| ML engineer | [name] | Model development, deployment |
| Data engineer | [name] | Data pipelines, feature store |
| ML reviewer | [name] | Code review, model validation |

### 1.6 Timeline
| Milestone | Target Date | Status |
|-----------|------------|--------|
| Problem framing approved | [date] | [status] |
| Data readiness confirmed | [date] | [status] |
| Baseline model trained | [date] | [status] |
| Model validated | [date] | [status] |
| Shadow deployment | [date] | [status] |
| A/B test launch | [date] | [status] |
| Production rollout | [date] | [status] |

---

## 2. Data Assessment [REQUIRED]

### 2.1 Data Sources
| Source | Type | Rows | Freshness | Quality Assessment |
|--------|------|------|-----------|-------------------|
| [source 1] | [batch/streaming] | [count] | [frequency] | [quality notes] |
| [source 2] | | | | |

### 2.2 Target Variable
```
Definition:      [precise definition of what we are predicting]
Label source:    [how is the ground truth determined?]
Label delay:     [how long until we know the true outcome?]
Class balance:   [for classification: positive rate %]
Label quality:   [any known issues with labels?]
```

### 2.3 Feature Inventory (Initial)
| Feature | Source | Type | Missing % | Expected Importance |
|---------|--------|------|-----------|-------------------|
| [feature 1] | [source] | [numeric/categorical/text] | [%] | [high/medium/low] |
| [feature 2] | | | | |

### 2.4 Data Quality Assessment
```
Completeness:    [% complete for key fields]
Duplicates:      [% duplicate rows on primary key]
Consistency:     [cross-system agreement rate]
Volume:          [total rows available for training]
Time range:      [earliest to latest available data]
Known issues:    [list any known data quality problems]
```

### 2.5 Privacy and Ethics Assessment
```
PII present:      [yes/no, which fields]
Protected attributes: [age, gender, race, etc.]
Consent basis:    [legal basis for using this data]
Anonymization:    [approach if PII must be removed]
Fairness risk:    [potential for disparate impact]
```

---

## 3. Experimentation [UPDATE]

### 3.1 Experiment Log
| ID | Date | Description | Model | AUC | Precision@10% | Notes |
|----|------|-------------|-------|-----|---------------|-------|
| [1] | [date] | [description] | [type] | [score] | [score] | [notes] |

### 3.2 Feature Engineering
| Feature | Description | Computation | Impact on AUC |
|---------|-----------|-------------|--------------|
| [feature] | [what it measures] | [SQL/Python] | [+/- delta] |

### 3.3 Hyperparameter Tuning Results
```
Best configuration:
  model_type:       [e.g., XGBoost]
  n_estimators:     [value]
  max_depth:        [value]
  learning_rate:    [value]
  [other params]:   [values]

Tuning method:      [grid / random / bayesian]
Tuning trials:      [number]
Cross-validation:   [k-fold, k=?]
```

### 3.4 Model Comparison
| Model | AUC | Precision@10% | Recall@50% | Latency (ms) | Size (MB) |
|-------|-----|---------------|------------|---------------|-----------|
| Baseline (heuristic) | [score] | [score] | [score] | [ms] | N/A |
| Logistic Regression | [score] | [score] | [score] | [ms] | [size] |
| XGBoost | [score] | [score] | [score] | [ms] | [size] |
| Neural Network | [score] | [score] | [score] | [ms] | [size] |

---

## 4. Model Evaluation [UPDATE]

### 4.1 Performance Metrics
```
Primary metric:    [metric name: value +/- CI]
Secondary metrics: [metric name: value +/- CI]
Calibration:       [Brier score, ECE]
```

### 4.2 Error Analysis
```
False Positives: [describe common false positive patterns]
False Negatives: [describe common false negative patterns]
Worst segments:  [which user/data segments perform poorly?]
```

### 4.3 Fairness Evaluation
| Protected Group | Selection Rate | TPR | FPR | Disparate Impact Ratio |
|----------------|---------------|-----|-----|----------------------|
| Group A | [%] | [%] | [%] | [ratio] |
| Group B | [%] | [%] | [%] | [ratio] |

### 4.4 Feature Importance
| Rank | Feature | Importance Score | SHAP Direction |
|------|---------|-----------------|---------------|
| 1 | [feature] | [score] | [positive/negative correlation] |
| 2 | [feature] | [score] | [direction] |

---

## 5. Deployment Plan [UPDATE]

### 5.1 Serving Architecture
```
Serving pattern:    [batch / real-time / streaming]
Infrastructure:     [K8s / SageMaker / Vertex / custom]
Scaling:            [autoscaling policy]
Rollback:           [how to revert to previous model]
```

### 5.2 A/B Test Design
```
Hypothesis:       [what we expect to observe]
Primary metric:   [business metric to measure]
Sample size:      [required for statistical power]
Duration:         [minimum experiment duration]
Traffic split:    [control % / treatment %]
Guardrail metrics: [latency, error rate, etc.]
```

### 5.3 Monitoring Plan
```
Data drift:       [method, frequency, threshold]
Performance:      [metric, window, alert threshold]
Data quality:     [checks, frequency]
Retraining:       [trigger strategy: scheduled / drift / performance]
```

---

## 6. Post-Launch [UPDATE]

### 6.1 Launch Results
```
A/B test result:   [metric lift +/- CI, p-value]
Business impact:   [$ or % impact on business metric]
Decision:          [ship / iterate / kill]
```

### 6.2 Lessons Learned
```
What worked:       [list]
What did not work: [list]
Surprises:         [unexpected findings]
Recommendations:   [for next iteration]
```

---

## Approvals

| Gate | Approver | Date | Status |
|------|----------|------|--------|
| Problem framing | [name] | [date] | [approved/pending] |
| Data readiness | [name] | [date] | [approved/pending] |
| Model quality | [name] | [date] | [approved/pending] |
| Production readiness | [name] | [date] | [approved/pending] |
| Launch decision | [name] | [date] | [approved/pending] |
