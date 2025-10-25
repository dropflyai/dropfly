#!/bin/bash

# Git Version Tagging Script
# Usage: ./scripts/git-version-tag.sh [major|minor|patch]

set -e

echo "🏷️  Git Version Tagging System"
echo "=============================="

# Get current version from package.json
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version")
else
    echo "❌ No package.json found!"
    exit 1
fi

echo "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Determine version bump type
BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "❌ Invalid bump type. Use: major, minor, or patch"
        exit 1
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
TAG_NAME="v$NEW_VERSION"

echo "New version will be: $NEW_VERSION"
echo ""

# Update package.json
echo "📝 Updating package.json..."
if [ "$(uname)" = "Darwin" ]; then
    # macOS
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

# Commit version bump
echo "💾 Committing version bump..."
git add package.json
git commit -m "chore: bump version to $NEW_VERSION" || {
    echo "⚠️  No changes to commit (version might already be updated)"
}

# Create annotated tag
echo "🏷️  Creating Git tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Release version $NEW_VERSION

## Changes in this version:
$(git log --pretty=format:"- %s" HEAD...$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~10) | head -20)

## Deployment
Tagged automatically by version script
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
"

# Show tag info
echo ""
echo "✅ Version tagged successfully!"
echo ""
git show "$TAG_NAME" --no-patch

echo ""
echo "📤 Push changes to remote?"
echo "Run these commands:"
echo "  git push origin main"
echo "  git push origin $TAG_NAME"
echo ""
echo "Or push everything at once:"
echo "  git push origin main --tags"

# Create deployment backup
echo ""
echo "💾 Create deployment backup?"
echo "Run: ./scripts/backup-deployment.sh"