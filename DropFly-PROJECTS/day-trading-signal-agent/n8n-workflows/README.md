# n8n Workflow Configuration

This directory contains the n8n workflow that processes trading signals from TradingView and sends evaluated alerts.

## Files

- **signal-processor.json** - Complete workflow for signal processing, AI evaluation, and messaging

## Workflow Overview

```
1. Webhook Trigger (receives TradingView alerts)
        ↓
2. Validate & Enrich Data (parse JSON, add metadata)
        ↓
3. AI Signal Evaluator (OpenAI GPT-4 evaluation)
        ↓
4. Format Alert Message (create readable alert)
        ↓
5. Filter Low Quality (skip LOW-quality signals)
        ↓
6. Send to Telegram/Discord (deliver alert)
        ↓
7. Log Signal (analytics tracking)
```

## Prerequisites

### 1. n8n Instance

You need an n8n instance. Choose one:

**Option A: n8n Cloud (Recommended for beginners)**
- Sign up at https://n8n.io/cloud
- Free tier available (500 executions/month)
- No setup required

**Option B: Self-Hosted (Free, unlimited)**
- Install via Docker: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
- Or npm: `npm install n8n -g && n8n`
- Access at http://localhost:5678

### 2. Required Credentials

You'll need:
- **OpenAI API Key** (for GPT-4 evaluation)
- **Telegram Bot Token** (if using Telegram)
- **Discord Webhook URL** (if using Discord)

See `../config/` directory for setup guides.

## Setup Instructions

### Step 1: Import Workflow

1. Open your n8n instance
2. Click **"Workflows"** → **"Import from File"**
3. Select `signal-processor.json`
4. Click **"Import"**

### Step 2: Configure Webhook

1. Click the **"Webhook - Receive Signal"** node
2. Note the **Webhook URL** (e.g., `https://your-n8n.app/webhook/trading-signals`)
3. **Important:** Copy this URL - you'll need it for TradingView alerts
4. Set **HTTP Method** to `POST`
5. Set **Path** to `trading-signals` (or customize)
6. Click **"Execute Node"** to activate

### Step 3: Add OpenAI Credentials

1. Click the **"AI Signal Evaluator"** node
2. Click **"Create New Credential"**
3. Select **"OpenAI API"**
4. Enter your OpenAI API key
5. Click **"Save"**
6. Select the credential in the node

**Get OpenAI API Key:**
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy and save securely

### Step 4: Configure Messaging

Choose Telegram, Discord, or both:

#### Option A: Telegram

1. Click the **"Send to Telegram"** node
2. Add **Telegram credentials:**
   - Create a bot via @BotFather on Telegram
   - Get your bot token
   - Get your chat ID (use @userinfobot)
3. Enter **Chat ID** in the node
4. Save

See `../config/telegram-setup.md` for detailed instructions.

#### Option B: Discord

1. Click the **"Send to Discord"** node
2. Enter your **Discord Webhook URL:**
   - Go to your Discord server
   - Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Copy the webhook URL
3. Paste into the node
4. Save

See `../config/discord-setup.md` for detailed instructions.

#### Option C: Both

Keep both nodes connected. Alerts will go to both platforms.

### Step 5: Test the Workflow

1. Click **"Execute Workflow"** (top right)
2. Send a test payload using curl:

```bash
curl -X POST https://your-n8n.app/webhook/trading-signals \
  -H "Content-Type: application/json" \
  -d '{
    "signal": "VWAP_RECLAIM_LONG",
    "ticker": "NVDA",
    "time": "1732546200000",
    "price": 188.45,
    "open": 188.20,
    "high": 188.55,
    "low": 188.15,
    "close": 188.45,
    "volume": 1250000,
    "vwap": 187.90,
    "ema9": 188.10,
    "ema20": 187.70,
    "ema50": 186.90,
    "timeframe": "1"
  }'
```

3. Check:
   - Workflow executes successfully
   - AI evaluation appears
   - Alert arrives on Telegram/Discord

### Step 6: Activate Workflow

1. Click **"Active"** toggle (top right)
2. Workflow is now live and listening for signals

## Workflow Nodes Explained

### 1. Webhook - Receive Signal
- **Purpose:** Receives POST requests from TradingView
- **Output:** Raw JSON payload

