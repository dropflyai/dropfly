# Product Requirements Document: Day Trading Signal Agent v1.0

**Owner:** Rio Allen
**Document Version:** 1.0
**Date:** 2025-11-25
**Status:** Development

---

## 1. Overview

The Day Trading Signal Agent is an automated trading-analysis system that scans real-time market conditions for a predefined universe of stocks, evaluates high-probability day trading setups, and delivers actionable trade alerts in real-time to the trader via Telegram/Discord.

**This system does NOT execute trades.**
It detects, evaluates, and delivers trade-ready signals based on a consistent ruleset.

**The goal is to support a consistent profit target of $300/day using 2–3 high-probability trades per morning session.**

---

## 2. Primary Objectives

1. Detect valid day trading setups using structured technical rules
2. Evaluate the quality of each signal using an AI reasoning layer
3. Deliver clean, actionable alerts to the trader in real-time
4. Avoid over-signaling by filtering out low-quality setups
5. Support long and put strategies
6. Standardize execution so the trader can scale and remain consistent

---

## 3. Target User

- Experienced day traders using Robinhood, Webull, Thinkorswim, or TradingView
- Traders who prefer options scalping (8–15% gains per trade)
- Users with daily performance goal of ~$300

---

## 4. Supported Tickers (v1 Launch)

The bot must track:
- **NVDA**
- **AAPL**
- **META**
- **TSLA**
- **SPY**
- **QQQ**

Future versions may allow user-defined watchlists.

---

## 5. Core System Architecture

```
TradingView Script (Pine)
        ↓
TradingView Alert via Webhook
        ↓
n8n Webhook Receiver
        ↓
Signal Normalization + Filtering (n8n Code Node)
        ↓
AI Evaluation Layer (OpenAI / ChatGPT)
        ↓
Messaging Output (Telegram/Discord)
```

---

## 6. Functional Requirements

### 6.1 TradingView Detection

TradingView must run a custom Pine Script that:

**Calculates and tracks:**
- VWAP
- EMA 9
- EMA 20
- EMA 50
- Volume + moving average
- Opening Range High (ORH) + Opening Range Low (ORL)
- Premarket High/Low
- High of Day (HOD) / Low of Day (LOD)

**Detects 7 core trading setups:**

#### LONG
1. ORB Breakout Long
2. VWAP Reclaim Long
3. EMA Trend Continuation Long
4. HOD Breakout Long

#### PUT
5. ORB Breakdown Put
6. VWAP Reject Put
7. LOD Breakdown Put

**Actions:**
- Triggers alerts only when conditions fully match
- Sends standardized JSON payload to webhook

### 6.2 Webhook Payload (from TradingView)

Each signal alert must send the following JSON:

```json
{
  "ticker": "{{ticker}}",
  "time": "{{timenow}}",
  "signal_type": "SIGNAL_XYZ",
  "price": {{close}},
  "open": {{open}},
  "high": {{high}},
  "low": {{low}},
  "close": {{close}},
  "volume": {{volume}},
  "vwap": "{{plot_0}}",
  "ema9": "{{plot_1}}",
  "ema20": "{{plot_2}}",
  "ema50": "{{plot_3}}",
  "timeframe": "{{interval}}"
}
```

### 6.3 n8n Workflow Requirements

n8n must:
1. Receive POST requests from TradingView
2. Validate and parse JSON
3. Tag metadata (e.g., trend up/down)
4. Pass the signal to an AI evaluation node
5. Format output to clean alert message
6. Send alert to Telegram/Discord channel

### 6.4 AI Evaluation Layer Requirements

AI must:
- Ingest the JSON payload from n8n
- Score each trade signal as: **HIGH**, **MEDIUM**, or **LOW**
- Determine:
  - Momentum direction
  - Trend quality
  - Volume strength
  - Risk zones
  - Likely continuation or rejection
- Output a clean, actionable summary

**AI must never:**
- Invent trades
- Guess missing data
- Add new indicators
- Recommend trades outside supported setups

---

## 7. AI Prompt Specifications

### System Prompt (exact wording)

```
You are the Trade Signal Evaluator for a day trading assistant.
You receive a JSON object representing a technical signal from TradingView.
Your job is to rate the signal's quality (HIGH, MEDIUM, LOW) based on the trader's rules:

- Price relative to VWAP
- EMA 9/20/50 alignment
- Volume strength
- Trend direction
- Candle structure
- Signal type (ORB, VWAP Reclaim, VWAP Reject, EMA Cont, HOD/LOD break)

You must output in EXACTLY this format:

TICKER – SIGNAL_TYPE – Quality: HIGH/MEDIUM/LOW
Price: X | VWAP: X | EMA9/20/50: X/X/X
Context: <brief> (e.g., strong reclaim with rising volume)
Idea: CALL / PUT / SKIP
Entry: X | Stop: X | Target: X

Do not invent trades.
If unclear, downgrade to MEDIUM or LOW.
```

---

## 8. Alert Output Requirements

Alerts must be compact, readable, and instantly actionable.

**Example:**
```
NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume.
Idea: CALL
Entry: 188.10–188.30 | Stop: below VWAP | Target: +10–15%
```

---

## 9. User Workflow

1. User receives alert via Telegram/Discord
2. User pulls up the chart
3. If quality = HIGH or strong MEDIUM → proceed
4. User enters trade in brokerage
5. Target: +10–15% profit on options
6. Max daily loss: $200
7. Max trades per day: 2–3

---

## 10. Non-Functional Requirements

### Performance
- Alerts must deliver within <1 second of TradingView trigger
- No duplicate alerts for same bar

### Reliability
- System uptime: 99%
- Must auto-recover on n8n restart

### Security
- Webhook URL must be private
- No PII stored
- API keys secured via vault

---

## 11. KPIs / Success Metrics

| Metric | Target |
|--------|--------|
| Signal Precision Rate | 65–75% |
| User Win Rate | 55–70% |
| Daily Profit Goal | $300/day average |
| False Signals | <5% of total alerts |

---

## 12. Future Enhancements (v2+)

- Add RSI/MACD filtering
- Add automated position sizing
- Add risk profile customization
- Add overnight swing detection
- Build UI dashboard (optional)
- Add broker API execution (Alpaca, Tradier)

---

## 13. Acceptance Criteria

A build is considered "complete" when:

### TradingView
- All 7 setups fire correctly
- Alerts send successfully to webhook
- JSON payload is accurate

### n8n
- Payload is parsed and validated
- AI evaluates and scores signal
- Message is delivered instantly to user

### End-to-End
- User receives correct alerts
- Alerts include entry/stop/target
- No false-trigger spam
- Performance matches KPIs

---

**End of PRD**
