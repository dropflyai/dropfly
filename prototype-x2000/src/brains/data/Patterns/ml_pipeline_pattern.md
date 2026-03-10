# ML Pipeline Pattern — End-to-End Production ML

## Context

You need to build a machine learning pipeline that takes raw data, produces
a trained model, and serves predictions in production. The pipeline must be
reproducible, testable, monitorable, and maintainable. This pattern applies
to supervised learning (classification, regression), unsupervised learning
(clustering, anomaly detection), and recommendation systems.

---

## Problem Statement

ML projects that remain in notebooks fail in production. The gap between
experimentation and production is caused by:
- No version control for data, code, and models
- No automated testing for data quality and model quality
- No monitoring for drift or degradation
- Tight coupling between feature engineering, training, and serving
- Manual, non-reproducible processes

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ML PIPELINE                               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Data     │  │ Feature  │  │ Training │  │ Model    │   │
│  │ Ingestion │──│ Pipeline │──│ Pipeline │──│ Registry │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │              │              │              │         │
│       ▼              ▼              ▼              ▼         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Data    │  │ Feature  │  │ Experiment│  │ Serving  │   │
│  │  Tests   │  │  Store   │  │ Tracking  │  │ Infra    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                    │         │
│                                              ┌──────────┐   │
│                                              │Monitoring │   │
│                                              └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Data Foundation (Week 1-2)

**1.1 Define Data Sources**
```yaml
sources:
  - name: user_events
    type: streaming (Kafka)
    schema: avro
    freshness: real-time
  - name: user_attributes
    type: batch (PostgreSQL)
    schema: relational
    freshness: daily
  - name: transaction_history
    type: batch (warehouse)
    schema: star
    freshness: hourly
```

**1.2 Data Quality Gates**
```python
# Implement at ingestion point
quality_checks = [
    NullCheck(columns=["user_id", "event_type"], max_null_pct=0.001),
    VolumeCheck(min_rows=10000, max_rows=10000000),
    FreshnessCheck(max_delay_hours=2),
    SchemaCheck(expected_schema=SCHEMA_V2),
    UniqueCheck(columns=["event_id"]),
]
```

**1.3 Data Versioning**
```bash
# Track training datasets with DVC
dvc add data/training/features_v3.parquet
git add data/training/features_v3.parquet.dvc
git commit -m "data: add training features v3"
```

### Phase 2: Feature Engineering (Week 2-3)

**2.1 Feature Store Integration**
```python
# Define features
customer_features = FeatureView(
    name="customer_features",
    entities=["customer_id"],
    features=[
        Feature("purchase_count_30d", ValueType.INT64),
        Feature("avg_session_duration_7d", ValueType.DOUBLE),
        Feature("support_tickets_90d", ValueType.INT64),
        Feature("days_since_last_login", ValueType.INT64),
    ],
    online=True,
    batch_source=warehouse_source,
)
```

**2.2 Feature Documentation**
Each feature must have:
- Business definition (what it represents)
- Computation logic (SQL or Python)
- Expected range and distribution
- Known issues and caveats
- Owner and last review date

**2.3 Train-Serve Consistency**
- Use the same feature computation code for training and serving
- Point-in-time correctness for historical features
- Integration test: compare batch-computed vs online-computed features

### Phase 3: Training Pipeline (Week 3-4)

**3.1 Experiment Configuration**
```yaml
# config/experiment.yaml
experiment:
  name: churn_prediction_v3
  objective: binary_classification
  target: churned_30d
  metric: auc_roc
  minimum_performance: 0.85

data:
  train_start: "2023-01-01"
  train_end: "2024-01-01"
  validation_split: 0.15
  test_split: 0.15
  stratify_by: churned_30d

model:
  type: xgboost
  hyperparameters:
    n_estimators: [100, 300, 500, 1000]
    max_depth: [4, 6, 8]
    learning_rate: [0.01, 0.05, 0.1]
    min_child_weight: [1, 3, 5]
  tuning: bayesian
  tuning_trials: 50
```

**3.2 Training Script Structure**
```python
def train_pipeline(config):
    # 1. Load and validate data
    data = load_training_data(config.data)
    validate_data(data, config.data)

    # 2. Feature engineering
    features = compute_features(data, config.features)
    validate_features(features)

    # 3. Train-test split
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(
        features, config.data
    )

    # 4. Hyperparameter tuning
    best_params = tune_hyperparameters(
        X_train, y_train, X_val, y_val, config.model
    )

    # 5. Train final model
    model = train_model(X_train, y_train, best_params)

    # 6. Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    fairness_metrics = evaluate_fairness(model, X_test, y_test, sensitive_features)

    # 7. Log everything
    log_experiment(config, metrics, fairness_metrics, model)

    # 8. Quality gate
    if metrics["auc_roc"] < config.experiment.minimum_performance:
        raise QualityGateFailure(f"AUC {metrics['auc_roc']} below threshold")

    # 9. Register model
    register_model(model, config, metrics)
```

