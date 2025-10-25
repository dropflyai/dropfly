#!/bin/bash
# VoiceFly Enterprise - Comprehensive Health Check Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOG_FILE="logs/system/health-check-$(date +%Y%m%d-%H%M%S).log"
ALERT_THRESHOLD=3
SERVICES=("web-dashboard" "voice-engine" "research-engine" "api-gateway")

echo -e "${BLUE}🏥 VoiceFly Enterprise Health Check${NC}"
echo "=================================="

# Create log directory
mkdir -p logs/system

# Start logging
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "🔍 Starting health check at $(date)"

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to perform health check
check_health() {
    local service_name="$1"
    local check_command="$2"
    local description="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "🔄 $description... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo "   Command: $check_command"
        return 1
    fi
}

# Function to check warning conditions
check_warning() {
    local description="$1"
    local check_command="$2"
    local threshold="$3"
    
    echo -n "⚠️  $description... "
    
    local result
    result=$(eval "$check_command" 2>/dev/null || echo "0")
    
    if [ "$result" -gt "$threshold" ]; then
        echo -e "${YELLOW}⚠️  WARNING${NC} (Current: $result, Threshold: $threshold)"
        WARNINGS=$((WARNINGS + 1))
        return 1
    else
        echo -e "${GREEN}✅ OK${NC} (Current: $result)"
        return 0
    fi
}

echo "🔍 System Health Checks"
echo "======================"

# 1. Check Node.js version
check_health "node" "node --version | grep -E 'v(20|21|22)'" "Node.js version compatibility"

# 2. Check npm version
check_health "npm" "npm --version" "npm installation"

# 3. Check disk space (fail if less than 1GB)
check_health "disk" "[ $(df / | tail -1 | awk '{print $4}') -gt 1000000 ]" "Sufficient disk space (>1GB)"

# 4. Check memory usage
check_warning "Memory usage" "free -m | awk 'NR==2{printf \"%.0f\", \$3*100/\$2}'" "80"

# 5. Check if turbo is available
check_health "turbo" "command -v turbo" "Turbo build system"

# 6. Check package.json integrity
check_health "package" "[ -f package.json ] && [ -f turbo.json ]" "Core configuration files"

echo ""
echo "🗂️  Workspace Health Checks"
echo "==========================="

# 7. Check workspace packages
for workspace in apps packages services; do
    if [ -d "$workspace" ]; then
        check_health "$workspace" "[ -n \"$(find $workspace -name package.json)\" ]" "$workspace directory structure"
    fi
done

echo ""
echo "📦 Dependencies Health Checks"
echo "============================="

# 8. Check if node_modules exists and is populated
check_health "deps" "[ -d node_modules ] && [ -n \"$(ls node_modules)\" ]" "Node modules installed"

# 9. Try to resolve core dependencies
check_health "winston" "node -e \"require('winston')\"" "Winston logger dependency"
check_health "typescript" "node -e \"require('typescript')\"" "TypeScript dependency"

echo ""
echo "🏗️  Build System Health Checks"
echo "=============================="

# 10. Check if TypeScript config is valid
check_health "tsconfig" "[ -f tsconfig.json ] || npx tsc --noEmit --skipLibCheck" "TypeScript configuration"

# 11. Check if we can run basic turbo commands
check_health "turbo-run" "turbo run lint --dry=json" "Turbo command execution"

echo ""
echo "📁 File System Health Checks"
echo "==========================="

# 12. Check critical directories exist
CRITICAL_DIRS=("logs" "logs/app" "logs/system" "logs/audit" "logs/crash" "backups")
for dir in "${CRITICAL_DIRS[@]}"; do
    check_health "dir-$dir" "[ -d \"$dir\" ]" "Critical directory: $dir"
done

# 13. Check log file permissions
check_health "log-perms" "[ -w logs ]" "Log directory writable"

echo ""
echo "🔒 Security Health Checks"
echo "========================"

# 14. Check for sensitive files in repo
check_health "no-secrets" "! find . -name '*.env*' -not -path './node_modules/*' | grep -v .env.example" "No .env files committed"

# 15. Check .gitignore exists
check_health "gitignore" "[ -f .gitignore ]" ".gitignore file exists"

echo ""
echo "🚀 Process Health Checks"
echo "======================="

# 16. Check if any VoiceFly processes are running
RUNNING_PROCESSES=$(ps aux | grep -i voicefly | grep -v grep | wc -l)
if [ "$RUNNING_PROCESSES" -gt 0 ]; then
    echo -e "🔄 Found $RUNNING_PROCESSES VoiceFly processes running"
else
    echo -e "📴 No VoiceFly processes currently running"
fi

# 17. Check system load
check_warning "System load average" "uptime | awk -F'load average:' '{ print \$2 }' | awk '{ print \$1 }' | sed 's/,//'" "2"

echo ""
echo "📊 Performance Health Checks"
echo "==========================="

# 18. Check recent log file sizes
LOG_SIZE=$(du -sh logs/ 2>/dev/null | awk '{print $1}' | sed 's/[^0-9]//g' || echo "0")
check_warning "Log directory size" "echo $LOG_SIZE" "1000"

# 19. Check for recent crashes
RECENT_CRASHES=$(find logs/crash -name "*.log" -mtime -1 2>/dev/null | wc -l)
if [ "$RECENT_CRASHES" -gt 0 ]; then
    echo -e "⚠️  Found $RECENT_CRASHES recent crash log(s) ${YELLOW}WARNING${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "🔍 No recent crashes detected ${GREEN}✅ OK${NC}"
fi

echo ""
echo "📈 Summary"
echo "=========="
echo -e "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}" 
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

# Calculate health percentage
HEALTH_PERCENTAGE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
echo -e "Overall health: $HEALTH_PERCENTAGE%"

# Determine overall status
if [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "Status: ${GREEN}HEALTHY ✅${NC}"
    EXIT_CODE=0
elif [ "$FAILED_CHECKS" -eq 0 ] && [ "$WARNINGS" -gt 0 ]; then
    echo -e "Status: ${YELLOW}HEALTHY WITH WARNINGS ⚠️${NC}"
    EXIT_CODE=1
elif [ "$FAILED_CHECKS" -le "$ALERT_THRESHOLD" ]; then
    echo -e "Status: ${YELLOW}DEGRADED ⚠️${NC}"
    EXIT_CODE=2
else
    echo -e "Status: ${RED}UNHEALTHY ❌${NC}"
    EXIT_CODE=3
fi

echo ""
echo "📝 Log file: $LOG_FILE"
echo "🕒 Check completed at $(date)"

# If unhealthy, suggest recovery actions
if [ "$EXIT_CODE" -gt 1 ]; then
    echo ""
    echo -e "${BLUE}🛠️  Suggested Recovery Actions:${NC}"
    echo "1. Check system resources (disk space, memory)"
    echo "2. Reinstall dependencies: npm install"
    echo "3. Rebuild packages: npm run build"  
    echo "4. Check recent logs: tail -f logs/system/*.log"
    echo "5. Restart services if needed"
    echo "6. Run: npm run clean && npm install"
fi

# Store health check result for monitoring
echo "{\"timestamp\":\"$(date -Iseconds)\",\"status\":\"$EXIT_CODE\",\"passed\":$PASSED_CHECKS,\"failed\":$FAILED_CHECKS,\"warnings\":$WARNINGS,\"health_percentage\":$HEALTH_PERCENTAGE}" > logs/system/health-status.json

exit $EXIT_CODE