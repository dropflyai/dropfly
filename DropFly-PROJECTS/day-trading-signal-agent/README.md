# Day Trading Signal Agent v1.0

**Owner:** Rio Allen
**Status:** Development
**Goal:** Automated day trading signal detection and delivery system targeting $300/day profit

## Overview

The Day Trading Signal Agent is an automated trading-analysis system that:
- Scans real-time market conditions for predefined stocks
- Evaluates high-probability day trading setups
- Delivers actionable trade alerts via Telegram/Discord
- **Does NOT execute trades** - signals only

## Supported Tickers (v1)

- NVDA
- AAPL
- META
- TSLA
- SPY
- QQQ

## System Architecture

```
TradingView (Pine Script)
        ↓
Webhook (JSON payload)
        ↓
n8n Workflow (Processing)
        ↓
AI Evaluation (OpenAI)
        ↓
Messaging (Telegram/Discord)
        ↓
Trader (You)
```

## Trading Signals (7 Core Setups)

### LONG Setups
1. **ORB Breakout Long** - Opening range breakout above
2. **VWAP Reclaim Long** - Price reclaims VWAP with volume
3. **EMA Trend Continuation Long** - EMA alignment trend follow
4. **HOD Breakout Long** - High of day breakout

### PUT Setups
5. **ORB Breakdown Put** - Opening range breakdown below
6. **VWAP Reject Put** - Price rejects VWAP downward
7. **LOD Break Put** - Low of day breakdown

## Key Indicators

- VWAP (institutional level)
- EMA 9 (momentum)
- EMA 20 (trend)
- EMA 50 (trend alignment)
- Volume (confirmation)
- HOD/LOD levels
- Premarket High/Low
- Opening Range High/Low

## Project Structure

```
day-trading-signal-agent/
├── README.md                 # This file
├── PRD.md                    # Full Product Requirements Document
├── tradingview-scripts/      # Pine Script indicators and strategies
│   ├── main-strategy.pine    # Complete 7-signal strategy
│   ├── indicators.pine       # Core indicators (VWAP, EMAs, etc)
│   └── README.md            # TradingView setup guide
├── n8n-workflows/           # n8n automation workflows
│   ├── signal-processor.json # Main workflow export
│   ├── webhook-handler.json  # Webhook receiver
│   └── README.md            # n8n setup guide
├── ai-prompts/              # AI evaluation prompts
│   ├── system-prompt.txt    # Core system prompt
│   ├── evaluation-rules.md  # Signal evaluation criteria
│   └── README.md            # AI setup guide
├── config/                  # Configuration templates
│   ├── .env.example         # Environment variables template
│   ├── telegram-setup.md    # Telegram bot setup
│   └── discord-setup.md     # Discord bot setup
├── docs/                    # Documentation
│   ├── SETUP.md            # Complete setup guide
│   ├── TRADING-RULES.md    # Trading execution rules
│   └── TROUBLESHOOTING.md  # Common issues and fixes
└── tests/                   # Testing scenarios
    ├── test-payloads.json   # Sample webhook payloads
    └── signal-examples.md   # Expected signal outputs
```

## Quick Start

### 1. Prerequisites
- TradingView account (Premium for webhooks)
- n8n instance (cloud or self-hosted)
- OpenAI API key
- Telegram bot token OR Discord webhook URL

### 2. Setup Steps

1. **TradingView Setup**
   - Import Pine Script from `tradingview-scripts/`
   - Apply to each ticker chart (NVDA, AAPL, META, TSLA, SPY, QQQ)
   - Configure alerts with webhook URL

2. **n8n Setup**
   - Import workflow from `n8n-workflows/`
   - Configure webhook endpoint
   - Add OpenAI credentials
   - Add Telegram/Discord credentials

3. **Testing**
   - Send test payloads from `tests/test-payloads.json`
   - Verify alerts reach your device
   - Check AI evaluation quality

4. **Go Live**
   - Enable TradingView alerts during market hours
   - Monitor first signals manually
   - Trade only HIGH-quality signals

## Trading Rules (Critical)

- **Max Trades Per Day:** 2-3
- **Position Size:** $800-$1,500 per trade
- **Stop Loss:** -7%
- **Take Profit:** +10-15%
- **Max Daily Loss:** $200
- **Only Trade:** HIGH-quality signals (occasionally strong MEDIUM)
- **Target:** $300/day average

## Signal Quality Levels

- **HIGH:** All criteria aligned, strong volume, clear trend
- **MEDIUM:** Most criteria met, acceptable setup
- **LOW:** Skip - weak setup, conflicting signals

## Alert Format Example

```
NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume and EMA alignment.
Idea: CALL
Entry: 188.10–188.30 | Stop: below VWAP | Target: +10–15%
```

## Success Metrics (KPIs)

- **Signal Precision Rate:** 65-75% (HIGH-quality signals that trend correctly)
- **Win Rate:** 55-70% (when following rules)
- **Daily Profit Target:** $300/day
- **False Signals:** <5% of total alerts

## Future Enhancements (v2+)

- RSI/MACD filtering
- Automated position sizing
- Risk profile customization
- Overnight swing detection
- UI dashboard
- Broker API execution (Alpaca, Tradier)

## Support & Documentation

- See `docs/SETUP.md` for detailed setup instructions
- See `docs/TRADING-RULES.md` for execution guidelines
- See `docs/TROUBLESHOOTING.md` for common issues

## Version History

- **v1.0** - Initial release with 7 core signals

---

**Disclaimer:** This system provides trading signals only. All trading decisions and executions are your responsibility. Past performance does not guarantee future results.
