/**
 * AI Time Categorization Engine
 * Supports multiple AI providers: OpenAI (GPT-4) and Google (Gemini)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

class AICategorizer {
  constructor() {
    this.clientsMatters = null;
    this.provider = process.env.AI_PROVIDER || 'gemini'; // Default to Gemini (free tier!)
    this.model = null;
    this.client = null;

    this.initializeProvider();
  }

  /**
   * Initialize the AI provider
   */
  initializeProvider() {
    if (this.provider === 'openai') {
      const OpenAI = require('openai');
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    } else if (this.provider === 'gemini') {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = process.env.GEMINI_MODEL || 'gemini-pro'; // Fast and free!
    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Load clients and matters database
   */
  async loadClientsMatters() {
    const data = await fs.readFile(
      path.join(__dirname, '../data/clients-matters.json'),
      'utf-8'
    );
    this.clientsMatters = JSON.parse(data);
  }

  /**
   * Generate categorization prompt
   */
  generatePrompt(activity, clientsMatters) {
    const clientsList = clientsMatters.clients
      .map(client => {
        const matters = client.matters
          .map(m => `  - ${m.name} (Keywords: ${m.keywords.join(', ')})`)
          .join('\n');
        return `${client.name}:\n${matters}`;
      })
      .join('\n\n');

    const activityTypes = clientsMatters.activityTypes.join(', ');

    return `You are an AI assistant that categorizes work activities for time tracking in a professional services firm (law firm, consulting, etc.).

Given the following activity from a user's desktop:
- Application: ${activity.application}
- Window Title: ${activity.windowTitle}
- Duration: ${activity.duration} minutes
- Timestamp: ${activity.timestamp}

And the following list of clients and matters:

${clientsList}

Activity Types: ${activityTypes}

Please categorize this activity and return a JSON object with the following structure:
{
  "client": "Client Name",
  "matter": "Matter/Project Name",
  "activityType": "Activity Type from the list above",
  "description": "A concise billable description (1-2 sentences)",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why you made this categorization"
}

Guidelines:
1. Match the window title and application to the most relevant client and matter based on keywords
2. If no clear match, categorize as "Internal/Administrative" with appropriate matter
3. Confidence should be 0.0-1.0 (1.0 = completely certain)
4. Description should be professional and suitable for client billing
5. Be specific but concise
6. Consider context clues from application name and window title

Return ONLY valid JSON, no additional text.`;
  }

  /**
   * Categorize using OpenAI (GPT-4)
   */
  async categorizeWithOpenAI(prompt) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at categorizing professional work activities for time tracking and billing. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return {
      result: JSON.parse(response.choices[0].message.content),
      tokensUsed: response.usage.total_tokens
    };
  }

  /**
   * Categorize using Google Gemini
   */
  async categorizeWithGemini(prompt) {
    const model = this.client.getGenerativeModel({
      model: this.model
    });

    const systemPrompt = 'You are an expert at categorizing professional work activities for time tracking and billing. Always return valid JSON with no additional text or markdown formatting.';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.3,
      }
    });

    const response = result.response;
    const text = response.text();

    // Gemini sometimes wraps JSON in markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    return {
      result: JSON.parse(jsonText),
      tokensUsed: 0 // Gemini doesn't provide token count in same way
    };
  }

  /**
   * Categorize a single activity using selected AI provider
   */
  async categorize(activity) {
    if (!this.clientsMatters) {
      await this.loadClientsMatters();
    }

    const startTime = Date.now();

    try {
      const prompt = this.generatePrompt(activity, this.clientsMatters);

      let response;
      if (this.provider === 'openai') {
        response = await this.categorizeWithOpenAI(prompt);
      } else if (this.provider === 'gemini') {
        response = await this.categorizeWithGemini(prompt);
      }

      const processingTime = Date.now() - startTime;
      const result = response.result;

      return {
        ...result,
        processingTime,
        tokensUsed: response.tokensUsed,
        model: this.model,
        provider: this.provider
      };
    } catch (error) {
      console.error('Error categorizing activity:', error.message);
      return {
        client: 'Unknown',
        matter: 'Unknown',
        activityType: 'Unknown',
        description: 'Error during categorization',
        confidence: 0.0,
        reasoning: `Error: ${error.message}`,
        processingTime: Date.now() - startTime,
        provider: this.provider,
        error: true
      };
    }
  }

  /**
   * Categorize multiple activities in batch
   */
  async categorizeBatch(activities, onProgress = null) {
    const results = [];

    console.log(`\n🤖 Using AI Provider: ${this.provider.toUpperCase()}`);
    console.log(`📦 Model: ${this.model}\n`);

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      console.log(`\nCategorizing activity ${i + 1}/${activities.length}...`);
      console.log(`  App: ${activity.application}`);
      console.log(`  Title: ${activity.windowTitle}`);

      const result = await this.categorize(activity);

      results.push({
        activityId: activity.id,
        activity,
        prediction: result,
        groundTruth: activity.groundTruth
      });

      console.log(`  ✓ Predicted: ${result.client} - ${result.matter}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`  Processing time: ${result.processingTime}ms`);

      if (onProgress) {
        onProgress(i + 1, activities.length, result);
      }

      // Small delay to avoid rate limiting
      if (i < activities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }
}

// Export for use in other modules
module.exports = AICategorizer;

// CLI usage
if (require.main === module) {
  (async () => {
    console.log('🤖 AI Time Categorization Engine\n');

    // Load sample activity
    const sampleActivities = JSON.parse(
      await fs.readFile(path.join(__dirname, '../data/sample-activities.json'), 'utf-8')
    );

    const categorizer = new AICategorizer();

    // Test with first activity
    const testActivity = sampleActivities[0];
    console.log('Testing with sample activity:');
    console.log(`  App: ${testActivity.application}`);
    console.log(`  Title: ${testActivity.windowTitle}\n`);

    const result = await categorizer.categorize(testActivity);

    console.log('\n📊 Categorization Result:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n✅ Ground Truth:');
    console.log(JSON.stringify(testActivity.groundTruth, null, 2));

    console.log('\n📈 Match Analysis:');
    console.log(`  Client Match: ${result.client === testActivity.groundTruth.client ? '✓' : '✗'}`);
    console.log(`  Matter Match: ${result.matter === testActivity.groundTruth.matter ? '✓' : '✗'}`);
    console.log(`  Activity Type Match: ${result.activityType === testActivity.groundTruth.activityType ? '✓' : '✗'}`);
  })();
}
