// 🔒 MANDATORY API CALL LOGGING SYSTEM
// This system MUST be used for ALL external API calls

const fs = require('fs');
const path = require('path');

class APICallLogger {
    constructor() {
        this.logFile = path.join(__dirname, 'API-CALL-LOG.json');
        this.initializeLog();
    }

    initializeLog() {
        if (!fs.existsSync(this.logFile)) {
            const initialLog = {
                created: new Date().toISOString(),
                version: "1.0.0",
                calls: []
            };
            fs.writeFileSync(this.logFile, JSON.stringify(initialLog, null, 2));
        }
    }

    logAPICall(apiDetails) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
            time: new Date().toTimeString(),
            id: this.generateCallId(),
            ...apiDetails
        };

        const logData = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
        logData.calls.push(logEntry);
        
        fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
        
        // Also log to console for immediate visibility
        console.log('🔴 API CALL LOGGED:', logEntry);
        
        return logEntry.id;
    }

    generateCallId() {
        return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // MANDATORY: Log OpenAI API calls
    logOpenAICall(endpoint, model, prompt, response, files = []) {
        return this.logAPICall({
            service: 'OpenAI',
            endpoint: endpoint,
            model: model,
            prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
            response_type: typeof response,
            response_size: JSON.stringify(response).length,
            files_created: files,
            cost_estimate: this.estimateOpenAICost(model, prompt, response)
        });
    }

    // MANDATORY: Log image generation
    logImageGeneration(service, prompt, imageUrls, savedPaths, settings = {}) {
        return this.logAPICall({
            service: service,
            type: 'image_generation',
            prompt: prompt,
            images_generated: imageUrls.length,
            image_urls: imageUrls,
            saved_to: savedPaths,
            settings: settings,
            total_files: savedPaths.length
        });
    }

    // MANDATORY: Log Claude API calls  
    logClaudeCall(endpoint, model, messages, response, files = []) {
        return this.logAPICall({
            service: 'Claude/Anthropic',
            endpoint: endpoint,
            model: model,
            message_count: messages.length,
            response_tokens: response.length || 0,
            files_created: files
        });
    }

    // MANDATORY: Log any external API call
    logExternalAPI(serviceName, endpoint, request, response, files = []) {
        return this.logAPICall({
            service: serviceName,
            endpoint: endpoint,
            request_type: typeof request,
            response_type: typeof response,
            files_created: files,
            external_service: true
        });
    }

    estimateOpenAICost(model, prompt, response) {
        // Rough cost estimation (update with current pricing)
        const rates = {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'dall-e-3': { per_image: 0.040 },
            'dall-e-2': { per_image: 0.020 }
        };
        
        const rate = rates[model] || { input: 0.01, output: 0.01 };
        
        if (model.includes('dall-e')) {
            return `~$${rate.per_image} per image`;
        }
        
        const inputTokens = Math.ceil(prompt.length / 4);
        const outputTokens = Math.ceil(JSON.stringify(response).length / 4);
        
        const cost = (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
        return `~$${cost.toFixed(4)}`;
    }

    // Get recent API calls
    getRecentCalls(hours = 24) {
        const logData = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
        const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        return logData.calls.filter(call => new Date(call.timestamp) > cutoff);
    }

    // Get daily summary
    getDailySummary(date = new Date().toDateString()) {
        const logData = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
        const dayCalls = logData.calls.filter(call => call.date === date);
        
        const summary = {
            date: date,
            total_calls: dayCalls.length,
            by_service: {},
            images_generated: 0,
            files_created: []
        };
        
        dayCalls.forEach(call => {
            summary.by_service[call.service] = (summary.by_service[call.service] || 0) + 1;
            
            if (call.type === 'image_generation') {
                summary.images_generated += call.images_generated || 0;
            }
            
            if (call.files_created) {
                summary.files_created.push(...call.files_created);
            }
        });
        
        return summary;
    }
}

// Export singleton instance
const apiLogger = new APICallLogger();

// MANDATORY WRAPPER FUNCTIONS
const loggedOpenAI = {
    async createImage(prompt, options = {}) {
        const startTime = Date.now();
        try {
            // Actual OpenAI call would go here
            const response = await openai.images.generate({
                prompt: prompt,
                ...options
            });
            
            const imageUrls = response.data.map(img => img.url);
            const savedPaths = []; // Would be populated with actual save paths
            
            apiLogger.logImageGeneration('OpenAI DALL-E', prompt, imageUrls, savedPaths, options);
            
            return response;
        } catch (error) {
            apiLogger.logAPICall({
                service: 'OpenAI',
                type: 'error',
                prompt: prompt,
                error: error.message,
                duration: Date.now() - startTime
            });
            throw error;
        }
    },

    async createChatCompletion(messages, options = {}) {
        const startTime = Date.now();
        try {
            // Actual OpenAI call would go here
            const response = await openai.chat.completions.create({
                messages: messages,
                ...options
            });
            
            apiLogger.logOpenAICall('chat/completions', options.model, 
                JSON.stringify(messages), response);
            
            return response;
        } catch (error) {
            apiLogger.logAPICall({
                service: 'OpenAI',
                type: 'error',
                messages: messages,
                error: error.message,
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
};

module.exports = {
    APICallLogger,
    apiLogger,
    loggedOpenAI
};

// USAGE EXAMPLES:
/*
// For image generation:
const images = await loggedOpenAI.createImage("A futuristic website dashboard", {
    n: 3,
    size: "1024x1024"
});

// For manual logging:
apiLogger.logImageGeneration(
    'OpenAI DALL-E 3',
    'Product mockup for LeadFly dashboard',
    ['url1', 'url2', 'url3'],
    ['/path/to/image1.png', '/path/to/image2.png'],
    { size: '1024x1024', quality: 'hd' }
);

// For external API logging:
apiLogger.logExternalAPI(
    'Unsplash',
    '/photos/search',
    { query: 'business dashboard' },
    responseData,
    ['/saved/image1.jpg', '/saved/image2.jpg']
);

// Get today's summary:
console.log(apiLogger.getDailySummary());
*/