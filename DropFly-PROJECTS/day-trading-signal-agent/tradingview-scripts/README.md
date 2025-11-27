# TradingView Pine Scripts

This directory contains the Pine Script indicators and strategies for the Day Trading Signal Agent.

## Files

- **main-strategy.pine** - Complete 7-signal detection strategy with all indicators

## Setup Instructions

### 1. Import the Script to TradingView

1. Open TradingView and go to the Pine Editor (bottom panel)
2. Click "New" → "New blank indicator"
3. Copy the entire contents of `main-strategy.pine`
4. Paste into the editor
5. Click "Save" and name it "Day Trading Signal Agent v1.0"
6. Click "Add to Chart"

### 2. Apply to Each Ticker

You need to add this script to **6 separate charts**, one for each ticker:

- NVDA
- AAPL
- META
- TSLA
- SPY
- QQQ

**For each ticker:**
1. Open a new chart
2. Set timeframe to **1-minute** or **5-minute** (recommended)
3. Add the "Day Trading Signal Agent v1.0" indicator
4. The indicator will automatically calculate and display signals

### 3. Configure Chart Settings

**Recommended settings:**
- **Timeframe:** 1-min or 5-min
- **Session:** Regular Trading Hours (9:30 AM - 4:00 PM ET)
- **Extended Hours:** Off (unless tracking premarket)
- **Timezone:** America/New_York (ET)

### 4. Set Up Alerts (Critical Step)

You need to create alerts for **each ticker chart**. TradingView will send these to your n8n webhook.

#### For Each Ticker Chart:

1. **Click the Alert icon** (top right of chart)
2. **Click "Create Alert"**
3. Configure:
   - **Condition:** Select your strategy → "Alert() function calls only"
   - **Options:**
     - ✅ Once Per Bar Close
     - ✅ Show popup
   - **Alert name:** `{{ticker}} - Day Trading Signal`
   - **Message:** Keep default `{{strategy.order.alert_message}}`
   - **Webhook URL:** Paste your n8n webhook URL (see n8n setup)

4. **Click "Create"**

Repeat this for all 6 tickers.

### 5. Verify Setup

After setup, you should see:

**On Chart:**
- VWAP (blue line)
- EMA 9 (orange line)
- EMA 20 (yellow line)
- EMA 50 (white line)
- Opening Range High/Low (green/red step lines)
- HOD/LOD markers (circles)

**Signal Markers:**
- Green triangle up = ORB Long
- Blue circle (below) = VWAP Reclaim Long
- Small green square = EMA Trend Long
- Green diamond = HOD Breakout Long
- Red triangle down = ORB Put
- Orange circle (above) = VWAP Reject Put
- Red diamond = LOD Break Put

### 6. Test Alerts

To test if alerts are working:

1. Check TradingView alerts panel (right sidebar)
2. You should see alerts listed for each ticker
3. When a signal fires, check:
   - TradingView popup appears
   - Webhook sends to n8n (check n8n execution logs)

## Signal Types Reference

### LONG Signals

| Signal | Description | Key Conditions |
|--------|-------------|----------------|
| ORB_BREAKOUT_LONG | Opening Range breakout above | Price > ORH, above VWAP, volume spike |
| VWAP_RECLAIM_LONG | Price reclaims VWAP | Was below VWAP, now above, green candle |
| EMA_TREND_CONTINUATION_LONG | EMA alignment trend | All EMAs aligned, above VWAP, momentum |
| HOD_BREAKOUT_LONG | High of Day breakout | Price > previous HOD, volume spike |

### PUT Signals

| Signal | Description | Key Conditions |
|--------|-------------|----------------|
| ORB_BREAKDOWN_PUT | Opening Range breakdown | Price < ORL, below VWAP, volume spike |
| VWAP_REJECT_PUT | Price rejects VWAP down | Was above VWAP, now below, red candle |
| LOD_BREAK_PUT | Low of Day breakdown | Price < previous LOD, volume spike |

## Webhook Payload Format

Each alert sends this JSON structure:

```json
{
  "signal": "SIGNAL_NAME",
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
}
```

## Customization

You can adjust these settings in the Pine Script input parameters:

- **EMA Lengths:** Default 9, 20, 50
- **Volume Threshold:** Default 1.2x (20% above average)
- **Opening Range Time:** Default 9:30-9:35 AM ET
- **Enable/Disable Signals:** Toggle LONG or PUT signals

## Troubleshooting

### No signals appearing
- Check that timeframe is 1-min or 5-min
- Verify market is open (9:30 AM - 4:00 PM ET)
- Ensure volume is sufficient (low volume = fewer signals)

### Alerts not firing
- Verify alert is created with "Alert() function calls only"
- Check webhook URL is correct
- Ensure "Once Per Bar Close" is selected
- Check TradingView Premium is active (webhooks require Premium)

### Too many signals
- Increase volume threshold (e.g., 1.5x instead of 1.2x)
- Only trade during high-liquidity hours (9:30-11:00 AM, 2:00-4:00 PM)

### Wrong signal types
- Verify you're on the correct timeframe (1-min or 5-min)
- Check that opening range time matches your timezone

## Best Practices

1. **Use 1-minute charts** for fastest signals
2. **Monitor during first 2 hours** of market (9:30-11:30 AM ET)
3. **Verify signals manually** before trading
4. **Only trade HIGH-quality signals** (wait for AI evaluation)
5. **Max 2-3 trades per day** to maintain focus

## Next Steps

After TradingView is configured:
1. Set up n8n workflow (see `../n8n-workflows/README.md`)
2. Configure AI evaluation (see `../ai-prompts/README.md`)
3. Connect messaging (Telegram/Discord)

---

**Need Help?**
- TradingView Pine Script Docs: https://www.tradingview.com/pine-script-docs/
- Webhook Setup: https://www.tradingview.com/support/solutions/43000529348/
