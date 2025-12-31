# 🔒 MANDATORY API CALL LOGGING - USAGE INSTRUCTIONS

## Quick Start

The API-CALL-LOGGER.js file is now deployed to ALL project directories. Use it for EVERY external API call.

### Basic Usage

```javascript
const { apiLogger, loggedOpenAI } = require('./API-CALL-LOGGER.js');

// For OpenAI image generation (MANDATORY)
const images = await loggedOpenAI.createImage("A professional dashboard design", {
    n: 3,
    size: "1024x1024"
});

// For manual logging of any external API
apiLogger.logExternalAPI(
    'Service Name',
    '/api/endpoint', 
    requestData,
    responseData,
    ['/path/to/created/file1.png', '/path/to/created/file2.jpg']
);
```

### Image Generation Logging

```javascript
// When saving images from any source
apiLogger.logImageGeneration(
    'OpenAI DALL-E 3',
    'Professional website mockup for client',
    ['https://url1.png', 'https://url2.png'],
    ['/saved/path1.png', '/saved/path2.png'],
    { size: '1024x1024', quality: 'hd' }
);
```

### View Logs

```javascript
// Get today's summary
console.log(apiLogger.getDailySummary());

// Get recent calls (last 24 hours)
console.log(apiLogger.getRecentCalls(24));
```

## 🚨 MANDATORY RULES

1. **EVERY external API call must be logged**
2. **Include file paths where content is saved**
3. **Log BEFORE making the API call when possible**
4. **Use wrapper functions for OpenAI calls**

## File Locations

- **Log File**: `API-CALL-LOG.json` (automatically created)
- **Logger**: `API-CALL-LOGGER.js` (in every project root)

## Cost Tracking

The system automatically estimates costs for:
- OpenAI GPT models
- DALL-E image generation
- Claude API calls

All costs and usage are tracked with timestamps for billing analysis.