### 2. Validate & Enrich Data
- **Purpose:** Parse, validate, and add metadata
- **Actions:**
  - Validates required fields
  - Converts strings to numbers
  - Calculates trend direction
  - Determines price vs VWAP relationship
  - Calculates percentage differences
- **Output:** Enriched signal data

### 3. AI Signal Evaluator
- **Purpose:** Evaluate signal quality using GPT-4
- **Model:** GPT-4 Turbo Preview
- **Temperature:** 0.3 (focused, consistent)
- **Output:** Structured evaluation with quality rating

### 4. Format Alert Message
- **Purpose:** Create clean, readable alert
- **Actions:**
  - Extracts quality level
  - Formats message with emojis
  - Adds timestamp and trading rules
- **Output:** Formatted alert string

### 5. Filter Low Quality
- **Purpose:** Block LOW-quality signals
- **Logic:** Only passes HIGH and MEDIUM signals
- **Output:** Filtered signals only

### 6. Send to Telegram/Discord
- **Purpose:** Deliver alert to trader
- **Platforms:** Telegram and/or Discord
- **Format:** Markdown-formatted message

### 7. Log Signal
- **Purpose:** Track signals for analytics
- **Output:** Console log for monitoring

## Customization

### Adjust AI Model

In the **"AI Signal Evaluator"** node:
- Change `model` to `gpt-4`, `gpt-3.5-turbo`, etc.
- Adjust `temperature` (0.0 = deterministic, 1.0 = creative)

### Change Quality Filter

In the **"Filter Low Quality"** node:
- Current: Blocks LOW, allows MEDIUM and HIGH
- To only allow HIGH: Change condition to `{{ $json.quality }} === 'HIGH'`
- To allow all: Remove this node entirely

### Add Database Logging

Add a new node after "Format Alert Message":
- **MongoDB** - Store signals in database
- **Google Sheets** - Log to spreadsheet
- **Postgres** - Relational database storage

### Add Notifications for HIGH Only

Duplicate the filter node:
1. Create "Filter HIGH Quality" node
2. Condition: `{{ $json.quality }} === 'HIGH'`
3. Connect to a separate Telegram channel
4. Send urgent notifications for HIGH-quality only

## Monitoring & Debugging

### View Executions

1. Go to **"Executions"** tab
2. See all workflow runs
3. Click any execution to see:
   - Input data
   - Node outputs
   - Errors (if any)

### Check Webhook URL

1. Click **"Webhook - Receive Signal"** node
2. Click **"Test step"**
3. Copy the test URL
4. Verify it matches your TradingView alerts

### Test Individual Nodes

1. Click any node
2. Click **"Execute Node"**
3. View output in the panel

### Common Issues

**Webhook not receiving data:**
- Verify webhook is activated (click "Execute Node")
- Check TradingView alert is sending to correct URL
- Verify n8n is running and accessible

**OpenAI errors:**
- Check API key is valid
- Ensure you have credits/billing enabled
- Verify model name is correct

**No alerts arriving:**
- Check "Filter Low Quality" isn't blocking all signals
- Verify Telegram/Discord credentials
- Test messaging nodes individually

## Performance

### Expected Processing Time
- Total latency: **< 2 seconds**
  - Webhook receipt: < 100ms
  - Data processing: < 100ms
  - AI evaluation: 1-2 seconds
  - Messaging: < 500ms

### Rate Limits
- OpenAI: ~3 requests/second (depending on tier)
- Telegram: 30 messages/second
- Discord: No practical limit for trading signals

### Cost Estimates

**OpenAI (GPT-4 Turbo):**
- ~$0.01 per signal evaluation
- 50 signals/day = ~$0.50/day = ~$15/month

**n8n Cloud:**
- Free tier: 500 executions/month
- Starter: $20/month (2500 executions)
- Self-hosted: Free (unlimited)

## Security Best Practices

1. **Keep webhook URL private** - Don't share publicly
2. **Use HTTPS** - Required for production
3. **Store credentials securely** - Use n8n credential manager
4. **Enable authentication** - Add API key validation if needed
5. **Monitor executions** - Watch for suspicious activity

## Next Steps

After n8n is configured:
1. Update TradingView alerts with webhook URL
2. Test end-to-end flow with live market data
3. Monitor signal quality and adjust filters
4. Review AI evaluations for accuracy

---

**Need Help?**
- n8n Docs: https://docs.n8n.io
- Community: https://community.n8n.io
- Discord: https://discord.gg/n8n
