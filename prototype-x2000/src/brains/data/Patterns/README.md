# Data Brain — Patterns Index

## Overview

Patterns are proven, repeatable approaches to common data science and engineering
problems. They encode institutional knowledge gained from production experience.
Every pattern follows the same structure: context, problem, solution, implementation,
trade-offs, and references. Consult patterns before inventing new approaches.

---

## Available Patterns

### ML Pipeline Pattern
**File**: `ml_pipeline_pattern.md`
**Context**: Building a production ML pipeline from data ingestion to model serving.
**When to use**: Any supervised or unsupervised ML project moving beyond notebooks.
Covers the standard pipeline stages, artifact management, testing strategy,
and deployment integration.

### Analytics Dashboard Pattern
**File**: `analytics_dashboard_pattern.md`
**Context**: Designing and building a business analytics dashboard.
**When to use**: Any request for KPI dashboards, self-serve analytics, or
executive reporting. Covers requirements gathering, metric definition,
data modeling for BI, visualization design, and maintenance.

### Data Migration Pattern
**File**: `data_migration_pattern.md`
**Context**: Migrating data between systems, platforms, or schemas.
**When to use**: Warehouse migration, schema evolution, platform change,
or data consolidation. Covers planning, validation, cutover strategy,
rollback, and post-migration verification.

---

## How to Use Patterns

1. **Before starting work**: check if a pattern exists for your problem class
2. **During work**: follow the pattern's phases and checklists
3. **After work**: if the pattern was insufficient, update it or create a new one
4. **New patterns**: submit via PR with the standard structure

## Pattern Structure

Every pattern document must include:
- **Context**: when and why to use this pattern
- **Problem Statement**: what specific problem it solves
- **Solution Architecture**: the approach with diagrams
- **Implementation Steps**: phased, actionable steps
- **Trade-offs**: what you gain and what you sacrifice
- **Anti-patterns**: what to avoid
- **Checklist**: verification steps
- **References**: sources and further reading

---

## Pattern Lifecycle

| Stage | Description |
|-------|------------|
| Draft | Proposed, under review |
| Active | Approved, recommended for use |
| Deprecated | Superseded by newer pattern |
| Archived | No longer relevant |

All patterns in this directory are **Active** unless marked otherwise.
