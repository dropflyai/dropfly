#!/bin/bash
# Auto-commit script - Saves your work every 5 minutes
# Run: chmod +x auto-commit.sh && ./auto-commit.sh &

echo "🛡️ Auto-save protection enabled"
echo "💾 Saving every 5 minutes to Git"
echo "📝 Updating SESSION-STATE.md"
echo "Press Ctrl+C to stop"

# Counter for commits
COMMIT_COUNT=0

while true; do
  # Update session state with timestamp
  if [ -f "SESSION-STATE.md" ]; then
    # Update the timestamp in SESSION-STATE.md
    sed -i.bak "s/## 🕐 Last Updated:.*/## 🕐 Last Updated: $(date '+%Y-%m-%d %H:%M:%S')/" SESSION-STATE.md
    rm SESSION-STATE.md.bak 2>/dev/null
  fi
  
  # Check if there are changes to commit
  git add -A 2>/dev/null
  
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    # Changes detected, create commit
    COMMIT_COUNT=$((COMMIT_COUNT + 1))
    git commit -m "🔄 Auto-save #${COMMIT_COUNT}: $(date '+%Y-%m-%d %H:%M:%S')" --no-verify 2>/dev/null
    
    echo "✅ Progress saved at $(date '+%H:%M:%S') - Commit #${COMMIT_COUNT}"
    
    # Try to push (will fail if no remote, that's ok)
    git push origin main --force-with-lease 2>/dev/null &
  else
    echo "📍 No changes at $(date '+%H:%M:%S') - Watching..."
  fi
  
  # Wait 5 minutes
  sleep 300
done