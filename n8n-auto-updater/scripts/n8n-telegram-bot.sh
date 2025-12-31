#!/bin/bash
# ============================================================
# N8N TELEGRAM BOT
# Listens for commands: /update, /backup, /status, /health
# Runs via cron every minute
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OFFSET_FILE="/opt/n8n/logs/.telegram_offset"

# Telegram Configuration
TELEGRAM_BOT_TOKEN="7989414481:AAH_5lo48UCEvqHTtWss3rY9WsZ4UIgmem4"
TELEGRAM_CHAT_ID="8385023877"

send_message() {
    local message="$1"
    curl -sf -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${message}" \
        -d "parse_mode=Markdown" > /dev/null 2>&1
}

# Get last processed offset
OFFSET=0
if [ -f "$OFFSET_FILE" ]; then
    OFFSET=$(cat "$OFFSET_FILE")
fi

# Get updates from Telegram
UPDATES=$(curl -sf "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=$((OFFSET + 1))&timeout=1" 2>/dev/null)

if [ -z "$UPDATES" ]; then
    exit 0
fi

# Check if we have any updates
if ! echo "$UPDATES" | grep -q '"update_id"'; then
    exit 0
fi

# Process each update
echo "$UPDATES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for update in data.get('result', []):
    update_id = update.get('update_id', 0)
    message = update.get('message', {})
    text = message.get('text', '')
    chat_id = message.get('chat', {}).get('id', 0)
    print(f'{update_id}|{chat_id}|{text}')
" 2>/dev/null | while IFS='|' read -r update_id chat_id text; do

    # Only process messages from authorized chat
    if [ "$chat_id" != "$TELEGRAM_CHAT_ID" ]; then
        continue
    fi

    # Save offset
    echo "$update_id" > "$OFFSET_FILE"

    case "$text" in
        /update)
            send_message "🔄 *Starting n8n update...*"
            OUTPUT=$("${SCRIPT_DIR}/n8n-updater.sh" 2>&1)
            if echo "$OUTPUT" | grep -q "No update needed"; then
                send_message "✅ n8n is already up to date!"
            elif echo "$OUTPUT" | grep -q "updated successfully"; then
                send_message "✅ n8n updated successfully!"
            else
                send_message "⚠️ Update completed. Check logs for details."
            fi
            ;;
        /backup)
            send_message "💾 *Starting S3 backup...*"
            OUTPUT=$("${SCRIPT_DIR}/n8n-backup-to-s3.sh" 2>&1)
            if echo "$OUTPUT" | grep -q "Backup uploaded"; then
                send_message "✅ Backup completed successfully!"
            else
                send_message "❌ Backup failed. Check logs."
            fi
            ;;
        /status)
            CONTAINER_STATUS=$(docker ps --format "{{.Names}}: {{.Status}}" | grep n8n | head -2)
            ACTUAL_VERSION=$(docker exec n8n-production-n8n-1 n8n --version 2>/dev/null || echo "unknown")
            IMAGE_TAG=$(docker inspect n8n-production-n8n-1 --format '{{.Config.Image}}' 2>/dev/null | cut -d: -f2)
            if [ "$IMAGE_TAG" = "latest" ]; then
                VERSION_DISPLAY="$ACTUAL_VERSION (latest)"
            else
                VERSION_DISPLAY="$ACTUAL_VERSION"
            fi
            send_message "📊 n8n Status

$CONTAINER_STATUS
Version: $VERSION_DISPLAY"
            ;;
        /health)
            OUTPUT=$("${SCRIPT_DIR}/n8n-health-check.sh" 2>&1)
            if echo "$OUTPUT" | grep -q "PASSED"; then
                send_message "✅ *Health Check: PASSED*"
            else
                send_message "❌ *Health Check: FAILED*

