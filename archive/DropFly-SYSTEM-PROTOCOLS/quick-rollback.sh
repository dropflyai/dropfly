#!/bin/bash
# Quickly rollback to a previous version or demo
# Usage: ./quick-rollback.sh

echo "🔄 Quick Rollback System"
echo "========================"
echo ""

# Show available options
echo "📋 Recent Versions (newest first):"
echo "-----------------------------------"
git tag -l "v*" --sort=-version:refname 2>/dev/null | head -10 | while read tag; do
  DESC=$(git tag -l -n1 "$tag" | sed "s/^$tag\s*//")
  echo "  $tag - $DESC"
done

echo ""
echo "📋 Demo Branches:"
echo "-----------------"
git branch -a 2>/dev/null | grep -E "demo/" | sed 's/.*\///' | while read branch; do
  echo "  demo/$branch"
done

echo ""
echo "📋 Recent Checkpoints:"
echo "----------------------"
git branch -a 2>/dev/null | grep -E "(checkpoint|emergency-backup)" | sed 's/.*\///' | head -5 | while read branch; do
  echo "  $branch"
done

echo ""
echo "📋 Version Branches:"
echo "--------------------"
git branch -a 2>/dev/null | grep -E "version/" | sed 's/.*\///' | head -5 | while read branch; do
  echo "  version/$branch"
done

echo ""
echo "----------------------------------------"
read -p "Enter version/branch to rollback to (or 'q' to quit): " TARGET

if [ "$TARGET" = "q" ] || [ -z "$TARGET" ]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

# Check if target exists
if git rev-parse --verify "$TARGET" >/dev/null 2>&1; then
  echo ""
  echo "⚠️  WARNING: This will rollback to: ${TARGET}"
  echo "Current work will be saved in a backup branch"
  echo ""
  read -p "Continue? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create backup of current state first
    BACKUP_BRANCH="rollback-backup-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Creating backup of current state..."
    git add -A 2>/dev/null
    git commit -m "Backup before rollback to ${TARGET}" --no-verify 2>/dev/null
    git branch "${BACKUP_BRANCH}"
    echo "✓ Current state backed up to: ${BACKUP_BRANCH}"
    
    # Perform rollback
    echo "🔄 Rolling back to ${TARGET}..."
    git checkout "${TARGET}" 2>/dev/null
    
    # Check if we're in detached HEAD state (from a tag)
    if git symbolic-ref -q HEAD >/dev/null 2>&1; then
      echo "✅ Rolled back to branch: ${TARGET}"
    else
      echo "✅ Rolled back to version: ${TARGET}"
      echo ""
      echo "📝 Note: You're in 'detached HEAD' state."
      echo "To create a new branch from here:"
      echo "  git checkout -b new-branch-name"
      echo ""
      echo "To return to main:"
      echo "  git checkout main"
    fi
    
    echo ""
    echo "📊 Rollback Summary:"
    echo "-------------------"
    echo "Rolled back to: ${TARGET}"
    echo "Previous state saved in: ${BACKUP_BRANCH}"
    echo ""
    echo "🔧 Next Steps:"
    echo "- Review the rolled back code"
    echo "- Run: npm install (if dependencies changed)"
    echo "- Run: npm run dev (to test)"
    echo ""
    echo "↩️  To undo this rollback:"
    echo "  git checkout ${BACKUP_BRANCH}"
  else
    echo "❌ Rollback cancelled"
  fi
else
  echo "❌ Error: Target '${TARGET}' not found"
  echo ""
  echo "Available options:"
  echo "- Version tags (e.g., v1.0-working-auth)"
  echo "- Demo branches (e.g., demo/client-presentation)"
  echo "- Checkpoint branches (e.g., checkpoint/20240115)"
  echo ""
  echo "Try running again with a valid target"
fi