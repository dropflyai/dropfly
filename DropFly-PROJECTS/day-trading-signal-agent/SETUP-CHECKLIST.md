# 🚀 Setup Checklist - Day Trading Signal Agent

**Goal:** Get your system running by end of week

---

## Pre-Requisites

### Accounts Needed
- [ ] TradingView Premium account ($15-60/month)
- [ ] n8n account (free tier OK to start)
- [ ] OpenAI account with API access
- [ ] Telegram OR Discord account

### Payment Methods
- [ ] Credit card for TradingView Premium
- [ ] Credit card for OpenAI (needs billing enabled)
- [ ] Optional: Card for n8n Pro ($20/mo) - can start free

---

## Day 1: Backend Setup (30-60 minutes)

### ✅ STEP 1: n8n Setup
- [ ] Sign up at https://n8n.io/cloud OR install locally
- [ ] Access your n8n instance
- [ ] Import workflow from: `n8n-workflows/signal-processor.json`
- [ ] Workflow imported successfully

### ✅ STEP 2: OpenAI API Key
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Create new API key
- [ ] Copy and save the key (starts with `sk-`)
- [ ] Go to https://platform.openai.com/account/billing
- [ ] Add payment method
- [ ] Set spending limit ($20/month recommended)
- [ ] Add API key to n8n "AI Signal Evaluator" node

### ✅ STEP 3: Messaging Setup

**If using Telegram:**
- [ ] Open Telegram app
- [ ] Search for @BotFather
- [ ] Send `/newbot` command
- [ ] Follow prompts to create bot
- [ ] Save bot token
- [ ] Search for @userinfobot
- [ ] Send `/start` to get your chat ID
- [ ] Save your chat ID
- [ ] Add both to n8n "Send to Telegram" node

**If using Discord:**
- [ ] Open Discord
- [ ] Create channel for signals (or use existing)
- [ ] Go to Channel Settings → Integrations
- [ ] Create new webhook
- [ ] Copy webhook URL
- [ ] Add to n8n "Send to Discord" node

### ✅ STEP 4: Activate n8n Webhook
- [ ] Click "Webhook - Receive Signal" node in n8n
- [ ] Click "Execute Node"
- [ ] Copy the webhook URL (SAVE THIS!)
- [ ] Toggle workflow to "Active"

**Your webhook URL:** ___________________________________

---

## Day 2: TradingView Setup (30 minutes)

### ✅ STEP 1: Import Pine Script
- [ ] Go to https://www.tradingview.com
- [ ] Open Pine Editor (bottom of screen)
- [ ] Click "New" → Blank indicator
- [ ] Open file: `tradingview-scripts/main-strategy.pine`
- [ ] Copy ALL contents
- [ ] Paste into Pine Editor
- [ ] Click "Save" - name it "Day Trading Signal Agent v1.0"
- [ ] Click "Add to Chart"

### ✅ STEP 2: Create Charts (Repeat for each ticker)

**Ticker 1: NVDA**
- [ ] Create new chart
- [ ] Search for "NVDA"
- [ ] Set timeframe to 1-minute
- [ ] Add "Day Trading Signal Agent v1.0" indicator
- [ ] Verify VWAP, EMAs visible

**Ticker 2: AAPL**
- [ ] Create new chart
- [ ] Search for "AAPL"
- [ ] Set timeframe to 1-minute
- [ ] Add indicator
- [ ] Verify indicators visible

**Ticker 3: META**
- [ ] Create new chart
- [ ] Search for "META"
- [ ] Set timeframe to 1-minute
- [ ] Add indicator
- [ ] Verify indicators visible

**Ticker 4: TSLA**
- [ ] Create new chart
- [ ] Search for "TSLA"
- [ ] Set timeframe to 1-minute
- [ ] Add indicator
- [ ] Verify indicators visible

**Ticker 5: SPY**
- [ ] Create new chart
- [ ] Search for "SPY"
- [ ] Set timeframe to 1-minute
- [ ] Add indicator
- [ ] Verify indicators visible

**Ticker 6: QQQ**
- [ ] Create new chart
- [ ] Search for "QQQ"
- [ ] Set timeframe to 1-minute
- [ ] Add indicator
- [ ] Verify indicators visible

