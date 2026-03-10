# AI Project Brief Template

## Instructions

Complete this template before starting any AI project. This brief ensures alignment between stakeholders, defines success criteria, and identifies risks before development begins. Every section should be filled out even if the answer is "Not applicable -- [reason]."

---

## 1. Project Overview

### Project Name
<!-- Clear, descriptive name -->

### Project Owner
<!-- Name, title, contact -->

### Date
<!-- Brief creation date -->

### Version
<!-- Brief version number (increment on major changes) -->

### Executive Summary
<!-- 2-3 sentence description of what this project will accomplish and why it matters. Write this for a non-technical stakeholder. -->

---

## 2. Problem Definition

### Problem Statement
<!-- What specific problem are we solving? Be precise. -->

### Current State
<!-- How is this problem handled today? What are the pain points? -->

### Who Is Affected
<!-- Which users, customers, or internal teams experience this problem? How many? -->

### Impact of Not Solving
<!-- What happens if we do not build this? Quantify where possible. -->

### Why AI
<!-- Why is AI the right approach for this problem? What alternatives were considered and why were they insufficient? -->

---

## 3. Proposed Solution

### Solution Description
<!-- What will the AI system do? Describe the input, processing, and output. -->

### AI Approach
<!-- Which AI approach will be used? (RAG, agent, classification, generation, fine-tuning, etc.) Justify the choice. -->

| Approach | Considered | Selected | Reasoning |
|----------|-----------|----------|-----------|
|          |           |          |           |
|          |           |          |           |

### Model Selection
<!-- Which model(s) will be used? Justify the selection. -->

| Model | Role | Reasoning |
|-------|------|-----------|
|       |      |           |

### Data Requirements
<!-- What data does this system need? Where does it come from? -->

| Data Source | Type | Volume | Availability | Quality Assessment |
|------------|------|--------|-------------|-------------------|
|            |      |        |             |                   |

### Integration Points
<!-- How does this integrate with existing systems? -->

| System | Integration Type | Data Flow | Owner |
|--------|-----------------|-----------|-------|
|        |                 |           |       |

---

## 4. Success Criteria

### Primary Success Metric
<!-- The single most important metric. What value makes this project a success? -->

| Metric | Current Baseline | Target | Measurement Method |
|--------|-----------------|--------|-------------------|
|        |                 |        |                   |

### Secondary Metrics
<!-- Additional metrics that support the primary metric -->

| Metric | Baseline | Target | Priority |
|--------|----------|--------|----------|
|        |          |        |          |
|        |          |        |          |
|        |          |        |          |

### Quality Requirements

| Dimension | Requirement | Measurement |
|-----------|-------------|-------------|
| Accuracy  |             |             |
| Latency   |             |             |
| Availability |          |             |
| Cost per interaction |  |             |

### Non-Functional Requirements
<!-- Security, compliance, scalability, accessibility -->

| Requirement | Specification | Priority |
|-------------|--------------|----------|
|             |              |          |

---

## 5. User Experience

### User Personas
<!-- Who will use this system? -->

| Persona | Description | Primary Need | Technical Sophistication |
|---------|-------------|-------------|------------------------|
|         |             |             |                        |

### User Journey
<!-- Walk through the end-to-end user experience -->

1. User does...
2. System responds with...
3. User then...
4. ...

### AI Interaction Model
<!-- How does the user interact with the AI? -->

| Interaction Pattern | Description |
|--------------------|-------------|
| Level of Autonomy  | (Assist / Recommend / Draft / Act) |
| Confidence Display | (Hidden / Categorical / Numeric) |
| Correction Mechanism | (Edit / Regenerate / Feedback) |
| Fallback Experience | (Manual workflow / Simplified AI / Error message) |

---

## 6. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Model hallucination |  |  |  |
| Latency exceeds requirements |  |  |  |
| Cost exceeds budget |  |  |  |
| Data quality insufficient |  |  |  |
| Model provider outage |  |  |  |

### Ethical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Bias against specific groups |  |  |  |
| Privacy violation |  |  |  |
| Harmful content generation |  |  |  |
| Automation of sensitive decisions |  |  |  |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low user adoption |  |  |  |
| Competitive response |  |  |  |
| Regulatory change |  |  |  |
| Vendor dependency |  |  |  |

---

## 7. Resource Requirements

### Team

| Role | Responsibility | Allocation | Duration |
|------|---------------|------------|----------|
|      |               |            |          |

### Budget

| Category | Estimated Cost | Notes |
|----------|---------------|-------|
| Development (engineering hours) |  |  |
| AI inference (monthly) |  |  |
| Data preparation |  |  |
| Infrastructure |  |  |
| Evaluation and testing |  |  |
| **Total** |  |  |

### Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Research & Design |  |  |
| Prototype |  |  |
| Evaluation |  |  |
| Production Build |  |  |
| Testing & QA |  |  |
| Staged Rollout |  |  |
| Full Deployment |  |  |

---

## 8. Evaluation Plan

### Evaluation Dataset
<!-- How will you create the evaluation dataset? -->

| Attribute | Specification |
|-----------|--------------|
| Size | (e.g., 100 query-answer pairs) |
| Source | (e.g., expert-created, production logs) |
| Coverage | (e.g., all task categories, edge cases) |
| Annotation | (e.g., expert-verified ground truth) |

### Evaluation Methods

| Method | What It Measures | When |
|--------|-----------------|------|
| Automated metrics |  | Every build |
| LLM-as-judge |  | Weekly |
| Human evaluation |  | Pre-launch, quarterly |
| A/B testing |  | Post-launch |

### Go/No-Go Criteria
<!-- What must be true for this project to launch? -->

- [ ] Primary success metric meets target
- [ ] Quality requirements met on evaluation dataset
- [ ] Safety review completed with no critical findings
- [ ] Bias assessment shows no significant disparities
- [ ] Cost per interaction within budget
- [ ] Fallback path tested and operational
- [ ] Monitoring and alerting configured

---

## 9. Governance

### Risk Classification
<!-- Per organizational AI governance policy -->

| Classification Level | Justification |
|---------------------|---------------|
| (Low / Medium / High / Critical) |  |

### Required Approvals

| Approver | Role | Status |
|----------|------|--------|
|          |      | Pending |

### Compliance Requirements

| Requirement | Applicable | Status |
|-------------|-----------|--------|
| Data privacy (GDPR/CCPA) |  |  |
| AI disclosure to users |  |  |
| Bias testing |  |  |
| Model card |  |  |
| Impact assessment |  |  |

---

## 10. Post-Launch Plan

### Monitoring

| Metric | Alert Threshold | Response |
|--------|----------------|----------|
| Quality score |  |  |
| Error rate |  |  |
| Cost per day |  |  |
| Latency P95 |  |  |

### Iteration Plan
<!-- How will the system be improved after launch? -->

| Phase | Timeline | Focus |
|-------|----------|-------|
| Post-launch stabilization |  |  |
| Quality optimization |  |  |
| Cost optimization |  |  |
| Feature expansion |  |  |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner |  |  |  |
| Engineering Lead |  |  |  |
| Product Lead |  |  |  |
| AI Governance |  |  |  |

---

*Template version: 1.0 | AI Brain | Last updated: [date]*
