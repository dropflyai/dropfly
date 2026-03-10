#!/bin/bash
#
# X2000 Quick Install Script
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/x2000/main/install.sh | bash
#
# Or locally:
#   ./install.sh
#

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                           X2000 INSTALLER                                 ║"
echo "║              Autonomous AI Fleet · 46 Specialized Brains                  ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo ""
    echo "Install Node.js:"
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt install nodejs npm"
    echo "  Windows: Download from https://nodejs.org"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required (found v$NODE_VERSION)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✓ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build
echo ""
echo "🔨 Building X2000..."
npm run build

# Check for LLM providers
echo ""
echo "🔍 Checking LLM providers..."

HAS_PROVIDER=false

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "✓ Anthropic API key found"
    HAS_PROVIDER=true
fi

if [ -n "$OPENAI_API_KEY" ]; then
    echo "✓ OpenAI API key found"
    HAS_PROVIDER=true
fi

if command -v ollama &> /dev/null; then
    echo "✓ Ollama detected"
    HAS_PROVIDER=true
fi

if [ "$HAS_PROVIDER" = false ]; then
    echo ""
    echo "⚠️  No LLM provider detected. X2000 needs at least one:"
    echo ""
    echo "   Option 1: Anthropic (Claude)"
    echo "   export ANTHROPIC_API_KEY=your_key_here"
    echo ""
    echo "   Option 2: OpenAI (GPT-4)"
    echo "   export OPENAI_API_KEY=your_key_here"
    echo ""
    echo "   Option 3: Ollama (Local, free)"
    echo "   brew install ollama && ollama pull llama3.2 && ollama serve"
    echo ""
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# X2000 Configuration
# Add your LLM provider API key(s):

# Anthropic (Claude) - Recommended
# ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT-4)
# OPENAI_API_KEY=sk-...

# For local models, just run: ollama serve
EOF
    echo "✓ Created .env file (edit to add your API keys)"
fi

# Link CLI globally (optional)
echo ""
read -p "🔗 Install x2000 command globally? [y/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm link
    echo "✓ x2000 command installed globally"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ X2000 installed successfully!"
echo ""
echo "Quick Start:"
echo "  npm start                          # Launch X2000"
echo "  npm run x2000 \"build an API\"       # Run a task"
echo "  npm run x2000 -- -i                # Interactive mode"
echo ""
echo "Or if installed globally:"
echo "  x2000 \"your task here\""
echo "  x2000 -i"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