### ✅ STEP 3: Create Alerts (Repeat for each ticker)

**Alert for NVDA:**
- [ ] Click Alert icon (🔔)
- [ ] Click "Create Alert"
- [ ] Condition: "Alert() function calls only"
- [ ] Enable "Once Per Bar Close"
- [ ] Paste your n8n webhook URL
- [ ] Alert name: "NVDA - Day Trading Signal"
- [ ] Click "Create"

**Alert for AAPL:**
- [ ] Same as above for AAPL

**Alert for META:**
- [ ] Same as above for META

**Alert for TSLA:**
- [ ] Same as above for TSLA

**Alert for SPY:**
- [ ] Same as above for SPY

**Alert for QQQ:**
- [ ] Same as above for QQQ

---

## Day 3: Testing (15 minutes)

### ✅ Test End-to-End

**Test 1: Send Manual Test Signal**

Run this in your terminal (replace YOUR_WEBHOOK_URL):

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

- [ ] Ran curl command
- [ ] Checked n8n execution history - shows success
- [ ] Received alert on Telegram/Discord
- [ ] Alert shows "Quality: HIGH"
- [ ] Alert formatted correctly

**Test 2: Verify All Components**
- [ ] TradingView alerts listed in alert panel
- [ ] n8n workflow shows "Active"
- [ ] Telegram/Discord bot responding
- [ ] OpenAI API working (check n8n logs)

---

## Day 4: Go Live! 🚀

### ✅ Pre-Market Prep (Before 9:30 AM ET)

**Morning Checklist:**
- [ ] Verify n8n workflow is Active
- [ ] Check all 6 TradingView alerts are active
- [ ] Send test signal to confirm working
- [ ] Open your trading broker app
- [ ] Review trading rules in `docs/TRADING-RULES.md`

### ✅ Trading Day Rules

**Remember:**
- [ ] Only trade HIGH-quality signals (first 2 weeks)
- [ ] Max 2-3 trades per day
- [ ] Position size: $800-$1,500
- [ ] Stop loss: -7% (usually tighter at VWAP)
- [ ] Take profit: +10-15%
- [ ] Max daily loss: $200 (then STOP)
- [ ] Best hours: 9:30-11:30 AM ET

### ✅ Your First Trade

**When alert arrives:**
- [ ] Read the alert (5 seconds)
- [ ] Check quality - is it HIGH?
- [ ] Open TradingView and look at chart
- [ ] Does setup look clean?
- [ ] If YES → Open broker app
- [ ] Place the trade (CALL or PUT as indicated)
- [ ] Set stop loss immediately
- [ ] Set target (+10-15%)
- [ ] Log trade in journal

---

## Week 1: Track & Learn

### ✅ Daily Routine

**Each Trading Day:**
- [ ] Pre-market: Verify system is active
- [ ] 9:30-11:30 AM: Monitor for signals
- [ ] Take only HIGH-quality trades
- [ ] Log every trade in journal
- [ ] Post-market: Review performance

**End of Week:**
- [ ] Review all trades
- [ ] Calculate win rate
- [ ] Total profit/loss
- [ ] What worked?
- [ ] What didn't?
- [ ] Adjust strategy if needed

---

## Troubleshooting

**If something doesn't work:**
- [ ] Check `docs/TROUBLESHOOTING.md`
- [ ] Check n8n execution logs
- [ ] Verify all credentials are correct
- [ ] Test each component individually

---

## Success Metrics

**After Week 1:**
- [ ] System running reliably
- [ ] Receiving 5-15 signals per day
- [ ] Trading 2-3 HIGH quality signals
- [ ] Understanding signal quality
- [ ] Following risk rules

**After Month 1:**
- [ ] 50+ signals evaluated
- [ ] 40-60 trades executed
- [ ] Win rate: 55-70%
- [ ] Profitable (even if small)
- [ ] Ready to consider iOS app

---

## Notes / Issues

**Document any problems here:**

---

**Last Updated:** 2024-11-25
**Status:** Ready to start
**Next Step:** Day 1 - Backend Setup
