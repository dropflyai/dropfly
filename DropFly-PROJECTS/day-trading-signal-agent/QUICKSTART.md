# Quick Start Guide

**Get your Day Trading Signal Agent up and running in under 30 minutes.**

---

## 1. Prerequisites Check (5 minutes)

Before starting, ensure you have:

- [ ] TradingView **Premium** account (required for webhooks)
- [ ] n8n account (cloud or self-hosted)
- [ ] OpenAI API key with billing enabled
- [ ] Telegram account OR Discord account

**Don't have these yet?** See `docs/SETUP.md` for account creation guides.

---

## 2. Set Up n8n (10 minutes)

### Step 1: Import Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select: `n8n-workflows/signal-processor.json`
4. Click **Import**

### Step 2: Add Credentials

**OpenAI:**
1. Click "AI Signal Evaluator" node
2. Add credentials → Paste your OpenAI API key
3. Save

**Telegram OR Discord:**

**For Telegram:**
1. Create bot with @BotFather on Telegram
2. Get your chat ID from @userinfobot
3. Add to "Send to Telegram" node

**For Discord:**
1. Create webhook in your Discord channel
2. Copy webhook URL
3. Paste into "Send to Discord" node

### Step 3: Activate Webhook

1. Click "Webhook - Receive Signal" node
2. Click **Execute Node**
3. **Copy the webhook URL** (save it!)
4. Toggle workflow to **Active**

---

## 3. Set Up TradingView (10 minutes)

### Step 1: Import Pine Script

1. Open TradingView Pine Editor
2. Create new indicator
3. Copy contents of: `tradingview-scripts/main-strategy.pine`
4. Paste and **Save** as "Day Trading Signal Agent v1.0"

### Step 2: Add to Charts

**For each ticker (NVDA, AAPL, META, TSLA, SPY, QQQ):**

1. Create chart for ticker
2. Set timeframe to **1-minute**
3. Add your "Day Trading Signal Agent v1.0" indicator
4. Verify VWAP and EMAs appear

### Step 3: Create Alerts

**For each of the 6 charts:**

1. Click Alert icon (🔔)
2. Click **Create Alert**
3. Condition: "Alert() function calls only"
4. Enable: "Once Per Bar Close"
5. **Webhook URL:** Paste your n8n webhook URL
6. Click **Create**

**You should now have 6 alerts (one per ticker).**

---

## 4. Test the System (5 minutes)

### Send Test Signal

Run this command (replace `YOUR_WEBHOOK_URL`):

```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "signal": "VWAP_RECLAIM_LONG",
    "ticker": "NVDA",
    "time": "1732546200000",
    "price": 188.20,
    "open": 188.00,
    "high": 188.55,
    "low": 187.85,
    "close": 188.20,
    "volume": 1250000,
    "vwap": 187.90,
    "ema9": 188.10,
    "ema20": 187.70,
    "ema50": 186.90,
    "timeframe": "1"
  }'
```

### Verify Results

✅ Check n8n execution history (should show success)
✅ Check Telegram/Discord (should receive alert)
✅ Alert should show "Quality: HIGH"

**If all checks pass → System is working!**

---

## 5. Go Live

### Pre-Market Checklist

Before market open (9:30 AM ET):

- [ ] Verify n8n workflow is **Active**
- [ ] Check all 6 TradingView alerts are active
- [ ] Send test signal to confirm system works
- [ ] Review trading rules (see `docs/TRADING-RULES.md`)

### First Trading Day

**Important:**
1. **Start small** - Only trade 1-2 signals
2. **Only trade HIGH quality** signals
3. **Verify each setup manually** before entering
4. **Follow stop loss rules** (no exceptions)

### Your First Trade

When you receive a signal:

1. **Check quality rating** - Must be HIGH
2. **Pull up the chart** - Verify setup looks clean
3. **Check the time** - Best: 9:30-11:30 AM ET
4. **Enter the trade** per the entry price
5. **Set stop loss** immediately (below VWAP for LONG)
6. **Take profit** at +10-15%
7. **Log the trade** in your journal

---

## Critical Trading Rules

**Remember these at all times:**

1. ✅ **ONLY trade HIGH-quality signals** (first month)
2. ✅ **Max 2-3 trades per day**
3. ✅ **Position size: $800-$1,500**
4. ✅ **Stop loss: -7% maximum** (usually tighter at VWAP)
5. ✅ **Take profit: +10-15%**
6. ✅ **Max daily loss: $200** (then STOP)
7. ✅ **Best trading hours: 9:30-11:30 AM ET**

**See `docs/TRADING-RULES.md` for complete rules.**

---

## Troubleshooting Quick Fixes

### No signals appearing?
- Check market hours (9:30 AM - 4:00 PM ET)
- Verify n8n workflow is Active
- Check TradingView alerts are active

### Alerts not reaching phone?
- Test n8n manually with curl command above
- Check Telegram/Discord credentials
- Verify phone notifications enabled

### Wrong quality ratings?
- System may need AI prompt tuning
- Paper trade first to validate
- See `ai-prompts/README.md` for adjustments

**Full troubleshooting:** See `docs/TROUBLESHOOTING.md`

---

## Next Steps

✅ **System is now live!**

**Day 1-2:** Paper trade to build confidence
**Week 1:** Start with small positions, track all trades
**Month 1:** Build consistency, refine your execution
**Month 2+:** Scale up position size carefully

---

## Important Resources

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `PRD.md` | Full requirements |
| `docs/SETUP.md` | Detailed setup guide |
| `docs/TRADING-RULES.md` | **Critical - Read this!** |
| `docs/TROUBLESHOOTING.md` | Fix issues |
| `tradingview-scripts/README.md` | TradingView help |
| `n8n-workflows/README.md` | n8n help |
| `ai-prompts/README.md` | AI customization |
| `tests/signal-examples.md` | What to expect |

---

## System Architecture Reminder

```
TradingView (Pine Script)
        ↓
Webhook (JSON payload)
        ↓
n8n (Processing & AI)
        ↓
Telegram/Discord
        ↓
You (Make trading decision)
```

---

## Support

If you get stuck:

1. Check `docs/TROUBLESHOOTING.md` first
2. Review component-specific READMEs
3. Check n8n execution logs for errors
4. Test each component individually

---

## Final Reminders

📌 **This system gives signals, YOU make decisions**
📌 **Always manage risk properly**
📌 **Never risk more than you can afford to lose**
📌 **Follow the trading rules consistently**
📌 **Journal every trade**
📌 **Be patient - quality over quantity**

---

**You're ready! Good luck with your trading! 🚀**

Target: $300/day | Win Rate: 65%+ | Signals: 2-3 per day

**Trade smart. Trade safe. Trade profitably.**
