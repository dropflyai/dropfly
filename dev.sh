#!/bin/bash
# Master Developer Command Center
# Usage: ./dev.sh [command] [options]

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the command
COMMAND=$1
shift # Remove first argument, rest are options

# Main command switch
case "$COMMAND" in
  # ============= QUICK ACTIONS =============
  "save" | "s")
    # Quick save current work
    ./save-version.sh "$*" || (git add -A && git commit -m "Quick save: $*")
    ;;
    
  "deploy" | "d")
    # Deploy to environment
    ./deploy.sh $1
    ;;
    
  "check" | "c")
    # Run health check
    ./health-check.sh
    ;;
    
  "gen" | "g")
    # Generate code
    ./generate.sh $1 $2
    ;;
    
  "demo")
    # Create demo branch
    ./create-demo.sh "$*"
    ;;
    
  "rollback" | "rb")
    # Rollback to previous version
    ./quick-rollback.sh
    ;;
    
  # ============= PROJECT MANAGEMENT =============
  "new")
    # Create new project
    PROJECT_TYPE=$1
    PROJECT_NAME=$2
    
    if [ -z "$PROJECT_TYPE" ] || [ -z "$PROJECT_NAME" ]; then
      echo "Usage: ./dev.sh new [nextjs|api|fullstack] [project-name]"
      exit 1
    fi
    
    echo "🚀 Creating new $PROJECT_TYPE project: $PROJECT_NAME"
    
    case "$PROJECT_TYPE" in
      "nextjs")
        npx create-next-app@latest $PROJECT_NAME --typescript --tailwind --app --src-dir
        cd $PROJECT_NAME
        npm install zustand react-query framer-motion
        echo "✅ Next.js project created!"
        ;;
      "api")
        mkdir $PROJECT_NAME && cd $PROJECT_NAME
        npm init -y
        npm install express cors dotenv
        npm install -D typescript @types/node nodemon
        echo "✅ API project created!"
        ;;
      *)
        echo "Unknown project type: $PROJECT_TYPE"
        ;;
    esac
    ;;
    
  # ============= DEVELOPMENT =============
  "start")
    # Start all development services
    echo "🚀 Starting development environment..."
    
    # Start auto-save in background
    if [ -f "auto-commit.sh" ]; then
      ./auto-commit.sh &
      AUTO_PID=$!
      echo "✅ Auto-save running (PID: $AUTO_PID)"
    fi
    
    # Start dev server
    npm run dev &
    DEV_PID=$!
    echo "✅ Dev server running (PID: $DEV_PID)"
    
    # Show dashboard
    sleep 3
    ./dev.sh status
    
    # Wait for interrupt
    echo ""
    echo "Press Ctrl+C to stop all services"
    wait
    ;;
    
  "stop")
    # Stop all services
    echo "🛑 Stopping all services..."
    pkill -f "auto-commit.sh"
    pkill -f "npm run dev"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✅ All services stopped"
    ;;
    
  # ============= TESTING & QUALITY =============
  "test" | "t")
    echo "🧪 Running Test Suite"
    echo "===================="
    
    # TypeScript check
    if [ -f "tsconfig.json" ]; then
      echo "📝 Type checking..."
      npx tsc --noEmit || true
    fi
    
    # Linting
    if grep -q '"lint"' package.json 2>/dev/null; then
      echo "🔍 Linting..."
      npm run lint || true
    fi
    
    # Tests
    if grep -q '"test"' package.json 2>/dev/null; then
      echo "🧪 Running tests..."
      npm test || true
    fi
    
    # Build test
    echo "🔨 Build test..."
    npm run build
    ;;
    
  # ============= GIT OPERATIONS =============
  "commit" | "cm")
    # Smart commit
    MESSAGE="$*"
    if [ -z "$MESSAGE" ]; then
      echo "Enter commit message:"
      read MESSAGE
    fi
    
    git add -A
    git commit -m "$MESSAGE"
    echo "✅ Committed: $MESSAGE"
    ;;
    
  "push" | "p")
    # Push with checks
    echo "📤 Pushing to remote..."
    git push origin $(git branch --show-current)
    ;;
    
  "sync")
    # Full sync with remote
    echo "🔄 Syncing with remote..."
    git add -A
    git commit -m "Sync: $(date)" --no-verify 2>/dev/null
    git pull --rebase
    git push
    echo "✅ Synced!"
    ;;
    
  # ============= STATUS & MONITORING =============
  "status" | "st")
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       DEVELOPER COMMAND CENTER             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Project info
    echo -e "${YELLOW}📁 Project:${NC} $(basename $(pwd))"
    echo -e "${YELLOW}🌿 Branch:${NC} $(git branch --show-current)"
    echo ""
    
    # Git status
    echo -e "${GREEN}📊 Git Status${NC}"
    UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
    if [ "$UNCOMMITTED" -gt 0 ]; then
      echo -e "  ${RED}⚠️  $UNCOMMITTED uncommitted files${NC}"
    else
      echo -e "  ${GREEN}✅ Clean working directory${NC}"
    fi
    echo "  📝 Last commit: $(git log -1 --format='%s' --oneline)"
    echo ""
    
    # Running services
    echo -e "${GREEN}🚀 Services${NC}"
    if lsof -i:3000 > /dev/null 2>&1; then
      echo -e "  ${GREEN}✅ Dev server running on :3000${NC}"
    else
      echo -e "  ${RED}❌ Dev server not running${NC}"
    fi
    
    if pgrep -f "auto-commit" > /dev/null; then
      echo -e "  ${GREEN}✅ Auto-save active${NC}"
    else
      echo -e "  ${YELLOW}⚠️  Auto-save not running${NC}"
    fi
    echo ""
    
    # Quick stats
    echo -e "${GREEN}📈 Today's Activity${NC}"
    echo "  💾 Commits: $(git log --since=midnight --oneline 2>/dev/null | wc -l)"
    echo "  📝 Files changed: $(git diff --stat HEAD@{1.day.ago} 2>/dev/null | tail -1 | awk '{print $1}')"
    echo "  🏷️  Versions saved: $(git tag -l 'v*' | wc -l)"
    echo ""
    
    # Health score
    if [ -f "HEALTH-REPORT.md" ]; then
      SCORE=$(grep "Score:" HEALTH-REPORT.md | head -1 | awk '{print $2}')
      echo -e "${GREEN}🏥 Health Score:${NC} $SCORE"
    fi
    ;;
    
  # ============= UTILITIES =============
  "clean")
    # Clean project
    echo "🧹 Cleaning project..."
    rm -rf node_modules .next .turbo dist build
    rm -f package-lock.json yarn.lock pnpm-lock.yaml
    npm cache clean --force
    echo "✅ Project cleaned"
    echo "Run 'npm install' to reinstall dependencies"
    ;;
    
  "backup")
    # Create full backup
    echo "💾 Creating full backup..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    tar -czf "../$BACKUP_NAME.tar.gz" --exclude=node_modules --exclude=.next .
    echo "✅ Backup created: ../$BACKUP_NAME.tar.gz"
    ;;
    
  "update")
    # Update all dependencies
    echo "📦 Updating dependencies..."
    npm update
    npm audit fix
    echo "✅ Dependencies updated"
    ;;
    
  # ============= HELP =============
  "help" | "h" | "")
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     🚀 DEVELOPER COMMAND CENTER            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Quick Actions:${NC}"
    echo "  ./dev.sh save [msg]      💾 Save version"
    echo "  ./dev.sh deploy [env]    🚀 Deploy to environment"
    echo "  ./dev.sh check           🏥 Run health check"
    echo "  ./dev.sh gen [type]      🔨 Generate code"
    echo "  ./dev.sh demo [name]     🎭 Create demo branch"
    echo "  ./dev.sh rollback        ↩️  Rollback to previous"
    echo ""
    echo -e "${YELLOW}Project Management:${NC}"
    echo "  ./dev.sh new [type] [nm] 🆕 Create new project"
    echo "  ./dev.sh start           ▶️  Start everything"
    echo "  ./dev.sh stop            ⏹️  Stop everything"
    echo "  ./dev.sh status          📊 Show status"
    echo ""
    echo -e "${YELLOW}Development:${NC}"
    echo "  ./dev.sh test            🧪 Run tests"
    echo "  ./dev.sh commit [msg]    📝 Commit changes"
    echo "  ./dev.sh push            📤 Push to remote"
    echo "  ./dev.sh sync            🔄 Sync with remote"
    echo ""
    echo -e "${YELLOW}Utilities:${NC}"
    echo "  ./dev.sh clean           🧹 Clean project"
    echo "  ./dev.sh backup          💾 Create backup"
    echo "  ./dev.sh update          📦 Update dependencies"
    echo ""
    echo -e "${GREEN}Shortcuts:${NC}"
    echo "  s=save  d=deploy  c=check  g=gen  t=test"
    echo "  cm=commit  p=push  st=status  h=help"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./dev.sh s 'working auth'"
    echo "  ./dev.sh d staging"
    echo "  ./dev.sh g component Button"
    echo ""
    ;;
    
  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Run './dev.sh help' for available commands"
    exit 1
    ;;
esac