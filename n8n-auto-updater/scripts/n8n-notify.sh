#!/bin/bash
# ============================================================
# N8N NOTIFICATION HELPER
# Sends notifications via Telegram
# Usage: ./n8n-notify.sh <status> <message>
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh"

STATUS="${1:-unknown}"
MESSAGE="${2:-No message provided}"
HOSTNAME=$(hostname)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Telegram Configuration
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-7989414481:AAH_5lo48UCEvqHTtWss3rY9WsZ4UIgmem4}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-8385023877}"

# Format based on status
if [ "$STATUS" = "success" ]; then
    EMOJI="✅"
else
    EMOJI="❌"
fi

# Build message
TELEGRAM_MESSAGE="$EMOJI *n8n $STATUS*

$MESSAGE

🖥 Host: \`$HOSTNAME\`
🕐 $TIMESTAMP"

# Send Telegram notification
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    RESPONSE=$(curl -sf -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${TELEGRAM_MESSAGE}" \
        -d "parse_mode=Markdown" 2>&1)

    if echo "$RESPONSE" | grep -q '"ok":true'; then
        echo "[NOTIFY] Telegram notification sent"
    else
        echo "[NOTIFY] Failed to send Telegram notification: $RESPONSE"
    fi
else
    echo "[NOTIFY] Telegram not configured, skipping notification"
fi

# Also send to Discord if configured
if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    if [ "$STATUS" = "success" ]; then
        COLOR="65280"
    else
        COLOR="16711680"
    fi

    curl -sf -H "Content-Type: application/json" \
        -d "{
            \"embeds\": [{
                \"title\": \"n8n $STATUS\",
                \"description\": \"$MESSAGE\",
                \"color\": $COLOR,
                \"footer\": {\"text\": \"$HOSTNAME - $TIMESTAMP\"}
            }]
        }" \
        "$DISCORD_WEBHOOK_URL" && echo "[NOTIFY] Discord notification sent" || echo "[NOTIFY] Discord failed"
fi
