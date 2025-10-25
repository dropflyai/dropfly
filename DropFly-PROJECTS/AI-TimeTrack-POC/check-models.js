require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('🔍 Checking available Gemini models with your API key...\n');

    // Try to list models
    const models = await genAI.listModels();

    console.log('✅ Available models:');
    for await (const model of models) {
      console.log(`  - ${model.name}`);
      console.log(`    Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('\n💡 This suggests the API key might have restrictions or the API endpoint is different.');
    console.log('   Try creating a new API key at: https://aistudio.google.com/app/apikey');
  }
}

listModels();
