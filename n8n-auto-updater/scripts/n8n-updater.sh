#!/bin/bash
set -euo pipefail

# ============================================================
# N8N AUTO-UPDATER
# Purpose: Safely update n8n Docker container with backup and rollback
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh"

# Timestamp for this run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${N8N_COMPOSE_DIR}/logs/update-${TIMESTAMP}.log"
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"

# Logging functions
log_info()    { echo "[INFO]  $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"; }
log_warn()    { echo "[WARN]  $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"; }
log_error()   { echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"; }
log_success() { echo "[OK]    $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"; }

# ============================================================
# STEP 1: Check for new version
# ============================================================
check_for_update() {
    log_info "Checking for n8n updates..."

    # Get current image digest
    CURRENT_DIGEST=$(docker inspect --format='{{.Image}}' "$N8N_CONTAINER_NAME" 2>/dev/null || echo "none")

    # Pull latest image (but don't restart yet)
    docker pull n8nio/n8n:latest 2>&1 | tee -a "$LOG_FILE"

    # Get new image digest
    NEW_DIGEST=$(docker images --digests n8nio/n8n:latest --format '{{.Digest}}')

    if [ "$CURRENT_DIGEST" == "$NEW_DIGEST" ]; then
        log_info "n8n is already up to date"
        return 1  # No update needed
    fi

    log_info "New version available"
    log_info "Current: $CURRENT_DIGEST"
    log_info "New: $NEW_DIGEST"
    return 0  # Update available
}

# ============================================================
# STEP 2: Backup before update
# ============================================================
perform_backup() {
    log_info "Creating backup at: $BACKUP_PATH"
    mkdir -p "$BACKUP_PATH"

    # Backup docker-compose.yml
    cp "${N8N_COMPOSE_DIR}/docker-compose.yml" "${BACKUP_PATH}/docker-compose.yml.bak"

    # Backup .env if exists
    if [ -f "${N8N_COMPOSE_DIR}/.env" ]; then
        cp "${N8N_COMPOSE_DIR}/.env" "${BACKUP_PATH}/.env.bak"
    fi

    # Tag current image for rollback
    CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "$N8N_CONTAINER_NAME")
    docker tag "$CURRENT_IMAGE" "n8n-backup:${TIMESTAMP}" 2>/dev/null || true

    # Save current image info
    echo "$CURRENT_IMAGE" > "${BACKUP_PATH}/previous-image.txt"

    # Backup n8n data volume
    log_info "Backing up n8n data volume..."
    docker run --rm \
        -v "${N8N_DATA_VOLUME}:/source:ro" \
        -v "${BACKUP_PATH}:/backup" \
        alpine tar -czf /backup/n8n-data.tar.gz -C /source .

    # Create manifest
    cat > "${BACKUP_PATH}/MANIFEST.md" << EOF
# n8n Backup Manifest

- **Backup Date**: $(date)
- **Timestamp**: ${TIMESTAMP}
- **Previous Image**: ${CURRENT_IMAGE}
- **Container**: ${N8N_CONTAINER_NAME}

## Contents
- docker-compose.yml.bak
- .env.bak (if exists)
- n8n-data.tar.gz (volume backup)
- previous-image.txt

## Rollback Command
\`\`\`bash
${SCRIPT_DIR}/n8n-rollback.sh ${TIMESTAMP}
\`\`\`
EOF

    log_success "Backup completed: $BACKUP_PATH"
}

# ============================================================
# STEP 3: Perform update
# ============================================================
perform_update() {
    log_info "Stopping n8n container..."
    cd "$N8N_COMPOSE_DIR"
    docker compose down

    log_info "Starting n8n with new image..."
    docker compose up -d

    log_info "Waiting for n8n to start..."
    sleep 15
}

# ============================================================
# STEP 4: Health check
# ============================================================
health_check() {
    log_info "Running health checks..."

    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        log_info "Health check attempt $i of $HEALTH_CHECK_RETRIES..."

        if curl -sf --max-time 10 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi

        sleep 10
    done

    log_error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
    return 1
}

# ============================================================
# STEP 5: Rollback on failure
# ============================================================
rollback() {
    log_warn "Initiating rollback to backup: $1"
    "${SCRIPT_DIR}/n8n-rollback.sh" "$1"
}

# ============================================================
# STEP 6: Send notification
# ============================================================
notify() {
    local status="$1"
    local message="$2"

    "${SCRIPT_DIR}/n8n-notify.sh" "$status" "$message"
}

# ============================================================
# STEP 7: Cleanup old backups
# ============================================================
cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last $MAX_BACKUPS)..."

    # Keep only the last N backups
    ls -dt "${BACKUP_DIR}"/*/ 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | while read -r dir; do
        log_info "Removing old backup: $dir"
        rm -rf "$dir"
    done

    # Also remove old tagged images
    docker images --filter "reference=n8n-backup:*" --format "{{.Tag}}" | \
        sort -r | tail -n +$((MAX_BACKUPS + 1)) | \
        while read -r tag; do
            log_info "Removing old image tag: n8n-backup:$tag"
            docker rmi "n8n-backup:$tag" 2>/dev/null || true
        done
}

# ============================================================
# MAIN EXECUTION
# ============================================================
main() {
    log_info "=========================================="
    log_info "n8n Auto-Updater Started"
    log_info "=========================================="

    mkdir -p "${N8N_COMPOSE_DIR}/logs"

    # Check for updates
    if ! check_for_update; then
        log_info "No update needed. Exiting."
        exit 0
    fi

    # Perform backup
    perform_backup

    # Perform update
    perform_update

    # Health check
    if health_check; then
        log_success "n8n updated successfully"
        NEW_VERSION=$(docker inspect --format='{{.Config.Image}}' "$N8N_CONTAINER_NAME")
        notify "success" "n8n updated successfully to $NEW_VERSION"
        cleanup_old_backups
    else
        log_error "Update failed - health check did not pass"

        if [ "$AUTO_ROLLBACK_ON_FAILURE" = true ]; then
            rollback "$TIMESTAMP"
            notify "failure" "n8n update failed - rolled back to previous version"
        else
            notify "failure" "n8n update failed - manual intervention required"
        fi

        exit 1
    fi

    log_info "=========================================="
    log_info "n8n Auto-Updater Completed"
    log_info "=========================================="
}

# Run main function
main "$@"
