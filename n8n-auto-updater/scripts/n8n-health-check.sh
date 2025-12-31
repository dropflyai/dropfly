#!/bin/bash
# ============================================================
# N8N HEALTH CHECK
# Standalone health verification script
# Usage: ./n8n-health-check.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh"

echo "n8n Health Check"
echo "================"
echo ""

EXIT_CODE=0

# Check container status
echo "[1] Container Status:"
if docker ps --format "{{.Names}} - {{.Status}}" | grep -q "$N8N_CONTAINER_NAME"; then
    docker ps --format "{{.Names}} - {{.Status}}" | grep "$N8N_CONTAINER_NAME"
    echo "   OK - Container running"
else
    echo "   FAIL - Container not running"
    EXIT_CODE=1
fi

# Check health endpoint
echo ""
echo "[2] Health Endpoint ($HEALTH_CHECK_URL):"
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   OK - HTTP $HTTP_CODE"
else
    echo "   FAIL - HTTP $HTTP_CODE"
    EXIT_CODE=1
fi

# Check logs for errors
echo ""
echo "[3] Recent Errors (last 50 lines):"
ERROR_COUNT=$(docker logs "$N8N_CONTAINER_NAME" 2>&1 | tail -50 | grep -ci "error" || echo "0")
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "   WARN - Found $ERROR_COUNT error mentions in recent logs"
else
    echo "   OK - No errors in recent logs"
fi

# Check disk space
echo ""
echo "[4] Disk Space:"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "   WARN - Disk usage at ${DISK_USAGE}%"
else
    echo "   OK - Disk usage at ${DISK_USAGE}%"
fi

# Check memory
echo ""
echo "[5] Container Memory:"
MEMORY=$(docker stats "$N8N_CONTAINER_NAME" --no-stream --format "{{.MemUsage}}" 2>/dev/null || echo "N/A")
echo "   $MEMORY"

echo ""
echo "================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "Health check: PASSED"
else
    echo "Health check: FAILED"
fi

exit $EXIT_CODE
