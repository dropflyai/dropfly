# AI Evaluation Prompts

This directory contains the AI prompts and evaluation logic for the Day Trading Signal Agent.

## Files

- **system-prompt.txt** - Core system prompt for the AI evaluator
- **evaluation-rules.md** - Detailed evaluation criteria and guidelines

## Overview

The AI Evaluation Layer is responsible for:
1. Receiving technical signal data from n8n
2. Analyzing signal quality based on predefined rules
3. Rating signals as HIGH, MEDIUM, or LOW quality
4. Providing actionable trade recommendations
5. Calculating entry, stop, and target levels

## How It Works

```
Signal Data (from n8n)
        ↓
AI Evaluator (GPT-4)
        ↓
Quality Rating + Context
        ↓
Trade Recommendation
        ↓
Formatted Alert
```

## System Prompt Structure

The system prompt (in `system-prompt.txt`) includes:

### 1. Role Definition
- Establishes AI as "Trade Signal Evaluator"
- Sets context for day trading assistance

### 2. Evaluation Criteria
- Price relative to VWAP
- EMA 9/20/50 alignment
- Volume strength
- Trend direction
- Candle structure
- Signal type quality

### 3. Quality Rating System
- **HIGH:** All criteria strongly aligned
- **MEDIUM:** Most criteria met
- **LOW:** Weak setup or conflicting signals

### 4. Output Format
Strict format for consistency:
```
TICKER – SIGNAL_TYPE – Quality: HIGH/MEDIUM/LOW
Price: X | VWAP: X | EMA9/20/50: X/X/X
Context: <brief reason>
Idea: CALL / PUT / SKIP
Entry: X | Stop: X | Target: X
```

### 5. Rules and Constraints
- Never invent data
- Be conservative when uncertain
- Downgrade to MEDIUM/LOW if unclear
- Prioritize trader safety

## Using the System Prompt

### In n8n

The system prompt is already integrated into the n8n workflow (`signal-processor.json`).

**Location:** "AI Signal Evaluator" node → System message

To update:
1. Open workflow in n8n
2. Click "AI Signal Evaluator" node
3. Edit "System" message
4. Paste updated prompt from `system-prompt.txt`
5. Save workflow

### Testing Manually

You can test the AI evaluation using OpenAI's Playground:

1. Go to https://platform.openai.com/playground
2. Select **GPT-4 Turbo** model
3. Set **Temperature** to **0.3**
4. Paste the **system prompt** from `system-prompt.txt`
5. Create a user message with test signal data:

```
Evaluate this trading signal:

Ticker: NVDA
Signal: VWAP_RECLAIM_LONG
Price: 188.20
VWAP: 187.90
EMA 9: 188.10
EMA 20: 187.70
EMA 50: 186.90
Volume: 1250000
Trend: BULLISH
Price vs VWAP: ABOVE (0.16%)
Timeframe: 1min

Provide your evaluation in the exact format specified.
```

6. Click **Submit** and review the output

## Evaluation Rules

See `evaluation-rules.md` for detailed criteria on:
- How to rate each of the 7 signal types
- Volume analysis guidelines
- EMA alignment scoring
- Price vs VWAP interpretation
- Entry/stop/target calculation
- Common mistakes to avoid

## Customizing the AI Evaluator

### Adjust Evaluation Strictness

**More Conservative (fewer trades, higher quality):**
- Increase volume threshold (e.g., 1.5x instead of 1.2x)
- Require perfect EMA alignment for HIGH
- Stricter VWAP distance requirements
- Lower MEDIUM ratings to LOW more often

**More Aggressive (more trades, lower quality threshold):**
- Decrease volume threshold (e.g., 1.1x)
- Allow partial EMA alignment for HIGH
- Wider VWAP tolerance
- Upgrade more MEDIUM signals

**How to implement:**
Edit `system-prompt.txt` and update the criteria descriptions.

### Change Output Format

If you want a different alert format:

1. Edit the "OUTPUT FORMAT" section in `system-prompt.txt`
2. Update the "Format Alert Message" node in n8n to parse the new format
3. Test thoroughly to ensure parsing works

Example alternative format:
```
🎯 NVDA Signal
Type: VWAP_RECLAIM_LONG
Quality: ⭐⭐⭐ HIGH

📊 Technicals:
Price: $188.20
VWAP: $187.90
EMAs: 9️⃣ $188.10 | 2️⃣0️⃣ $187.70 | 5️⃣0️⃣ $186.90

💡 Analysis:
Strong VWAP reclaim with rising volume

📈 Trade Plan:
Direction: CALL
Entry: $188.10-$188.30
Stop: Below $187.80
Target: +12%
```

### Add New Indicators

To incorporate new indicators (RSI, MACD, etc.):

1. **Update TradingView Pine Script:**
   - Add indicator calculation
   - Include in webhook JSON payload

2. **Update n8n parsing:**
   - Add new field to "Validate & Enrich Data" node
   - Pass to AI evaluator

3. **Update System Prompt:**
   - Add new indicator to evaluation criteria
   - Define how it affects quality rating
   - Provide examples

4. **Update Evaluation Rules:**
   - Document how to interpret new indicator
   - Add to signal-specific guidelines

## Model Selection

### Recommended: GPT-4 Turbo Preview

**Pros:**
- Most accurate evaluations
- Best at following format
- Strong reasoning
- Consistent quality ratings

