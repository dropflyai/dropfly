#!/usr/bin/env bash
# DropFly Agent — Health Check
#
# Checks the status of all system components.
# Run locally or on the EC2 instance.
#
# Usage:
#   ./infrastructure/scripts/health-check.sh                    # Check localhost
#   ./infrastructure/scripts/health-check.sh http://1.2.3.4:8420  # Check remote
#   ./infrastructure/scripts/health-check.sh --full             # Full diagnostics

set -euo pipefail

BASE_URL="${1:-http://localhost:8420}"
FULL_CHECK=false

if [ "$BASE_URL" = "--full" ]; then
    BASE_URL="http://localhost:8420"
    FULL_CHECK=true
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }

ERRORS=0

echo "=== DropFly Agent Health Check ==="
echo "Target: $BASE_URL"
echo ""

# -------------------------------------------------------------------
# 1. API Gateway
# -------------------------------------------------------------------

echo "API Gateway:"
RESPONSE=$(curl -sf -w "\n%{http_code}" "$BASE_URL/status" 2>/dev/null || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    pass "Gateway responding (HTTP $HTTP_CODE)"

    # Parse JSON response
    if command -v jq &> /dev/null; then
        VERSION=$(echo "$BODY" | jq -r '.version // "unknown"')
        UPTIME=$(echo "$BODY" | jq -r '.uptime_seconds // 0' | xargs printf "%.0f")
        ACTIVE=$(echo "$BODY" | jq -r '.active_sessions // 0')
        pass "Version: $VERSION"
        pass "Uptime: ${UPTIME}s"
        pass "Active sessions: $ACTIVE"
    fi
else
    fail "Gateway not responding (HTTP $HTTP_CODE)"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# -------------------------------------------------------------------
# 2. Docker
# -------------------------------------------------------------------

if [ "$FULL_CHECK" = true ]; then
    echo "Docker:"
    if command -v docker &> /dev/null; then
        pass "Docker installed: $(docker --version | cut -d' ' -f3)"

        if docker ps &> /dev/null; then
            pass "Docker daemon running"

            # Check agent container
            if docker ps --filter "name=dropfly-agent" --format "{{.Status}}" | grep -q "Up"; then
                STATUS=$(docker ps --filter "name=dropfly-agent" --format "{{.Status}}")
                pass "Agent container: $STATUS"
            else
                fail "Agent container not running"
                ERRORS=$((ERRORS + 1))
            fi

            # Check Redis
            if docker ps --filter "name=dropfly-redis" --format "{{.Status}}" | grep -q "Up"; then
                pass "Redis container running"
            else
                warn "Redis container not running (optional)"
            fi
        else
            fail "Docker daemon not accessible"
            ERRORS=$((ERRORS + 1))
        fi
    else
        warn "Docker not installed (running without containers)"
    fi

    echo ""

    # -------------------------------------------------------------------
    # 3. Disk & Memory
    # -------------------------------------------------------------------

    echo "System Resources:"
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    DISK_PCT=$(echo "$DISK_USAGE" | tr -d '%')
    if [ "$DISK_PCT" -lt 80 ]; then
        pass "Disk usage: $DISK_USAGE"
    elif [ "$DISK_PCT" -lt 90 ]; then
        warn "Disk usage: $DISK_USAGE (getting full)"
    else
        fail "Disk usage: $DISK_USAGE (critical)"
        ERRORS=$((ERRORS + 1))
    fi

    MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
    MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
    MEM_PCT=$((MEM_USED * 100 / MEM_TOTAL))
    if [ "$MEM_PCT" -lt 80 ]; then
        pass "Memory: ${MEM_USED}MB / ${MEM_TOTAL}MB (${MEM_PCT}%)"
    elif [ "$MEM_PCT" -lt 90 ]; then
        warn "Memory: ${MEM_USED}MB / ${MEM_TOTAL}MB (${MEM_PCT}%)"
    else
        fail "Memory: ${MEM_USED}MB / ${MEM_TOTAL}MB (${MEM_PCT}%)"
        ERRORS=$((ERRORS + 1))
    fi

    echo ""

    # -------------------------------------------------------------------
    # 4. Tailscale
    # -------------------------------------------------------------------

    echo "Tailscale:"
    if command -v tailscale &> /dev/null; then
        TS_STATUS=$(tailscale status --json 2>/dev/null | jq -r '.Self.Online // false' 2>/dev/null || echo "false")
        if [ "$TS_STATUS" = "true" ]; then
            TS_IP=$(tailscale ip -4 2>/dev/null || echo "unknown")
            pass "Connected (IP: $TS_IP)"
        else
            warn "Installed but not connected"
        fi
    else
        warn "Not installed"
    fi

    echo ""
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------

echo "---"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}All checks passed.${NC}"
    exit 0
else
    echo -e "${RED}$ERRORS check(s) failed.${NC}"
    exit 1
fi
