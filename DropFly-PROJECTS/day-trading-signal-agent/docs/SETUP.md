# Complete Setup Guide

This guide will walk you through setting up the entire Day Trading Signal Agent system from scratch.

**Total setup time:** 1-2 hours (first time)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Checklist](#quick-start-checklist)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Testing](#testing)
5. [Going Live](#going-live)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- ✅ **TradingView** (Premium plan for webhooks)
- ✅ **n8n** (cloud or self-hosted)
- ✅ **OpenAI** (API access with billing enabled)
- ✅ **Telegram** or **Discord** (or both)

### Required Knowledge

- Basic understanding of day trading
- Familiarity with TradingView charts
- Basic JSON/API concepts (helpful but not required)

### Tools/Software

- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor (optional, for customization)
- Trading platform (Robinhood, Webull, Thinkorswim, etc.)

---

## Quick Start Checklist

Use this checklist to track your progress:

### Phase 1: Accounts & Credentials
- [ ] TradingView Premium account active
- [ ] n8n instance running (cloud or self-hosted)
- [ ] OpenAI API key created and funded
- [ ] Telegram bot created (or Discord webhook)

### Phase 2: TradingView Setup
- [ ] Pine Script imported
- [ ] Script added to 6 ticker charts (NVDA, AAPL, META, TSLA, SPY, QQQ)
- [ ] Indicators displaying correctly
- [ ] Timeframe set to 1-min or 5-min

### Phase 3: n8n Setup
- [ ] Workflow imported
- [ ] Webhook activated and URL copied
- [ ] OpenAI credentials added
- [ ] Telegram/Discord credentials configured
- [ ] Test execution successful

### Phase 4: TradingView Alerts
- [ ] Alerts created for all 6 tickers
- [ ] Webhook URL configured in alerts
- [ ] Alert conditions set correctly
- [ ] Test alert sent successfully

### Phase 5: Testing & Validation
- [ ] End-to-end test completed
- [ ] Signal received on phone
- [ ] AI evaluation looks accurate
- [ ] Message formatting is correct

### Phase 6: Live Trading
- [ ] All workflows activated
- [ ] Monitoring during first trading day
- [ ] Trading rules reviewed
- [ ] Ready to trade

---

## Step-by-Step Setup

### STEP 1: Set Up n8n (20-30 minutes)

#### Option A: n8n Cloud (Recommended for Beginners)

1. **Sign up for n8n Cloud:**
   - Go to https://n8n.io/cloud
   - Click "Start for free"
   - Create account with email

2. **Choose a plan:**
   - Free tier: 500 executions/month (good for testing)
   - Starter: $20/month (2500 executions) - recommended for live trading

3. **Access your instance:**
   - Once activated, you'll get a URL: `https://your-instance.app.n8n.cloud`
   - Bookmark this URL

#### Option B: Self-Hosted (Free, Unlimited)

**Using Docker (recommended):**

```bash
docker run -d --restart unless-stopped \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Using npm:**

```bash
npm install n8n -g
n8n start
```

Access at: http://localhost:5678

---

### STEP 2: Import n8n Workflow (5 minutes)

1. **Open n8n**

2. **Click "Workflows"** in left sidebar

3. **Click "Import from File"**

4. **Navigate to:** `n8n-workflows/signal-processor.json`

5. **Click "Import"**

6. **Workflow appears** in your workflow list

7. **Click on the workflow** to open it

---

### STEP 3: Configure OpenAI (5 minutes)

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it: "Day Trading Signal Agent"
   - Copy the key (starts with `sk-`)
   - **Save it securely** - you won't see it again

2. **Add billing (required):**
   - Go to https://platform.openai.com/account/billing
   - Add payment method
   - Set spending limit (recommend $20/month)

3. **Add to n8n:**
   - In the workflow, click **"AI Signal Evaluator"** node
   - Click "Credential to connect with"
   - Click "Create New Credential"
   - Select "OpenAI API"
   - Paste your API key
   - Click "Save"

---

### STEP 4: Configure Messaging (10-15 minutes)

Choose Telegram, Discord, or both:

#### Option A: Telegram

Follow: `../config/telegram-setup.md`

**Quick steps:**
1. Chat with @BotFather on Telegram
2. Create bot with `/newbot`
3. Save bot token
4. Get your chat ID from @userinfobot
5. Add credentials to "Send to Telegram" node in n8n

#### Option B: Discord

Follow: `../config/discord-setup.md`

**Quick steps:**
1. Create Discord server (if needed)
2. Create #trading-signals channel
3. Create webhook in channel settings
4. Copy webhook URL
5. Paste into "Send to Discord" node in n8n

#### Option C: Both (Recommended)

Set up both for redundancy. If one fails, you have a backup.

---

### STEP 5: Activate n8n Webhook (5 minutes)

1. **In n8n workflow, click the "Webhook - Receive Signal" node**

2. **Click "Execute Node"**
   - This activates the webhook
   - You'll see "Waiting for webhook call..."

3. **Copy the Webhook URL**
   - Look for "Production URL" or "Webhook URL"
   - Should look like: `https://your-n8n.app/webhook/trading-signals`
   - **Save this URL** - you'll need it for TradingView

4. **Click outside the node** to stop listening (but webhook stays active)

5. **Toggle workflow to "Active"** (top right)

---

### STEP 6: Set Up TradingView (20-30 minutes)

#### 6.1 Import Pine Script

1. **Open TradingView** (https://www.tradingview.com)

2. **Open Pine Editor** (bottom of screen)

3. **Click "New"** → "Blank indicator"

4. **Open the file:** `tradingview-scripts/main-strategy.pine`

5. **Copy all contents**

6. **Paste into Pine Editor**

7. **Click "Save"**
   - Name: "Day Trading Signal Agent v1.0"

8. **Click "Add to Chart"**

#### 6.2 Set Up Charts for Each Ticker

You need to create 6 separate charts, one for each ticker:

**Tickers:** NVDA, AAPL, META, TSLA, SPY, QQQ

**For each ticker:**

1. **Create new chart**
   - Click "Chart" → New tab
   - Or use keyboard: `Ctrl+T` (Windows) or `Cmd+T` (Mac)

2. **Search for ticker** (e.g., "NVDA")

3. **Set timeframe:**
   - Click timeframe selector
   - Choose "1" (1-minute) or "5" (5-minute)
   - **Recommended:** Start with 1-minute

4. **Set session:**
   - Chart settings (⚙️ icon)
   - Session: "Regular Trading Hours" (RTH)
   - Timezone: America/New_York (ET)

5. **Add the indicator:**
   - Click "Indicators" button
   - Search "Day Trading Signal Agent"
   - Click to add

6. **Verify indicators appear:**
   - VWAP (blue line)
   - EMAs (orange, yellow, white lines)
   - Opening range lines (green/red)

#### 6.3 Create Alerts for Each Chart

**IMPORTANT:** You must create alerts separately for EACH of the 6 tickers.

**For each chart:**

1. **Click the Alert icon** (🔔 top right)

2. **Click "Create Alert"**

3. **Configure alert:**

   **Condition:**
   - Select: "Day Trading Signal Agent v1.0"
   - Select: "Alert() function calls only"

   **Options:**
   - ✅ Once Per Bar Close (important!)
   - ✅ Show popup (optional)
   - ⬜ Play sound (optional)

   **Alert name:**
   ```
   {{ticker}} - Day Trading Signal
   ```

   **Message:**
   ```
   {{strategy.order.alert_message}}
   ```
   (This should be pre-filled)

   **Webhook URL:**
   - Paste your n8n webhook URL here
   - Example: `https://your-n8n.app/webhook/trading-signals`

4. **Click "Create"**

5. **Verify alert appears** in alerts list (right panel)

**Repeat for all 6 tickers!**

---

### STEP 7: Test End-to-End (10-15 minutes)

#### Test 1: n8n Manual Test

1. **Open n8n workflow**

2. **Click "Execute Workflow"** (top right)

3. **Open terminal or use curl to send test payload:**

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

4. **Check results:**
   - ✅ n8n execution shows success
   - ✅ AI evaluation node shows quality rating
   - ✅ Alert received on Telegram/Discord

#### Test 2: TradingView Alert Test

1. **Open one of your ticker charts** in TradingView

2. **Trigger an alert manually:**
   - Right-click on chart
   - Or wait for a real signal (during market hours)

3. **Check:**
   - ✅ TradingView shows "Alert triggered"
   - ✅ n8n execution appears in history
   - ✅ Message received on phone/Discord

#### Test 3: Live Market Test (During Trading Hours)

1. **Wait for market open** (9:30 AM ET)

2. **Monitor your charts**

3. **When a signal fires:**
   - Check TradingView alert fired
   - Check n8n execution log
   - Check message received

4. **Verify signal quality:**
   - Does the AI evaluation make sense?
   - Are entry/stop/target levels reasonable?
   - Is the quality rating (HIGH/MEDIUM/LOW) appropriate?

---

### STEP 8: Fine-Tuning (Optional)

#### Adjust Signal Sensitivity

If you're getting too many or too few signals:

**In TradingView Pine Script:**

```javascript
// Find this line:
volume_threshold = input.float(1.2, title="Volume Threshold Multiplier")

// Adjust:
// 1.2 = Normal (default)
// 1.5 = Fewer, higher-quality signals
// 1.0 = More signals, lower quality threshold
```

#### Adjust AI Strictness

**In n8n "AI Signal Evaluator" node:**

Modify the system prompt to be more or less strict. See `../ai-prompts/README.md`.

#### Filter by Quality

**In n8n "Filter Low Quality" node:**

Current: Blocks LOW, allows MEDIUM and HIGH

To only allow HIGH:
- Change condition to: `{{ $json.quality }} === 'HIGH'`

---

## Testing

### Test Checklist

Before going live, verify:

- [ ] All 6 TradingView charts have the indicator
- [ ] All 6 TradingView charts have alerts configured
- [ ] Webhook URL is correct in all alerts
- [ ] n8n workflow is Active
- [ ] Test signal received successfully
- [ ] AI evaluation is working
- [ ] Messages formatted correctly
- [ ] Notifications work on phone
- [ ] You understand the trading rules (see TRADING-RULES.md)

### Paper Trading First

**Before risking real money:**

1. Run the system for 1-2 days
2. Track signals in a spreadsheet
3. "Paper trade" each signal
4. Verify signal quality matches AI ratings
5. Ensure you're comfortable with the system

---

## Going Live

### Day 1: Cautious Approach

1. **Start with 1-2 trades max**
2. **Only trade HIGH-quality signals**
3. **Use smaller position size** (50% of normal)
4. **Manually verify each setup** before entering
5. **Strict stop loss** (no exceptions)

### Week 1: Build Confidence

1. Gradually increase to 2-3 trades/day
2. Track all trades in journal
3. Review what works, what doesn't
4. Adjust rules as needed

### Month 1: Optimize

1. Identify best signal types for your style
2. Refine entry/exit strategies
3. Build consistency
4. Scale up position size cautiously

---

## Troubleshooting

### No Signals Appearing

**Check:**
- Market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
- Alerts are active in TradingView
- Workflow is Active in n8n
- Tickers are volatile enough (signals require movement)

**During low volatility, signals may be rare. This is normal.**

### Signals Not Reaching Phone

**Check:**
- n8n workflow execution history (did it run?)
- Telegram/Discord credentials in n8n
- Phone notifications enabled
- Internet connection

### Too Many Signals

**Solutions:**
- Increase volume threshold in Pine Script
- Only trade during peak hours (9:30-11:30 AM)
- Increase AI strictness
- Only act on HIGH-quality signals

### Signal Quality Seems Off

**Solutions:**
- Review AI evaluation rules
- Adjust system prompt
- Paper trade to validate before adjusting
- Remember: Not all signals will be winners

### For detailed troubleshooting, see `TROUBLESHOOTING.md`

---

## Costs Summary

| Component | Cost |
|-----------|------|
| TradingView Premium | $15-60/month |
| n8n Cloud (Starter) | $20/month |
| n8n Self-Hosted | Free |
| OpenAI API (GPT-4) | ~$15/month |
| Telegram | Free |
| Discord | Free |
| **Total (cloud)** | **~$50-95/month** |
| **Total (self-hosted)** | **~$30-75/month** |

**ROI:** If the system helps you make $300/day consistently, the ROI is enormous.

---

## Next Steps

✅ Setup complete!

**Now:**
1. Review `TRADING-RULES.md` - Critical for success
2. Paper trade for 1-2 days
3. Start with small positions
4. Build confidence gradually
5. Scale up slowly

**Remember:** This system provides signals. You make the trading decisions. Always manage risk properly.

---

## Support Resources

- **Project Documentation:** All docs in `docs/` folder
- **TradingView Help:** `tradingview-scripts/README.md`
- **n8n Help:** `n8n-workflows/README.md`
- **AI Prompts:** `ai-prompts/README.md`
- **Config Help:** `config/` folder

## Getting Help

If you encounter issues:

1. Check `TROUBLESHOOTING.md` first
2. Review the specific README for that component
3. Check n8n execution logs for errors
4. Verify all credentials and URLs
5. Test each component individually

Good luck with your trading! 🚀
