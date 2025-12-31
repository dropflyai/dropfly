#!/bin/bash
# ============================================================
# n8n Updater Configuration
# Edit these values to match your setup
# ============================================================

# Container settings
N8N_CONTAINER_NAME="n8n"
N8N_COMPOSE_DIR="/opt/n8n"
N8N_DATA_VOLUME="n8n_data"

# Backup settings
BACKUP_DIR="/opt/n8n/backups"
BACKUP_RETENTION_DAYS=30
MAX_BACKUPS=10
S3_BACKUP_BUCKET="tradefly-deployments"

# Health check settings
HEALTH_CHECK_URL="http://localhost:5678/healthz"
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_RETRIES=5

# Notifications - Discord
DISCORD_WEBHOOK_URL=""  # Add your Discord webhook URL here

# Update settings
AUTO_ROLLBACK_ON_FAILURE=true
