# Automation Brain Patterns

## Overview

This directory contains reusable architectural patterns for common automation scenarios. Each pattern provides a complete blueprint including trigger design, workflow architecture, error handling, monitoring, and production considerations. Use these patterns as starting points and adapt them to your specific requirements.

---

## Available Patterns

### 1. CRM Sync Pattern (`crm_sync_pattern.md`)
Bidirectional synchronization between CRM systems. Covers conflict resolution, field mapping, deduplication, and incremental sync with full reconciliation.

### 2. Approval Workflow Pattern (`approval_workflow_pattern.md`)
Multi-step approval processes with escalation, delegation, and audit trails. Covers request submission, routing logic, approval/rejection handling, and notifications.

### 3. Data Pipeline Pattern (`data_pipeline_pattern.md`)
ETL/ELT data pipeline for moving and transforming data between systems. Covers extraction, transformation, loading, scheduling, monitoring, and error recovery.

---

## How to Use Patterns

1. Identify the pattern that matches your use case
2. Review all sections, noting platform-specific considerations
3. Adapt the pattern to your automation platform (n8n, Zapier, Make, or custom)
4. Implement error handling and monitoring as specified
5. Test thoroughly before production deployment
6. Document your implementation referencing the source pattern
