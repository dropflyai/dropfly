#!/bin/bash

echo "🚀 Setting up AI TimeTrack POC..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "🔑 Setting up environment variables..."
  cp .env.example .env
  echo ""
  echo "⚠️  IMPORTANT: Please edit .env and add your OpenAI API key"
  echo "   You can get one at: https://platform.openai.com/api-keys"
  echo ""
  read -p "Press Enter to open .env file, or Ctrl+C to exit..."
  ${EDITOR:-nano} .env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure your OpenAI API key is set in .env"
echo "   2. Run: npm run test"
echo "   3. View results: npm run dashboard"
echo ""