### Phase 4: Evaluation and Validation (Week 4-5)

**4.1 Metric Suite**
```python
metrics = {
    "primary": {
        "auc_roc": roc_auc_score(y_test, y_pred_proba),
        "auc_pr": average_precision_score(y_test, y_pred_proba),
    },
    "operational": {
        "precision_at_10pct": precision_at_threshold(y_test, y_pred_proba, 0.10),
        "recall_at_10pct": recall_at_threshold(y_test, y_pred_proba, 0.10),
    },
    "calibration": {
        "brier_score": brier_score_loss(y_test, y_pred_proba),
        "ece": expected_calibration_error(y_test, y_pred_proba),
    },
    "fairness": {
        "demographic_parity_diff": demographic_parity_difference,
        "equalized_odds_diff": equalized_odds_difference,
    },
}
```

**4.2 Model Validation Tests**
```python
def validate_model(model, X_test, y_test):
    # Performance tests
    assert auc_roc > 0.85, "AUC below threshold"
    assert precision_at_10pct > 0.40, "Precision below operational bar"

    # Stability tests
    assert cv_std < 0.02, "Cross-validation too unstable"

    # Fairness tests
    assert demographic_parity_gap < 0.05, "Fairness violation"

    # Calibration tests
    assert expected_calibration_error < 0.05, "Poor calibration"

    # Invariance tests
    assert prediction_invariant_to_name(model), "Name leakage detected"
```

### Phase 5: Deployment (Week 5-6)

**5.1 Serving Strategy Selection**
```
Decision tree:
  Latency requirement < 100ms? -> Real-time serving (API)
  Latency requirement < 1 hour? -> Near-real-time (streaming)
  Daily/weekly is sufficient?   -> Batch inference (scheduled job)
```

**5.2 Shadow Mode Deployment**
```
Week 1-2: Shadow mode
  - New model runs in parallel, predictions logged but not served
  - Compare new vs old model on live traffic
  - Monitor latency, error rate, prediction distribution

Week 3-4: Champion/Challenger
  - Route 10% traffic to new model
  - Statistical comparison on business metrics
  - Monitor for regressions

Week 5: Full rollout (if passing)
  - Promote to 100% traffic
  - Archive old model
```

### Phase 6: Monitoring (Ongoing)

**6.1 Monitoring Setup**
```yaml
monitoring:
  data_drift:
    method: psi
    features: all
    threshold: 0.25
    frequency: daily

  prediction_drift:
    method: ks_test
    threshold_p_value: 0.01
    frequency: daily

  performance:
    metric: auc_roc
    window: 7_days
    alert_threshold: 0.83

  data_quality:
    null_rate_threshold: 0.01
    volume_anomaly_zscore: 3.0

  alerts:
    channel: slack
    escalation: pagerduty (P0 only)
```

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Reproducibility | Setup complexity |
| Automated quality gates | Longer deployment cycle |
| Feature store consistency | Infrastructure cost |
| Comprehensive monitoring | Operational overhead |

---

## Anti-patterns

- Training in notebooks without version control
- Different feature code for training vs serving
- No validation between training and deployment
- Deploying without shadow mode or A/B testing
- No monitoring after deployment (deploy and forget)
- Manual model retraining without triggers

---

## Checklist

- [ ] Data sources documented with schema and freshness
- [ ] Data quality checks automated at ingestion
- [ ] Training data versioned (DVC or equivalent)
- [ ] Feature store operational for train-serve consistency
- [ ] Experiment tracking configured (MLflow or W&B)
- [ ] Hyperparameter tuning automated
- [ ] Model evaluation includes performance, fairness, and calibration
- [ ] Model registered in registry with metadata
- [ ] Deployment strategy selected (batch/real-time)
- [ ] Shadow mode validated before live traffic
- [ ] Monitoring configured for drift, performance, and quality
- [ ] Retraining triggers defined and automated
- [ ] Runbook documented for common failure modes
- [ ] Model card completed (see Templates/)

---

## References

- Sculley et al. (2015). Hidden Technical Debt in Machine Learning Systems.
- Google. Rules of ML: Best Practices for ML Engineering.
- Huyen (2022). Designing Machine Learning Systems.
- Breck et al. (2017). ML Test Score: A Rubric for ML Production Readiness.
