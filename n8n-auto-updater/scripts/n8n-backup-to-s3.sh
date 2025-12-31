#!/bin/bash
set -euo pipefail

# ============================================================
# N8N BACKUP TO S3
# Purpose: Backup n8n workflows and data to S3 weekly
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh"

# Load AWS credentials
if [ -f "${SCRIPT_DIR}/../config/aws-credentials.sh" ]; then
    source "${SCRIPT_DIR}/../config/aws-credentials.sh"
fi

# S3 Configuration
S3_BUCKET="${S3_BACKUP_BUCKET:-dropfly-shared-1992041042}"
S3_PREFIX="n8n-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="n8n-backup-${TIMESTAMP}"
LOCAL_BACKUP="/tmp/${BACKUP_NAME}"

log_info()  { echo "[INFO]  $(date '+%Y-%m-%d %H:%M:%S') $*"; }
log_error() { echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*"; }
log_success() { echo "[OK]    $(date '+%Y-%m-%d %H:%M:%S') $*"; }

notify() {
    local status="$1"
    local message="$2"
    "${SCRIPT_DIR}/n8n-notify.sh" "$status" "$message" 2>/dev/null || true
}

cleanup() {
    rm -rf "$LOCAL_BACKUP" "${LOCAL_BACKUP}.tar.gz" 2>/dev/null || true
}
trap cleanup EXIT

main() {
    log_info "=========================================="
    log_info "n8n S3 Backup Started"
    log_info "=========================================="

    mkdir -p "$LOCAL_BACKUP"

    # Step 1: Export n8n workflows via API (if available)
    log_info "Exporting n8n workflows..."
    if curl -sf "http://localhost:5678/api/v1/workflows" -o "${LOCAL_BACKUP}/workflows.json" 2>/dev/null; then
        log_success "Workflows exported via API"
    else
        log_info "API export not available, backing up volume directly"
    fi

    # Step 2: Backup n8n data volume
    log_info "Backing up n8n data volume..."
    docker run --rm \
        -v "${N8N_DATA_VOLUME}:/source:ro" \
        -v "$(dirname $LOCAL_BACKUP):/backup" \
        alpine tar -czf "/backup/${BACKUP_NAME}/n8n-data.tar.gz" -C /source . 2>/dev/null || {
            # Fallback: copy from container
            docker cp "${N8N_CONTAINER_NAME}:/home/node/.n8n" "${LOCAL_BACKUP}/n8n-data" 2>/dev/null || true
        }

    # Step 3: Backup docker-compose and config
    log_info "Backing up configuration..."
    cp "${N8N_COMPOSE_DIR}/docker-compose.yml" "${LOCAL_BACKUP}/" 2>/dev/null || true
    cp "${N8N_COMPOSE_DIR}/.env" "${LOCAL_BACKUP}/" 2>/dev/null || true
    cp -r "${N8N_COMPOSE_DIR}/config" "${LOCAL_BACKUP}/" 2>/dev/null || true

    # Step 4: Create manifest
    cat > "${LOCAL_BACKUP}/MANIFEST.md" << EOF
# n8n S3 Backup Manifest

- **Backup Date**: $(date)
- **Timestamp**: ${TIMESTAMP}
- **Container**: ${N8N_CONTAINER_NAME}
- **S3 Location**: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.tar.gz

## Contents
- workflows.json (if API available)
- n8n-data.tar.gz (volume backup)
- docker-compose.yml
- .env
- config/
EOF

    # Step 5: Create tarball
    log_info "Creating backup archive..."
    cd "$(dirname $LOCAL_BACKUP)"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"

    # Step 6: Upload to S3
    log_info "Uploading to S3..."
    BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    if aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.tar.gz"; then
        log_success "Backup uploaded to s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.tar.gz"

        # Save backup status
        cat > /opt/n8n/logs/.last_backup_status << EOF
{
    "type": "s3",
    "status": "success",
    "timestamp": "$(date -Iseconds)",
    "name": "${BACKUP_NAME}",
    "size": "${BACKUP_SIZE}",
    "location": "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.tar.gz"
}
EOF
        notify "success" "💾 S3 Backup Complete
Size: ${BACKUP_SIZE}
File: ${BACKUP_NAME}.tar.gz"
    else
        log_error "Failed to upload to S3"
        cat > /opt/n8n/logs/.last_backup_status << EOF
{
    "type": "s3",
    "status": "failed",
    "timestamp": "$(date -Iseconds)",
    "error": "Upload failed"
}
EOF
        notify "failure" "❌ S3 Backup Failed"
        exit 1
    fi

    # Step 7: Cleanup old S3 backups (keep last 10)
    log_info "Cleaning up old S3 backups..."
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | sort -r | tail -n +11 | while read -r line; do
        filename=$(echo "$line" | awk '{print $4}')
        if [ -n "$filename" ]; then
            log_info "Removing old backup: $filename"
            aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${filename}" || true
        fi
    done

    log_info "=========================================="
    log_info "n8n S3 Backup Completed"
    log_info "=========================================="
}

main "$@"
