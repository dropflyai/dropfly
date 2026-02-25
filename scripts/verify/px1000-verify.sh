#!/bin/bash
#
# PX1000 UNIFIED VERIFICATION SCRIPT
# ===================================
# Auto-detects project type and runs appropriate verification suite.
# Returns exit code 0 (pass) or 1 (fail).
#
# Usage: ./scripts/verify/px1000-verify.sh [project-dir] [url]
#
# Arguments:
#   project-dir  Optional: Path to project directory (default: current dir)
#   url          Optional: URL for web verification (auto-detected if not provided)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Globals
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROJECT_DIR="${1:-$(pwd)}"
URL="${2:-}"
EVIDENCE_DIR="/tmp/px1000-verify-$(date +%Y%m%d_%H%M%S)"
OVERALL_EXIT_CODE=0
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================
# UTILITY FUNCTIONS
# ============================================

print_header() {
    echo ""
    echo "========================================================================"
    echo -e "${BLUE}$1${NC}"
    echo "========================================================================"
}

print_section() {
    echo ""
    echo "------------------------------------------------------------------------"
    echo -e "${YELLOW}$1${NC}"
    echo "------------------------------------------------------------------------"
}

print_pass() {
    echo -e "  ${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++)) || true
}

print_fail() {
    echo -e "  ${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++)) || true
    OVERALL_EXIT_CODE=1
}

print_skip() {
    echo -e "  ${YELLOW}[SKIP]${NC} $1"
}

print_info() {
    echo -e "  ${BLUE}[INFO]${NC} $1"
}

# ============================================
# PROJECT TYPE DETECTION
# ============================================