\`\`\`
$(echo "$OUTPUT" | tail -10)
\`\`\`"
            fi
            ;;
        /help|/list|/commands)
            send_message "🤖 n8n Auto-Updater Bot

/status - Container status
/version - Check latest versions
/health - Health check
/update - Update n8n (backups first)
/backup - Backup to S3 now
/lastbackup - Last backup status
/backups - List all backups
/rollback - Restore latest backup
/list - Show commands

Auto: Sun 3AM update, 4AM backup"
            ;;
        /lastbackup)
            if [ -f /opt/n8n/logs/.last_backup_status ]; then
                STATUS=$(cat /opt/n8n/logs/.last_backup_status | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','?'))" 2>/dev/null)
                TIMESTAMP=$(cat /opt/n8n/logs/.last_backup_status | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('timestamp','?')[:19].replace('T',' '))" 2>/dev/null)
                NAME=$(cat /opt/n8n/logs/.last_backup_status | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','?'))" 2>/dev/null)
                SIZE=$(cat /opt/n8n/logs/.last_backup_status | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('size','?'))" 2>/dev/null)
                LOCATION=$(cat /opt/n8n/logs/.last_backup_status | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('location','?'))" 2>/dev/null)

                if [ "$STATUS" = "success" ]; then
                    EMOJI="✅"
                else
                    EMOJI="❌"
                fi

                # Get S3 backup count
                S3_COUNT=$(aws s3 ls s3://tradefly-deployments/n8n-backups/ 2>/dev/null | wc -l || echo "?")
                LOCAL_COUNT=$(ls /opt/n8n/backups/ 2>/dev/null | wc -l || echo "0")

                send_message "$EMOJI Last Backup

Status: $STATUS
Time: $TIMESTAMP
File: $NAME
Size: $SIZE

S3 Backups: $S3_COUNT
Local Backups: $LOCAL_COUNT"
            else
                send_message "❓ No backup history found. Run /backup first."
            fi
            ;;
        /version)
            send_message "🔍 Checking versions..."
            JSON=$("${SCRIPT_DIR}/n8n-version-check.sh" --json 2>/dev/null)
            CURRENT=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('current','?'))" 2>/dev/null)
            IMAGE_TAG=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('image_tag','?'))" 2>/dev/null)
            STABLE=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('latest_stable','?'))" 2>/dev/null)
            STABLE_DATE=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('latest_stable_date','?'))" 2>/dev/null)
            BETA=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('latest_beta','?'))" 2>/dev/null)
            BETA_DATE=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('latest_beta_date','?'))" 2>/dev/null)
            STATUS=$(echo "$JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','?'))" 2>/dev/null)

            if [ "$STATUS" = "up-to-date" ]; then
                STATUS_MSG="✅ Up to date!"
            else
                STATUS_MSG="🆕 Update available"
            fi

            if [ "$IMAGE_TAG" = "latest" ]; then
                CURRENT_DISPLAY="$CURRENT (latest)"
            else
                CURRENT_DISPLAY="$CURRENT"
            fi

            send_message "📦 n8n Versions

Running: $CURRENT_DISPLAY
Latest Stable: $STABLE ($STABLE_DATE)
Upcoming Beta: $BETA ($BETA_DATE)

$STATUS_MSG"
            ;;
        /backups)
            BACKUPS=$(ls -t /opt/n8n/backups/ 2>/dev/null | head -5)
            if [ -z "$BACKUPS" ]; then
                send_message "📂 No backups found"
            else
                send_message "📂 *Available Backups*

\`\`\`
$BACKUPS
\`\`\`

Use /rollback to restore the latest backup"
            fi
            ;;
        /rollback)
            LATEST_BACKUP=$(ls -t /opt/n8n/backups/ 2>/dev/null | head -1)
            if [ -z "$LATEST_BACKUP" ]; then
                send_message "❌ No backups available to rollback"
            else
                send_message "⏪ *Rolling back to:* \`$LATEST_BACKUP\`..."
                OUTPUT=$("${SCRIPT_DIR}/n8n-rollback.sh" "$LATEST_BACKUP" 2>&1)
                if echo "$OUTPUT" | grep -q "Rollback completed"; then
                    send_message "✅ Rollback completed! n8n restored to $LATEST_BACKUP"
                else
                    send_message "❌ Rollback failed:
\`\`\`
$(echo "$OUTPUT" | tail -10)
\`\`\`"
                fi
            fi
            ;;
    esac
done
