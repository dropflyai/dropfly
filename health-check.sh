#!/bin/bash
# Complete project health check - catch issues before they become problems
# Usage: ./health-check.sh

echo "🏥 Project Health Check"
echo "======================="
echo "Project: $(basename $(pwd))"
echo "Date: $(date)"
echo ""

SCORE=100
WARNINGS=0
ERRORS=0

# Function to reduce score
reduce_score() {
  POINTS=$1
  REASON=$2
  SCORE=$((SCORE - POINTS))
  echo "  ⚠️  -$POINTS points: $REASON"
  ((WARNINGS++))
}

error_found() {
  REASON=$1
  echo "  ❌ ERROR: $REASON"
  ((ERRORS++))
}

# 1. Git Health
echo "📊 Git Repository Health"
echo "------------------------"

# Uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
if [ "$UNCOMMITTED" -gt 0 ]; then
  reduce_score 5 "$UNCOMMITTED uncommitted files"
else
  echo "  ✅ Working directory clean"
fi

# Behind remote
BEHIND=$(git rev-list HEAD..@{u} --count 2>/dev/null || echo 0)
if [ "$BEHIND" -gt 0 ]; then
  reduce_score 10 "$BEHIND commits behind remote"
fi

# Unpushed commits
AHEAD=$(git rev-list @{u}..HEAD --count 2>/dev/null || echo 0)
if [ "$AHEAD" -gt 0 ]; then
  reduce_score 5 "$AHEAD unpushed commits"
fi

# Last commit age
LAST_COMMIT_DAYS=$(( ($(date +%s) - $(git log -1 --format=%ct)) / 86400 ))
if [ "$LAST_COMMIT_DAYS" -gt 7 ]; then
  reduce_score 5 "No commits in $LAST_COMMIT_DAYS days"
fi

echo ""

# 2. Dependencies Health
echo "📦 Dependencies Health"
echo "----------------------"

# Check for vulnerabilities
if [ -f "package.json" ]; then
  VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo 0)
  if [ "$VULNS" -gt 0 ]; then
    HIGH_VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo 0)
    if [ "$HIGH_VULNS" -gt 0 ]; then
      error_found "$HIGH_VULNS high/critical vulnerabilities"
      reduce_score 20 "Run: npm audit fix"
    else
      reduce_score 10 "$VULNS low/moderate vulnerabilities"
    fi
  else
    echo "  ✅ No known vulnerabilities"
  fi
  
  # Check for outdated packages
  OUTDATED=$(npm outdated --json 2>/dev/null | jq 'length' 2>/dev/null || echo 0)
  if [ "$OUTDATED" -gt 10 ]; then
    reduce_score 5 "$OUTDATED outdated packages"
  elif [ "$OUTDATED" -gt 0 ]; then
    echo "  📦 $OUTDATED packages could be updated"
  fi
else
  echo "  ⏭️  No package.json found"
fi

echo ""

# 3. Code Quality
echo "💻 Code Quality"
echo "---------------"

# TypeScript errors
if [ -f "tsconfig.json" ]; then
  TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo 0)
  if [ "$TS_ERRORS" -gt 0 ]; then
    error_found "$TS_ERRORS TypeScript errors"
    reduce_score 15 "Run: npx tsc --noEmit"
  else
    echo "  ✅ No TypeScript errors"
  fi
fi

# ESLint issues
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
  LINT_OUTPUT=$(npm run lint 2>&1 || true)
  if echo "$LINT_OUTPUT" | grep -q "error"; then
    reduce_score 10 "ESLint errors found"
  else
    echo "  ✅ No linting errors"
  fi
fi

# TODO comments
TODOS=$(grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . 2>/dev/null | wc -l | xargs)
if [ "$TODOS" -gt 10 ]; then
  reduce_score 5 "$TODOS TODO/FIXME comments"
elif [ "$TODOS" -gt 0 ]; then
  echo "  📝 $TODOS TODO comments found"
fi

echo ""

# 4. Performance
echo "⚡ Performance"
echo "--------------"

# Bundle size
if [ -d ".next" ]; then
  BUNDLE_SIZE=$(du -sk .next | cut -f1)
  if [ "$BUNDLE_SIZE" -gt 100000 ]; then  # 100MB
    reduce_score 10 "Large bundle size: $(($BUNDLE_SIZE / 1024))MB"
  else
    echo "  ✅ Bundle size: $(($BUNDLE_SIZE / 1024))MB"
  fi
fi

