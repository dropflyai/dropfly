# Troubleshooting Guide

Common issues and solutions for the Day Trading Signal Agent.

---

## Table of Contents

1. [No Signals Appearing](#no-signals-appearing)
2. [TradingView Issues](#tradingview-issues)
3. [n8n Workflow Issues](#n8n-workflow-issues)
4. [AI Evaluation Issues](#ai-evaluation-issues)
5. [Messaging Issues](#messaging-issues)
6. [Signal Quality Issues](#signal-quality-issues)
7. [Performance Issues](#performance-issues)
8. [General Debugging](#general-debugging)

---

## No Signals Appearing

### Problem: Not receiving any trading signals

#### Check 1: Market Hours
**Issue:** Markets are closed
**Solution:**
- Trading signals only fire during market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
- Check if it's a holiday
- Verify your timezone

#### Check 2: Low Volatility
**Issue:** No valid setups occurring
**Solution:**
- During low volatility, signals may be rare (this is normal and GOOD)
- Some days only have 1-2 quality setups across all tickers
- Don't force trades when setups aren't there

#### Check 3: TradingView Alerts
**Issue:** Alerts not created or inactive
**Solution:**
1. Open TradingView
2. Click Alert icon (🔔)
3. Verify alerts exist for all 6 tickers
4. Check alerts are "Active" (not paused)
5. Verify webhook URL is correct

#### Check 4: n8n Workflow
**Issue:** Workflow is inactive
**Solution:**
1. Open n8n
2. Check workflow toggle is "Active" (top right)
3. Click "Executions" tab to see if anything is running
4. If no executions, webhook may not be receiving data

#### Check 5: Indicators on Charts
**Issue:** Pine Script not applied to charts
**Solution:**
1. Open each ticker chart
2. Verify "Day Trading Signal Agent v1.0" is in indicators list
3. Verify VWAP, EMAs, and other indicators are visible
4. Re-add indicator if missing

---

## TradingView Issues

### Problem: Pine Script won't load

**Error:** "Script error" or compilation fails

**Solutions:**
1. **Check TradingView plan:**
   - Webhooks require Premium plan
   - Go to Profile → Subscription

2. **Re-import script:**
   - Copy `tradingview-scripts/main-strategy.pine` again
   - Create new blank indicator
   - Paste code
   - Save

3. **Check for syntax errors:**
   - Look for red underlines in Pine Editor
   - Ensure you copied the entire script
   - Verify no extra characters were added

### Problem: Indicators not showing on chart

**Solutions:**
1. **Refresh chart:**
   - Press F5 or reload page

2. **Re-add indicator:**
   - Remove indicator from chart
   - Click "Indicators" button
   - Search for your script
   - Add it again

3. **Check timeframe:**
   - Script works on 1-min or 5-min
   - Won't work on daily/weekly charts

### Problem: Alerts not firing

**Error:** No alerts triggering when signals should occur

**Solutions:**
1. **Verify alert condition:**
   - Alert condition must be: "Alert() function calls only"
   - NOT "Any alert() function call"

2. **Check "Once Per Bar Close":**
   - This must be enabled
   - Prevents duplicate alerts

3. **Verify webhook URL:**
   - Open alert settings
   - Check webhook URL is correct
   - Must start with `https://`

4. **Test webhook:**
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"test": "hello"}'
   ```

5. **Check TradingView Premium:**
   - Webhooks require Premium plan
   - Free/Pro/Pro+ plans don't support webhooks

### Problem: Wrong signals firing

**Issue:** Signals don't match the rules

**Solutions:**
1. **Check indicator settings:**
   - Click gear icon on indicator
   - Verify EMA lengths (9, 20, 50)
   - Check volume threshold (1.2)

2. **Verify timeframe:**
   - Should be 1-min or 5-min
   - Higher timeframes may give false signals

3. **Check market session:**
   - Chart should show Regular Trading Hours only
   - Extended hours may show incorrect signals

---

## n8n Workflow Issues

### Problem: Workflow not executing

**Error:** No executions appear in history

**Solutions:**
1. **Activate workflow:**
   - Toggle "Active" in top right
   - Should show green when active

2. **Check webhook:**
   - Click "Webhook - Receive Signal" node
   - Click "Execute Node"
   - Verify it shows "Waiting for webhook call..."
   - Copy the Production URL

3. **Test webhook manually:**
   ```bash
   curl -X POST https://your-n8n.app/webhook/trading-signals \
     -H "Content-Type: application/json" \
     -d '{
       "signal": "TEST",
       "ticker": "NVDA",
       "price": 188.45,
       "vwap": 187.90,
       "ema9": 188.10,
       "ema20": 187.70,
       "ema50": 186.90,
       "volume": 1000000,
       "time": "1732546200000",
       "timeframe": "1"
     }'
   ```

4. **Check execution history:**
   - Click "Executions" tab
   - Look for errors (red)
   - Click on execution to see details

### Problem: Workflow failing with errors

**Error:** Red "Failed" status in executions

**Solutions:**

#### Error: "Missing required fields"
**Fix:**
- Check TradingView alert message format
- Verify `{{strategy.order.alert_message}}` is used
- Ensure JSON payload is valid

#### Error: "OpenAI API error"
**Fix:**
1. Check API key is valid
2. Verify billing is enabled at https://platform.openai.com/account/billing
3. Check you have available credits
4. Test API key:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

#### Error: "Telegram/Discord failed"
**Fix:**
1. Verify credentials are correct
2. Check bot token hasn't been revoked
3. Verify chat ID or webhook URL is correct
4. Test manually with test message

### Problem: Slow execution

**Issue:** Alerts delayed by 5+ seconds

**Solutions:**
1. **Check OpenAI response time:**
   - GPT-4 typically responds in 1-2 seconds
   - If slower, check OpenAI status page

2. **Reduce workflow complexity:**
   - Remove unnecessary nodes
   - Simplify code in function nodes

3. **Upgrade n8n plan:**
   - Free tier may have lower priority
   - Paid plans get better performance

---

## AI Evaluation Issues

### Problem: AI giving wrong quality ratings

**Issue:** HIGH ratings for clearly bad setups, or vice versa

**Solutions:**
1. **Review system prompt:**
   - Open `ai-prompts/system-prompt.txt`
   - Verify it matches the prompt in n8n
   - Update if needed

2. **Check AI model:**
   - Should be using GPT-4 Turbo Preview
   - GPT-3.5 is less accurate

3. **Adjust temperature:**
   - Current: 0.3
   - For more consistency: 0.1-0.2
   - For more flexibility: 0.4-0.5

4. **Add more examples:**
   - Update system prompt with specific examples
   - Show what HIGH/MEDIUM/LOW should look like

### Problem: AI output not formatted correctly

**Error:** Message doesn't match expected format

**Solutions:**
1. **Reinforce format in prompt:**
   - Add more emphasis on output format
   - Provide exact template

2. **Use lower temperature:**
   - Set to 0.1 for maximum consistency

3. **Check parsing logic:**
   - Open "Format Alert Message" node
   - Verify it's extracting quality correctly

4. **Switch to GPT-4:**
   - GPT-3.5 may not follow format as well

### Problem: AI inventing data

**Issue:** AI mentions indicators not in the signal

**Solutions:**
1. **Update system prompt:**
   - Add stronger warning: "NEVER invent data"
   - Emphasize using only provided values

2. **Review evaluation rules:**
   - Check `ai-prompts/evaluation-rules.md`
   - Ensure no ambiguity

---

## Messaging Issues

### Telegram Issues

#### Problem: Not receiving messages

**Solutions:**
1. **Check bot token:**
   - Verify token in n8n is correct
   - Token should start with number, contain `:`

2. **Verify chat ID:**
   - Use @userinfobot to get correct ID
   - Make sure you sent `/start` to your bot

3. **Check bot isn't blocked:**
   - Open chat with your bot
   - Unblock if needed

4. **Test manually:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -d "chat_id=<YOUR_CHAT_ID>" \
     -d "text=Test message"
   ```

#### Problem: Formatting broken

**Solutions:**
1. **Check parse mode:**
   - In n8n Telegram node: Set to "Markdown"

2. **Escape special characters:**
   - `_`, `*`, `[`, `]` need escaping in Markdown

3. **Use HTML instead:**
   - Change parse_mode to "HTML"
   - Use `<b>bold</b>`, `<i>italic</i>`

### Discord Issues

#### Problem: Webhook not posting

**Solutions:**
1. **Check webhook URL:**
   - Should start with `https://discord.com/api/webhooks/`
   - Verify it wasn't deleted in Discord

2. **Test webhook:**
   ```bash
   curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

3. **Regenerate webhook:**
   - Discord → Channel Settings → Integrations
   - Delete old webhook
   - Create new one
   - Update n8n

#### Problem: Messages going to wrong channel

**Solutions:**
1. **Check webhook channel:**
   - Open webhook settings in Discord
   - Verify it's assigned to correct channel

2. **Create new webhook:**
   - Webhooks are channel-specific
   - Create one for the correct channel

---

## Signal Quality Issues

### Problem: Too many LOW-quality signals

**Issue:** Getting spammed with weak setups

**Solutions:**
1. **Increase volume threshold:**
   - In Pine Script, change from 1.2 to 1.5
   - Requires stronger volume confirmation

2. **Stricter AI evaluation:**
   - Update system prompt to be more conservative
   - Raise the bar for HIGH ratings

3. **Filter in n8n:**
   - Update "Filter Low Quality" node
   - Only allow HIGH: `{{ $json.quality }} === 'HIGH'`

### Problem: No HIGH-quality signals

**Issue:** All signals rated MEDIUM or LOW

**Solutions:**
1. **Check market conditions:**
   - Low volatility = fewer quality setups (normal)
   - Some days just don't have great setups

2. **Relax AI criteria:**
   - Update system prompt to be slightly less strict
   - But be careful - don't compromise too much

3. **Review historical data:**
   - Are the MEDIUM signals actually performing well?
   - Consider if AI is being too strict

### Problem: Signals don't match manual analysis

**Issue:** AI says HIGH, but chart looks weak

**Solutions:**
1. **Trust but verify:**
   - Always verify signals manually
   - If chart looks bad, skip it (even if AI says HIGH)

2. **Paper trade first:**
   - Track AI ratings vs. actual results
   - See if AI is generally accurate over 50+ signals

3. **Adjust evaluation rules:**
   - Based on data, update `ai-prompts/evaluation-rules.md`
   - Refine what HIGH/MEDIUM/LOW means

---

## Performance Issues

### Problem: Alerts delayed

**Issue:** Receiving signals 10+ seconds after they occur

**Diagnosis:**
1. Check TradingView alert delivery time (usually instant)
2. Check n8n execution time (view in history)
3. Check OpenAI response time (typically 1-2 sec)
4. Check messaging delivery (usually instant)

**Solutions:**

**If TradingView delay:**
- Check internet connection
- Verify TradingView isn't rate-limiting you
- Contact TradingView support

**If n8n delay:**
- Upgrade n8n plan for better performance
- Check n8n server status
- Restart n8n (if self-hosted)

**If OpenAI delay:**
- Check OpenAI status page
- Try different model (GPT-4 vs GPT-4-turbo)
- Contact OpenAI support if consistent

**If messaging delay:**
- Usually not an issue
- Check phone internet connection
- Restart Discord/Telegram app

### Problem: High costs

**Issue:** OpenAI bills higher than expected

**Solutions:**
1. **Check execution count:**
   - n8n Executions tab shows total runs
   - Should be ~20-50 per day (one per signal)

2. **Look for infinite loops:**
   - Check for errors causing retries
   - Verify webhook isn't being called repeatedly

3. **Optimize AI usage:**
   - Only call AI for valid signals (filter first)
   - Use GPT-3.5 for testing (cheaper)

4. **Set spending limits:**
   - OpenAI → Settings → Billing → Set monthly budget

---

## General Debugging

### Systematic Debugging Process

When something isn't working:

#### Step 1: Identify the problem location

**Test each component individually:**

1. **TradingView → Webhook:**
   - Check TradingView alert history
   - Did alert fire?

2. **Webhook → n8n:**
   - Check n8n execution history
   - Did execution start?

3. **n8n → OpenAI:**
   - Check execution details
   - Did AI node run?

4. **OpenAI → Output:**
   - Check AI response
   - Is evaluation present?

5. **Output → Messaging:**
   - Check messaging node
   - Was message sent?

#### Step 2: Check logs

**TradingView:**
- Alert history (🔔 icon → History)

**n8n:**
- Executions tab → Click execution → View details
- Each node shows input/output

**OpenAI:**
- n8n execution shows API request/response
- Check for error messages

**Telegram/Discord:**
- n8n execution shows delivery status

#### Step 3: Test manually

**Send test webhook:**
```bash
curl -X POST https://your-n8n.app/webhook/trading-signals \
  -H "Content-Type: application/json" \
  -d @tests/test-payloads.json
```

**Test Telegram:**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<ID>" \
  -d "text=Test"
```

**Test Discord:**
```bash
curl -X POST "<WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test"}'
```

#### Step 4: Check credentials

- OpenAI API key valid?
- Telegram bot token valid?
- Discord webhook not deleted?
- n8n webhook URL correct?

#### Step 5: Review recent changes

- Did you update any settings?
- Did you modify the workflow?
- Did you change the Pine Script?

### Debug Checklist

Print this and use when troubleshooting:

```
═══════════════════════════════════════════════
         DEBUG CHECKLIST
═══════════════════════════════════════════════

□ Market is open (9:30 AM - 4:00 PM ET)
□ TradingView alerts are active
□ n8n workflow is Active (green toggle)
□ Webhook URL is correct in TradingView
□ OpenAI API key is valid and funded
□ Telegram/Discord credentials are correct
□ Indicators are visible on charts
□ Timeframe is 1-min or 5-min
□ All 6 tickers have alerts configured
□ Test webhook works manually
□ No errors in n8n execution history

═══════════════════════════════════════════════
```

---

## Getting Additional Help

### Self-Help Resources

1. **Project Documentation:**
   - `README.md` - Overview
   - `docs/SETUP.md` - Setup guide
   - `docs/TRADING-RULES.md` - Trading rules
   - Component-specific READMEs

2. **Logs and Debugging:**
   - n8n execution history (most valuable)
   - Browser console (F12) for errors
   - Network tab to see webhook calls

3. **Online Resources:**
   - TradingView Pine Script docs
   - n8n documentation
   - OpenAI API docs
   - Telegram Bot API docs

### Community Support

1. **n8n Community:**
   - https://community.n8n.io
   - Very active and helpful

2. **TradingView:**
   - https://www.tradingview.com/support/
   - Pine Script forum

3. **Discord/Telegram:**
   - Official support channels

### When to Seek Professional Help

Consider professional help if:
- You've tried all troubleshooting steps
- Issue persists for 2+ days
- You're losing money due to system issues
- You need custom modifications beyond your skill level

---

## Emergency Procedures

### System Down During Market Hours

**If the system stops working during trading:**

1. **DON'T PANIC**
   - You can still trade manually

2. **Quick Fix Attempts:**
   - Check n8n is Active
   - Restart n8n (if self-hosted)
   - Verify TradingView alerts are active

3. **Manual Trading Mode:**
   - Watch charts manually
   - Look for the same patterns
   - Use AI evaluation checklist mentally

4. **Fix After Market Close:**
   - Don't try to fix complex issues during market hours
   - Trade manually if confident
   - Debug thoroughly after 4 PM

### Lost Credentials

**OpenAI API Key Lost:**
1. Go to https://platform.openai.com/api-keys
2. Revoke old key (if compromised)
3. Create new key
4. Update n8n credentials

**Telegram Bot Token Lost:**
1. Chat with @BotFather
2. Send `/token`
3. Select your bot
4. Copy new token
5. Update n8n

**Discord Webhook Lost:**
1. Discord → Channel Settings → Integrations
2. View webhook
3. Copy URL again
4. Or create new webhook

### Account Compromised

**If webhook URL is exposed publicly:**

**n8n:**
1. Deactivate workflow
2. Edit webhook node
3. Change webhook path
4. Reactivate
5. Update TradingView alerts

**Telegram:**
1. Revoke bot token (@BotFather → /revoke)
2. Create new bot
3. Update n8n credentials

**Discord:**
1. Delete compromised webhook
2. Create new webhook
3. Update n8n

---

## Preventing Issues

### Best Practices

1. **Regular Maintenance:**
   - Check system daily before market open
   - Review n8n executions weekly
   - Update credentials periodically

2. **Monitoring:**
   - Send yourself a "system alive" message daily
   - Track execution count
   - Monitor costs

3. **Backups:**
   - Export n8n workflow regularly
   - Save all credentials securely
   - Document customizations

4. **Testing:**
   - Test system before each trading session
   - Send test signal manually
   - Verify notifications work

### Maintenance Schedule

**Daily (Before Market Open):**
- [ ] Verify n8n workflow is Active
- [ ] Check TradingView alerts are active
- [ ] Send test signal
- [ ] Verify notification received

**Weekly:**
- [ ] Review execution logs
- [ ] Check for errors
- [ ] Export n8n workflow (backup)
- [ ] Review performance metrics

**Monthly:**
- [ ] Update credentials if needed
- [ ] Review and optimize workflow
- [ ] Check for software updates
- [ ] Analyze cost vs. value

---

## Common Error Messages

### "Strategy alert already exists"

**Meaning:** TradingView alert already created for this setup

**Fix:** Delete existing alert and recreate, or use existing one

### "Webhook limit reached"

**Meaning:** n8n has hit execution limit

**Fix:** Upgrade n8n plan or wait for monthly reset

### "OpenAI API rate limit"

**Meaning:** Too many API calls too quickly

**Fix:** Wait 60 seconds, ensure no infinite loops

### "Invalid Chat ID"

**Meaning:** Telegram chat ID is wrong

**Fix:** Get correct chat ID from @userinfobot

### "Webhook URL invalid"

**Meaning:** Discord webhook was deleted or wrong

**Fix:** Recreate webhook and update URL

---

**Remember:** Most issues are simple fixes. Work through this guide systematically and you'll resolve 95% of problems.

If stuck, take a break and come back with fresh eyes. The solution is usually simpler than you think!

Good luck! 🔧
