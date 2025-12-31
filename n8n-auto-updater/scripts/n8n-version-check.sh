#!/bin/bash
# ============================================================
# N8N VERSION CHECKER
# Checks current version and latest stable/beta from n8n releases
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config/updater-config.sh" 2>/dev/null || true

N8N_CONTAINER_NAME="${N8N_CONTAINER_NAME:-n8n-production-n8n-1}"

# Get actual running version from container
get_current_version() {
    # Try n8n --version first (most reliable)
    VERSION=$(docker exec "$N8N_CONTAINER_NAME" n8n --version 2>/dev/null)
    if [ -n "$VERSION" ] && [ "$VERSION" != "null" ]; then
        echo "$VERSION"
        return
    fi

    # Fallback to image tag
    docker inspect "$N8N_CONTAINER_NAME" --format '{{.Config.Image}}' 2>/dev/null | cut -d: -f2
}

# Get image tag (latest or pinned)
get_image_tag() {
    docker inspect "$N8N_CONTAINER_NAME" --format '{{.Config.Image}}' 2>/dev/null | cut -d: -f2
}

# Get latest versions from GitHub API
get_latest_versions() {
    curl -sf "https://api.github.com/repos/n8n-io/n8n/releases?per_page=20" | \
        python3 -c "
import sys, json
releases = json.load(sys.stdin)

stable = None
beta = None

for r in releases:
    tag = r.get('tag_name', '').replace('n8n@', '')
    date = r.get('published_at', '')[:10]
    is_pre = r.get('prerelease', False)

    if not stable and not is_pre:
        stable = (tag, date)
    if not beta and is_pre:
        beta = (tag, date)

    if stable and beta:
        break

if stable:
    print(f'STABLE|{stable[0]}|{stable[1]}')
if beta:
    print(f'BETA|{beta[0]}|{beta[1]}')
" 2>/dev/null
}

# Main output
main() {
    echo "========================================"
    echo "n8n Version Check"
    echo "========================================"
    echo ""

    # Current version
    CURRENT=$(get_current_version)
    IMAGE_TAG=$(get_image_tag)

    if [ "$IMAGE_TAG" = "latest" ]; then
        echo "Current: $CURRENT (using :latest tag)"
    else
        echo "Current: $CURRENT"
    fi
    echo ""

    # Get latest versions
    VERSIONS=$(get_latest_versions)

    STABLE_LINE=$(echo "$VERSIONS" | grep "^STABLE" | head -1)
    BETA_LINE=$(echo "$VERSIONS" | grep "^BETA" | head -1)

    STABLE_VER=$(echo "$STABLE_LINE" | cut -d'|' -f2)
    STABLE_DATE=$(echo "$STABLE_LINE" | cut -d'|' -f3)
    BETA_VER=$(echo "$BETA_LINE" | cut -d'|' -f2)
    BETA_DATE=$(echo "$BETA_LINE" | cut -d'|' -f3)

    echo "Latest Stable: $STABLE_VER ($STABLE_DATE)"
    echo "Upcoming Beta: $BETA_VER ($BETA_DATE)"
    echo ""

    # Status
    if [ "$CURRENT" = "$STABLE_VER" ]; then
        echo "✅ Status: UP TO DATE"
    elif [ -n "$STABLE_VER" ]; then
        echo "🆕 Status: UPDATE AVAILABLE ($CURRENT -> $STABLE_VER)"
    fi

    echo ""
    echo "========================================"
}

# JSON output for Telegram bot
json_output() {
    CURRENT=$(get_current_version)
    IMAGE_TAG=$(get_image_tag)
    VERSIONS=$(get_latest_versions)

    STABLE_LINE=$(echo "$VERSIONS" | grep "^STABLE" | head -1)
    BETA_LINE=$(echo "$VERSIONS" | grep "^BETA" | head -1)

    STABLE_VER=$(echo "$STABLE_LINE" | cut -d'|' -f2)
    STABLE_DATE=$(echo "$STABLE_LINE" | cut -d'|' -f3)
    BETA_VER=$(echo "$BETA_LINE" | cut -d'|' -f2)
    BETA_DATE=$(echo "$BETA_LINE" | cut -d'|' -f3)

    if [ "$CURRENT" = "$STABLE_VER" ]; then
        STATUS="up-to-date"
    else
        STATUS="update-available"
    fi

    cat << EOF
{
    "current": "$CURRENT",
    "image_tag": "$IMAGE_TAG",
    "latest_stable": "$STABLE_VER",
    "latest_stable_date": "$STABLE_DATE",
    "latest_beta": "$BETA_VER",
    "latest_beta_date": "$BETA_DATE",
    "status": "$STATUS"
}
EOF
}

case "${1:-}" in
    --json)
        json_output
        ;;
    *)
        main
        ;;
esac