detect_project_type() {
    cd "$PROJECT_DIR"

    # Check for Expo/React Native mobile
    if [ -f "app.json" ] && [ -f "package.json" ]; then
        if grep -q '"expo"' package.json 2>/dev/null; then
            echo "mobile-expo"
            return
        fi
    fi

    # Check for React Native without Expo
    if [ -f "package.json" ] && grep -q '"react-native"' package.json 2>/dev/null; then
        echo "mobile-rn"
        return
    fi

    # Check for Next.js
    if [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
        echo "web-nextjs"
        return
    fi

    # Check for Vite
    if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
        echo "web-vite"
        return
    fi

    # Check for generic React/web
    if [ -f "package.json" ] && grep -q '"react"' package.json 2>/dev/null; then
        echo "web-react"
        return
    fi

    # Check for API/backend (Express, Fastify, etc.)
    if [ -d "routes" ] || [ -d "controllers" ] || [ -d "api" ]; then
        if [ -f "package.json" ]; then
            echo "api-node"
            return
        fi
    fi

    # Check for Python API
    if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
        if [ -d "routes" ] || [ -d "api" ] || [ -f "main.py" ] || [ -f "app.py" ]; then
            echo "api-python"
            return
        fi
    fi

    # Check for generic library/package
    if [ -f "package.json" ]; then
        echo "library-node"
        return
    fi

    if [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
        echo "library-python"
        return
    fi

    # Default: unknown
    echo "unknown"
}

# ============================================
# VERIFICATION SUITES
# ============================================

verify_mobile_expo() {
    print_section "Mobile (Expo) Verification"

    cd "$PROJECT_DIR"

    # Check package.json exists
    if [ -f "package.json" ]; then
        print_pass "package.json exists"
    else
        print_fail "package.json not found"
        return 1
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        print_pass "node_modules installed"
    else
        print_info "Installing dependencies..."
        npm install 2>&1 || { print_fail "npm install failed"; return 1; }
        print_pass "Dependencies installed"
    fi

    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        print_info "Running TypeScript check..."
        if npx tsc --noEmit 2>&1; then
            print_pass "TypeScript compilation"
        else
            print_fail "TypeScript errors found"
        fi
    else
        print_skip "No tsconfig.json - skipping TypeScript check"
    fi

    # ESLint check
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        print_info "Running ESLint..."
        if npm run lint 2>&1 || npx eslint . --ext .ts,.tsx,.js,.jsx 2>&1; then
            print_pass "ESLint check"
        else
            print_fail "ESLint errors found"
        fi
    else
        print_skip "No ESLint config - skipping lint"
    fi

    # Run tests if available
    if grep -q '"test"' package.json 2>/dev/null; then
        print_info "Running tests..."
        if npm test -- --ci --passWithNoTests 2>&1; then
            print_pass "Tests passed"
        else
            print_fail "Tests failed"
        fi
    else
        print_skip "No test script - skipping tests"
    fi

    # Expo doctor check
    if command -v npx &> /dev/null; then
        print_info "Running Expo doctor..."
        if npx expo-doctor 2>&1; then
            print_pass "Expo doctor check"
        else
            print_fail "Expo doctor found issues"
        fi
    fi

    # App.json validation
    if [ -f "app.json" ]; then
        if python3 -c "import json; json.load(open('app.json'))" 2>/dev/null; then
            print_pass "app.json is valid JSON"
        else
            print_fail "app.json is invalid JSON"
        fi
    fi
}

verify_web_nextjs() {
    print_section "Web (Next.js) Verification"

    cd "$PROJECT_DIR"

    # Check package.json exists
    if [ -f "package.json" ]; then
        print_pass "package.json exists"
    else
        print_fail "package.json not found"
        return 1
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        print_pass "node_modules installed"
    else
        print_info "Installing dependencies..."
        npm install 2>&1 || { print_fail "npm install failed"; return 1; }
        print_pass "Dependencies installed"
    fi

    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        print_info "Running TypeScript check..."
        if npx tsc --noEmit 2>&1; then
            print_pass "TypeScript compilation"
        else
            print_fail "TypeScript errors found"
        fi
    fi

    # ESLint check
    print_info "Running ESLint..."
    if npm run lint 2>&1; then
        print_pass "ESLint check"
    else
        print_fail "ESLint errors found"
    fi

    # Build check
    print_info "Running Next.js build..."
    if npm run build 2>&1; then
        print_pass "Next.js build successful"
    else
        print_fail "Next.js build failed"
    fi

    # Run tests if available
    if grep -q '"test"' package.json 2>/dev/null; then
        print_info "Running tests..."
        if npm test -- --ci --passWithNoTests 2>&1; then
            print_pass "Tests passed"
        else
            print_fail "Tests failed"
        fi
    fi

    # Triple verify with Playwright if URL provided
    if [ -n "$URL" ]; then
        run_triple_verify "$URL"
    fi
}

verify_web_vite() {
    print_section "Web (Vite) Verification"

    cd "$PROJECT_DIR"

    # Check package.json exists
    if [ -f "package.json" ]; then
        print_pass "package.json exists"
    else
        print_fail "package.json not found"
        return 1
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        print_pass "node_modules installed"
    else
        print_info "Installing dependencies..."
        npm install 2>&1 || { print_fail "npm install failed"; return 1; }
        print_pass "Dependencies installed"
    fi

    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        print_info "Running TypeScript check..."
        if npx tsc --noEmit 2>&1; then
            print_pass "TypeScript compilation"
        else
            print_fail "TypeScript errors found"
        fi
    fi

    # ESLint check
    if npm run lint 2>&1; then
        print_pass "ESLint check"
    else
        print_fail "ESLint errors found"
    fi

    # Build check
    print_info "Running Vite build..."
    if npm run build 2>&1; then
        print_pass "Vite build successful"
    else
        print_fail "Vite build failed"
    fi

    # Run tests if available
    if grep -q '"test"' package.json 2>/dev/null; then
        print_info "Running tests..."
        if npm test -- --ci --passWithNoTests 2>&1; then
            print_pass "Tests passed"
        else
            print_fail "Tests failed"
        fi
    fi

    # Triple verify with Playwright if URL provided
    if [ -n "$URL" ]; then
        run_triple_verify "$URL"
    fi
}

verify_api_node() {
    print_section "API (Node.js) Verification"

    cd "$PROJECT_DIR"

    # Check package.json exists
    if [ -f "package.json" ]; then
        print_pass "package.json exists"
    else
        print_fail "package.json not found"
        return 1
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        print_pass "node_modules installed"
    else
        print_info "Installing dependencies..."
        npm install 2>&1 || { print_fail "npm install failed"; return 1; }
        print_pass "Dependencies installed"
    fi

    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        print_info "Running TypeScript check..."
        if npx tsc --noEmit 2>&1; then
            print_pass "TypeScript compilation"
        else
            print_fail "TypeScript errors found"
        fi
    fi

    # ESLint check
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        if npm run lint 2>&1 || npx eslint . 2>&1; then
            print_pass "ESLint check"
        else
            print_fail "ESLint errors found"
        fi
    fi

    # Run tests
    if grep -q '"test"' package.json 2>/dev/null; then
        print_info "Running tests..."
        if npm test -- --ci --passWithNoTests 2>&1; then
            print_pass "Tests passed"
        else
            print_fail "Tests failed"
        fi
    else
        print_skip "No test script defined"
    fi

    # Security audit
    print_info "Running npm audit..."
    if npm audit --production 2>&1; then
        print_pass "No critical vulnerabilities"
    else
        print_fail "Security vulnerabilities found"
    fi
}

verify_library_node() {
    print_section "Library (Node.js) Verification"

    cd "$PROJECT_DIR"

    # Check package.json exists
    if [ -f "package.json" ]; then
        print_pass "package.json exists"
    else
        print_fail "package.json not found"
        return 1
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        print_pass "node_modules installed"
    else
        print_info "Installing dependencies..."
        npm install 2>&1 || { print_fail "npm install failed"; return 1; }
        print_pass "Dependencies installed"
    fi

    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        print_info "Running TypeScript check..."
        if npx tsc --noEmit 2>&1; then
            print_pass "TypeScript compilation"
        else
            print_fail "TypeScript errors found"
        fi
    fi

    # Run tests
    if grep -q '"test"' package.json 2>/dev/null; then
        print_info "Running tests..."
        if npm test -- --ci --passWithNoTests 2>&1; then
            print_pass "Tests passed"
        else
            print_fail "Tests failed"
        fi
    else
        print_skip "No test script defined"
    fi
}

verify_api_python() {
    print_section "API (Python) Verification"

    cd "$PROJECT_DIR"

    # Check for virtual environment
    if [ -d "venv" ] || [ -d ".venv" ]; then
        print_pass "Virtual environment exists"
    else
        print_info "No virtual environment found"
    fi

    # Type checking with mypy
    if command -v mypy &> /dev/null; then
        print_info "Running mypy type check..."
        if mypy . 2>&1; then
            print_pass "mypy type check"
        else
            print_fail "mypy found type errors"
        fi
    else
        print_skip "mypy not installed"
    fi

    # Run pytest
    if command -v pytest &> /dev/null; then
        print_info "Running pytest..."
        if pytest 2>&1; then
            print_pass "pytest passed"
        else
            print_fail "pytest failed"
        fi
    else
        print_skip "pytest not installed"
    fi

    # Lint with ruff or flake8
    if command -v ruff &> /dev/null; then
        print_info "Running ruff..."
        if ruff check . 2>&1; then
            print_pass "ruff lint check"
        else
            print_fail "ruff found issues"
        fi
    elif command -v flake8 &> /dev/null; then
        print_info "Running flake8..."
        if flake8 . 2>&1; then
            print_pass "flake8 lint check"
        else
            print_fail "flake8 found issues"
        fi
    fi
}

verify_library_python() {
    print_section "Library (Python) Verification"

    cd "$PROJECT_DIR"

    # Type checking with mypy
    if command -v mypy &> /dev/null; then
        print_info "Running mypy type check..."
        if mypy . 2>&1; then
            print_pass "mypy type check"
        else
            print_fail "mypy found type errors"
        fi
    fi

    # Run pytest
    if command -v pytest &> /dev/null; then
        print_info "Running pytest..."
        if pytest 2>&1; then
            print_pass "pytest passed"
        else
            print_fail "pytest failed"
        fi
    fi
}

# ============================================
# TRIPLE VERIFY (Playwright)
# ============================================

run_triple_verify() {
    local url="$1"

    print_section "Triple Verification (Playwright)"

    # Check if triple-verify.py exists
    TRIPLE_VERIFY_SCRIPT=""

    # Check in current project
    if [ -f "$PROJECT_DIR/scripts/automation/triple-verify.py" ]; then
        TRIPLE_VERIFY_SCRIPT="$PROJECT_DIR/scripts/automation/triple-verify.py"
    # Check in repo root
    elif [ -f "$REPO_ROOT/PROJECT-TEMPLATE/scripts/automation/triple-verify.py" ]; then
        TRIPLE_VERIFY_SCRIPT="$REPO_ROOT/PROJECT-TEMPLATE/scripts/automation/triple-verify.py"
    fi

    if [ -n "$TRIPLE_VERIFY_SCRIPT" ]; then
        print_info "Running triple-verify.py on $url..."
        if python3 "$TRIPLE_VERIFY_SCRIPT" "$url" 2>&1; then
            print_pass "Triple verification passed"
        else
            print_fail "Triple verification failed"
        fi
    else
        print_skip "triple-verify.py not found - skipping Playwright verification"
    fi
}

# ============================================
# COLLECT EVIDENCE
# ============================================

collect_evidence() {
    print_section "Collecting Evidence"

    mkdir -p "$EVIDENCE_DIR"

    # Save verification summary
    cat > "$EVIDENCE_DIR/verification-summary.txt" << EOF
PX1000 Verification Summary
===========================
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Project Directory: $PROJECT_DIR
Project Type: $PROJECT_TYPE
Tests Passed: $TESTS_PASSED
Tests Failed: $TESTS_FAILED
Overall Status: $([ $OVERALL_EXIT_CODE -eq 0 ] && echo "PASSED" || echo "FAILED")
Exit Code: $OVERALL_EXIT_CODE
EOF

    print_info "Evidence saved to: $EVIDENCE_DIR"

    # Copy screenshots if they exist
    if ls /tmp/verify-*.png 1> /dev/null 2>&1; then
        cp /tmp/verify-*.png "$EVIDENCE_DIR/" 2>/dev/null || true
        print_info "Screenshots copied to evidence directory"
    fi

    echo ""
    echo "Evidence directory: $EVIDENCE_DIR"
}

# ============================================
# MAIN
# ============================================

main() {
    print_header "PX1000 UNIFIED VERIFICATION"

    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "Project Directory: $PROJECT_DIR"

    # Detect project type
    PROJECT_TYPE=$(detect_project_type)
    echo "Detected Project Type: $PROJECT_TYPE"

    # Create evidence directory
    mkdir -p "$EVIDENCE_DIR"

    # Run appropriate verification suite
    case $PROJECT_TYPE in
        mobile-expo)
            verify_mobile_expo
            ;;
        mobile-rn)
            verify_mobile_expo  # Similar checks
            ;;
        web-nextjs)
            verify_web_nextjs
            ;;
        web-vite)
            verify_web_vite
            ;;
        web-react)
            verify_web_vite  # Similar checks
            ;;
        api-node)
            verify_api_node
            ;;
        api-python)
            verify_api_python
            ;;
        library-node)
            verify_library_node
            ;;
        library-python)
            verify_library_python
            ;;
        unknown)
            print_fail "Could not detect project type"
            print_info "Ensure you're running from a valid project directory"
            OVERALL_EXIT_CODE=1
            ;;
    esac

    # Collect evidence
    collect_evidence

    # Print final verdict
    print_header "FINAL VERDICT"

    echo ""
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo ""

    if [ $OVERALL_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}======================================${NC}"
        echo -e "${GREEN}  ALL VERIFICATIONS PASSED${NC}"
        echo -e "${GREEN}======================================${NC}"
        echo ""
        echo "It is now safe to claim success."
        echo ""
        echo "VERIFICATION EVIDENCE:"
        echo "- Command run: ./scripts/verify/px1000-verify.sh"
        echo "- Exit code: 0"
        echo "- Evidence dir: $EVIDENCE_DIR"
        echo "- Tests passed: $TESTS_PASSED"
    else
        echo -e "${RED}======================================${NC}"
        echo -e "${RED}  VERIFICATION FAILED${NC}"
        echo -e "${RED}======================================${NC}"
        echo ""
        echo "DO NOT claim success."
        echo "Fix the failures above and re-run verification."
        echo ""
        echo "VERIFICATION EVIDENCE:"
        echo "- Command run: ./scripts/verify/px1000-verify.sh"
        echo "- Exit code: 1"
        echo "- Evidence dir: $EVIDENCE_DIR"
        echo "- Tests failed: $TESTS_FAILED"
    fi

    echo ""

    exit $OVERALL_EXIT_CODE
}

# Run main
main