# Check for large files
LARGE_FILES=$(find . -type f -size +1M ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | wc -l | xargs)
if [ "$LARGE_FILES" -gt 0 ]; then
  reduce_score 5 "$LARGE_FILES files larger than 1MB"
  echo "    Run: find . -type f -size +1M -exec ls -lh {} \;"
fi

echo ""

# 5. Security
echo "🔒 Security"
echo "-----------"

# Check for exposed secrets
SECRET_PATTERNS=(".env" "secret" "apikey" "api_key" "password" "token")
EXPOSED_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  if git ls-files | grep -i "$pattern" | grep -v ".gitignore" > /dev/null 2>&1; then
    ((EXPOSED_SECRETS++))
  fi
done

if [ "$EXPOSED_SECRETS" -gt 0 ]; then
  error_found "Potential secrets in repository!"
  reduce_score 30 "Check git ls-files for sensitive files"
else
  echo "  ✅ No obvious secrets exposed"
fi

# Check .env.example exists
if [ -f ".env.local" ] || [ -f ".env" ]; then
  if [ ! -f ".env.example" ]; then
    reduce_score 5 "Missing .env.example file"
  else
    echo "  ✅ Environment example file exists"
  fi
fi

echo ""

# 6. Documentation
echo "📚 Documentation"
echo "----------------"

# README exists and has content
if [ -f "README.md" ]; then
  README_LINES=$(wc -l < README.md)
  if [ "$README_LINES" -lt 20 ]; then
    reduce_score 5 "README.md is too short ($README_LINES lines)"
  else
    echo "  ✅ README.md exists ($README_LINES lines)"
  fi
else
  reduce_score 10 "No README.md file"
fi

# Check for other important docs
[ ! -f "CONTRIBUTING.md" ] && echo "  📝 Consider adding CONTRIBUTING.md"
[ ! -f "LICENSE" ] && echo "  📝 Consider adding LICENSE file"

echo ""

# 7. Testing
echo "🧪 Testing"
echo "----------"

# Check if tests exist
if [ -d "__tests__" ] || [ -d "tests" ] || find . -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
  echo "  ✅ Test files found"
  
  # Try to run tests
  if grep -q '"test"' package.json 2>/dev/null; then
    echo "  📝 Run tests with: npm test"
  fi
else
  reduce_score 15 "No test files found"
fi

echo ""

# 8. Build Status
echo "🔨 Build Status"
echo "---------------"

# Try a build
echo "  Testing build..."
BUILD_OUTPUT=$(npm run build 2>&1)
if [ $? -eq 0 ]; then
  echo "  ✅ Build successful"
else
  error_found "Build failed!"
  reduce_score 25 "Fix build errors before deploying"
fi

echo ""
echo "======================================="
echo "📊 HEALTH SCORE: $SCORE/100"
echo "======================================="

# Determine health status
if [ "$ERRORS" -gt 0 ]; then
  echo "🔴 Status: CRITICAL - $ERRORS errors found!"
elif [ "$SCORE" -ge 90 ]; then
  echo "🟢 Status: EXCELLENT - Great job!"
elif [ "$SCORE" -ge 75 ]; then
  echo "🟡 Status: GOOD - Minor improvements needed"
elif [ "$SCORE" -ge 60 ]; then
  echo "🟠 Status: FAIR - Several issues to address"
else
  echo "🔴 Status: POOR - Significant improvements needed"
fi

echo ""
echo "📋 Summary"
echo "----------"
echo "Warnings: $WARNINGS"
echo "Errors: $ERRORS"
echo "Score: $SCORE/100"

if [ "$SCORE" -lt 75 ]; then
  echo ""
  echo "🔧 Priority Actions:"
  echo "1. Fix any build errors"
  echo "2. Address security vulnerabilities"
  echo "3. Resolve TypeScript/linting errors"
  echo "4. Update dependencies"
  echo "5. Commit and push changes"
fi

# Save health report
echo ""
echo "📝 Saving health report..."
cat > HEALTH-REPORT.md << EOF
# Health Report - $(date '+%Y-%m-%d %H:%M')

## Score: $SCORE/100

### Issues Found
- Warnings: $WARNINGS
- Errors: $ERRORS

### Details
$(./health-check.sh 2>&1 | grep -E "⚠️|❌|📝")

### Next Steps
1. Address critical errors first
2. Fix security vulnerabilities
3. Update outdated dependencies
4. Improve documentation
5. Add missing tests
EOF

echo "Report saved to HEALTH-REPORT.md"

# Exit with error if score is too low
if [ "$SCORE" -lt 60 ] || [ "$ERRORS" -gt 0 ]; then
  exit 1
fi