**Cons:**
- Higher cost (~$0.01/evaluation)
- Slightly slower (~1-2 seconds)

### Alternative: GPT-4

**Pros:**
- Very accurate
- Good at following format
- Reliable

**Cons:**
- Similar cost to Turbo
- Slightly slower

### Budget Option: GPT-3.5 Turbo

**Pros:**
- Much cheaper (~$0.001/evaluation)
- Faster (~0.5-1 second)

**Cons:**
- Less accurate
- May miss nuances
- Inconsistent format adherence

**Recommendation:** Use GPT-4 Turbo for production. The ~$15/month cost is worth the accuracy for trading decisions.

## Temperature Settings

The temperature controls randomness/creativity:

### Current: 0.3 (Recommended)

- **Balanced:** Consistent but with slight variation
- **Good for:** Signal evaluation where some flexibility helps
- **Result:** Similar signals get similar ratings, but not identical

### Alternative: 0.0 (Deterministic)

- **Pros:** Perfectly consistent, same input = same output
- **Cons:** May be too rigid, no nuance
- **Use case:** Maximum consistency

### Alternative: 0.5-0.7 (More Creative)

- **Pros:** More varied responses, considers edge cases
- **Cons:** Less predictable, may be inconsistent
- **Use case:** When you want diverse analysis

**Recommendation:** Keep at 0.3 for trading signals.

## Testing and Validation

### Test Cases

Use these sample signals to test AI evaluation:

**High-Quality LONG:**
```json
{
  "ticker": "NVDA",
  "signal": "VWAP_RECLAIM_LONG",
  "price": 188.20,
  "vwap": 187.90,
  "ema9": 188.10,
  "ema20": 187.70,
  "ema50": 186.90,
  "volume": 1250000,
  "trend": "BULLISH",
  "priceVsVwap": "ABOVE"
}
```
**Expected:** Quality: HIGH, Idea: CALL

**Low-Quality LONG:**
```json
{
  "ticker": "AAPL",
  "signal": "ORB_BREAKOUT_LONG",
  "price": 175.50,
  "vwap": 175.80,
  "ema9": 175.20,
  "ema20": 175.40,
  "ema50": 175.60,
  "volume": 800000,
  "trend": "NEUTRAL",
  "priceVsVwap": "BELOW"
}
```
**Expected:** Quality: LOW, Idea: SKIP

**High-Quality PUT:**
```json
{
  "ticker": "TSLA",
  "signal": "VWAP_REJECT_PUT",
  "price": 242.10,
  "vwap": 242.80,
  "ema9": 242.30,
  "ema20": 242.90,
  "ema50": 243.50,
  "volume": 2100000,
  "trend": "BEARISH",
  "priceVsVwap": "BELOW"
}
```
**Expected:** Quality: HIGH, Idea: PUT

### Validation Checklist

✅ AI follows output format exactly
✅ Quality ratings are appropriate
✅ Entry/stop/target levels are reasonable
✅ Context provides clear reasoning
✅ SKIP is recommended for LOW quality
✅ No hallucinated data or indicators
✅ Consistent ratings for similar signals

## Monitoring Performance

Track these metrics to evaluate AI performance:

### Signal Quality Distribution
- % of signals rated HIGH
- % of signals rated MEDIUM
- % of signals rated LOW
- Target: ~30% HIGH, ~40% MEDIUM, ~30% LOW

### Win Rate by Quality
- HIGH-quality win rate (target: 65-75%)
- MEDIUM-quality win rate (target: 50-60%)
- LOW-quality win rate (should be low, signals skipped)

### Consistency
- Same signal conditions = same rating
- Similar conditions = similar ratings
- No wild swings in evaluation

### Accuracy
- Do HIGH-quality signals actually perform well?
- Are LOW-quality signals correctly identified as weak?
- Is the AI being too conservative or too aggressive?

## Troubleshooting

### AI not following format

**Problem:** Output doesn't match expected format

**Solutions:**
1. Reinforce format in system prompt with more examples
2. Lower temperature (try 0.1 or 0.0)
3. Add format examples to user prompt
4. Use GPT-4 instead of GPT-3.5

### Inconsistent ratings

**Problem:** Similar signals get different ratings

**Solutions:**
1. Lower temperature to 0.1-0.2
2. Add more specific criteria to system prompt
3. Provide numerical thresholds in evaluation rules
4. Use more examples in prompt

### Too conservative (everything LOW)

**Problem:** AI rates most signals as LOW

**Solutions:**
1. Adjust criteria to be less strict
2. Review evaluation rules for reasonableness
3. Provide examples of acceptable MEDIUM signals
4. Check if input data quality is poor

### Too aggressive (everything HIGH)

**Problem:** AI rates too many signals as HIGH

**Solutions:**
1. Tighten evaluation criteria
2. Add more disqualifying conditions
3. Emphasize trader safety in prompt
4. Review and update evaluation rules

## Next Steps

After AI prompts are configured:
1. Test with historical signals
2. Validate rating accuracy
3. Adjust criteria based on results
4. Monitor live performance
5. Iterate and improve

---

**Need Help?**
- OpenAI API Docs: https://platform.openai.com/docs
- GPT-4 Guide: https://platform.openai.com/docs/models/gpt-4
- Prompt Engineering: https://platform.openai.com/docs/guides/prompt-engineering
