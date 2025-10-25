# AI TimeTrack - Proof of Concept

## Overview
This POC validates the core AI time categorization technology for AI TimeTrack Pro.

## What It Does
1. **Monitors desktop activity** - Tracks active applications and window titles
2. **AI Categorization** - Uses GPT-4 to categorize activities into clients/matters/activity types
3. **Accuracy Testing** - Measures categorization accuracy against known ground truth
4. **Dashboard** - Visualizes results and accuracy metrics

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AI Provider

**Option A: Use Gemini (Recommended - FREE!)**
```bash
# Get free API key at: https://aistudio.google.com/app/apikey
# Edit .env and add:
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

**Option B: Use OpenAI (GPT-4)**
```bash
# Get API key at: https://platform.openai.com/api-keys
# Edit .env and add:
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
```

See **[GEMINI-SETUP.md](GEMINI-SETUP.md)** for detailed Gemini setup instructions.

### 3. Run the POC

#### Option A: Test with Sample Data (Recommended First)
```bash
npm run test
```

#### Option B: Monitor Live Activity
```bash
npm run monitor
```

#### Option C: Run Dashboard
```bash
npm run dashboard
# Open http://localhost:3000
```

## Project Structure
```
AI-TimeTrack-POC/
├── src/
│   ├── activity-monitor.js       # Desktop activity tracking
│   ├── ai-categorizer.js          # GPT-4 categorization engine
│   ├── test-accuracy.js           # Accuracy measurement
│   └── dashboard.js               # Results visualization
├── data/
│   ├── sample-activities.json     # Test data
│   ├── clients-matters.json       # Sample clients/matters
│   └── results.json               # Test results
└── tests/
    └── accuracy-report.json       # Detailed accuracy report
```

## How It Works

### 1. Activity Monitoring
The activity monitor captures:
- Application name (e.g., "Microsoft Word", "Chrome")
- Window title (e.g., "Smith v. Jones - Motion to Dismiss.docx")
- Duration (time spent)
- Timestamp

### 2. AI Categorization
For each activity, GPT-4 analyzes:
- Application context
- Window title keywords
- Historical patterns
- Returns:
  - Client name
  - Matter/project name
  - Activity type (e.g., "Research", "Drafting", "Email")
  - Confidence score (0-1)
  - Suggested description

### 3. Accuracy Measurement
Compares AI predictions against ground truth:
- Client match accuracy
- Matter match accuracy
- Activity type accuracy
- Overall accuracy score
- Confidence calibration

## Success Criteria
- ✅ Overall accuracy ≥ 90%
- ✅ Client detection ≥ 95%
- ✅ Matter detection ≥ 85%
- ✅ Activity type ≥ 80%
- ✅ Processing time < 2 seconds per activity

## Next Steps After POC
1. If accuracy ≥ 90%: Proceed to MVP development
2. If accuracy 80-90%: Refine prompts and add training data
3. If accuracy < 80%: Reconsider approach or add rule-based fallbacks
