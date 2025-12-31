#!/bin/bash
set -euo pipefail

# ============================================================
# N8N ROLLBACK SCRIPT
# Purpose: Restore n8n to a previous backup state
# Usage: ./n8n-rollback.sh <backup-timestamp>
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh"

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <backup-timestamp>"
    echo ""
    echo "Available backups:"
    ls -la "${BACKUP_DIR}/" 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_TIMESTAMP="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_TIMESTAMP}"

if [ ! -d "$BACKUP_PATH" ]; then
    echo "ERROR: Backup not found: $BACKUP_PATH"
    exit 1
fi

echo "=========================================="
echo "n8n Rollback to: $BACKUP_TIMESTAMP"
echo "=========================================="

# Stop current container
echo "[1/4] Stopping n8n..."
cd "$N8N_COMPOSE_DIR"
docker compose down

# Restore docker-compose.yml
echo "[2/4] Restoring configuration..."
if [ -f "${BACKUP_PATH}/docker-compose.yml.bak" ]; then
    cp "${BACKUP_PATH}/docker-compose.yml.bak" "${N8N_COMPOSE_DIR}/docker-compose.yml"
fi
if [ -f "${BACKUP_PATH}/.env.bak" ]; then
    cp "${BACKUP_PATH}/.env.bak" "${N8N_COMPOSE_DIR}/.env"
fi

# Restore data volume
echo "[3/4] Restoring data volume..."
# Clear existing volume data
docker run --rm -v "${N8N_DATA_VOLUME}:/target" alpine sh -c "rm -rf /target/*"
# Restore from backup
docker run --rm \
    -v "${N8N_DATA_VOLUME}:/target" \
    -v "${BACKUP_PATH}:/backup:ro" \
    alpine tar -xzf /backup/n8n-data.tar.gz -C /target

# Start with restored state
echo "[4/4] Starting n8n..."

# Use backed up image if available
if docker images "n8n-backup:${BACKUP_TIMESTAMP}" --format "{{.Repository}}" | grep -q "n8n-backup"; then
    echo "Using backed up image: n8n-backup:${BACKUP_TIMESTAMP}"
    PREVIOUS_IMAGE=$(cat "${BACKUP_PATH}/previous-image.txt" 2>/dev/null || echo "n8n-backup:${BACKUP_TIMESTAMP}")

    # Create temporary compose override
    cat > "${N8N_COMPOSE_DIR}/docker-compose.override.yml" << EOF
version: '3.8'
services:
  n8n:
    image: n8n-backup:${BACKUP_TIMESTAMP}
EOF
fi

docker compose up -d

# Clean up override after start
rm -f "${N8N_COMPOSE_DIR}/docker-compose.override.yml"

echo ""
echo "=========================================="
echo "Rollback completed!"
echo "=========================================="
echo ""
echo "Verify n8n is running:"
echo "  docker ps | grep n8n"
echo "  curl -s ${HEALTH_CHECK_URL}"
