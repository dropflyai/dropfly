# Telegram Setup Guide

Complete guide to setting up Telegram for trading signal alerts.

## Why Telegram?

- Fast push notifications
- Works on all devices (iOS, Android, desktop, web)
- Reliable message delivery
- Free to use
- Can create dedicated trading channel
- Supports formatted messages

## Setup Steps

### Step 1: Create a Telegram Bot

1. **Open Telegram** on your phone or desktop

2. **Search for @BotFather**
   - This is Telegram's official bot creation tool
   - Verified with blue checkmark

3. **Start a conversation** with @BotFather
   - Click "Start" or send `/start`

4. **Create a new bot**
   - Send command: `/newbot`
   - BotFather will ask for a name

5. **Choose a display name**
   - Example: "Day Trading Signals"
   - This is what users see

6. **Choose a username**
   - Must end in "bot"
   - Example: "mytrading_signals_bot"
   - Must be unique

7. **Save your bot token**
   - BotFather will send you a token like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   ```
   - **IMPORTANT:** Keep this secret! Anyone with this token can control your bot
   - Copy and save in a secure location

### Step 2: Get Your Chat ID

**Option A: Using @userinfobot (Easiest)**

1. Search for **@userinfobot** in Telegram
2. Send `/start`
3. Bot will reply with your user ID
4. Copy the number (e.g., `123456789`)
5. This is your **Chat ID**

**Option B: Using your bot**

1. Start a conversation with your newly created bot
   - Search for your bot username
   - Click "Start"

2. Send any message to your bot (e.g., "Hello")

3. Open this URL in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```

4. Look for `"chat":{"id":123456789}`

5. Copy the ID number

### Step 3: Configure n8n

1. **Open your n8n workflow**

2. **Click on "Send to Telegram" node**

3. **Add credentials:**
   - Click "Create New Credential"
   - Select "Telegram API"
   - Enter your **Bot Token**
   - Click "Save"

4. **Set Chat ID:**
   - In the node settings, find "Chat ID"
   - Enter your Chat ID
   - Click "Execute Node" to test

5. **Test the connection:**
   - You should receive a test message in Telegram
   - If not, verify token and chat ID

### Step 4: Customize Bot (Optional)

Make your bot look professional:

1. **Set bot description** (shown before users start bot)
   - Send to @BotFather: `/setdescription`
   - Select your bot
   - Enter: "Automated day trading signal alerts for NVDA, AAPL, META, TSLA, SPY, QQQ"

2. **Set about text**
   - Send to @BotFather: `/setabouttext`
   - Select your bot
   - Enter: "Delivers high-probability day trading signals in real-time"

3. **Set profile picture**
   - Send to @BotFather: `/setuserpic`
   - Select your bot
   - Upload an image (e.g., trading chart icon)

4. **Set commands** (what users see when they type `/`)
   - Send to @BotFather: `/setcommands`
   - Select your bot
   - Enter:
   ```
   start - Start receiving signals
   stop - Stop receiving signals
   help - Get help
   ```

### Step 5: Test End-to-End

1. **Trigger a test signal** in n8n
   - Use the test payload from `../tests/test-payloads.json`
   - Send to your n8n webhook

2. **Check Telegram**
   - You should receive a formatted alert
   - Verify all information displays correctly

3. **Test message format**
   - Should include ticker, signal type, quality
   - Should show price levels
   - Should include context and trade idea

## Advanced: Create a Trading Channel

Instead of personal chat, create a dedicated channel:

### Create Channel

1. **In Telegram, click "New Channel"**
2. **Name it:** "My Trading Signals"
3. **Description:** "Day trading signal alerts"
4. **Set to Private** (only you can see)

### Get Channel Chat ID

1. **Add your bot as admin:**
   - Open channel info
   - Click "Administrators"
   - Click "Add Administrator"
   - Search for your bot
   - Give it permission to post messages

2. **Post a message** to the channel

3. **Get channel ID:**
   - Open: `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
   - Look for `"chat":{"id":-100123456789}`
   - Channel IDs start with `-100`

4. **Update n8n:**
   - Use the channel ID instead of your personal chat ID

### Benefits of Channel

- Cleaner separation (trading vs personal)
- Can add other devices/accounts as subscribers
- Better organization
- Can pin important messages

## Message Formatting

Telegram supports **Markdown** and **HTML** formatting.

### Current Format (Markdown)

```
🚨 TRADING SIGNAL 🚨

NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume
Idea: CALL
Entry: 188.10–188.30 | Stop: below VWAP | Target: +10–15%

⏰ Time: 10:45 AM ET
📊 Timeframe: 1min

---
💡 Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%
```

### Customize Formatting

To change the message format:

1. Edit the **"Format Alert Message"** node in n8n
2. Update the message template
3. Use Telegram formatting:
   - `*bold*`
   - `_italic_`
   - `` `code` ``
   - `[link](url)`

## Notifications Settings

### On Your Phone

1. **Open Telegram Settings**
2. **Notifications and Sounds**
3. **Find your bot** in chat list
4. **Customize:**
   - ✅ Enable notifications
   - ✅ Show preview
   - ✅ Sound ON (use unique sound)
   - ✅ Vibrate
   - ✅ Priority notifications (Android)

### Quiet Hours

If you don't want alerts outside market hours:

1. In n8n, add a **Time Filter** node
2. Only send messages during market hours (9:30 AM - 4:00 PM ET)
3. Or use Telegram's scheduled "Mute" feature

## Security Best Practices

### Protect Your Bot Token

❌ **Never:**
- Share your bot token publicly
- Commit it to GitHub
- Send it in plain text messages

✅ **Always:**
- Store in environment variables
- Use n8n's credential manager
- Rotate token if compromised

### Revoke Compromised Token

If your token is exposed:

1. Go to @BotFather
2. Send `/revoke`
3. Select your bot
4. Get new token
5. Update n8n credentials

### Verify Bot Identity

Only interact with **your** bot:
- Check username matches what you created
- Verify in @BotFather bot list

## Troubleshooting

### Bot not responding

**Check:**
- Token is correct and not revoked
- Bot is not blocked
- Chat ID is correct
- n8n workflow is active

**Fix:**
- Verify credentials in n8n
- Send `/start` to bot again
- Check n8n execution logs

### Not receiving messages

**Check:**
- Telegram notifications enabled
- Phone has internet connection
- Bot hasn't been muted
- n8n workflow executed successfully

**Fix:**
- Check notification settings
- Unmute bot chat
- Review n8n execution history

### Messages delayed

**Check:**
- Internet connection quality
- Telegram server status
- n8n performance

**Fix:**
- Telegram is typically instant
- Issue is likely in TradingView or n8n
- Check webhook delivery time

### Wrong chat receiving messages

**Check:**
- Chat ID in n8n node
- Whether using personal ID or channel ID

**Fix:**
- Verify chat ID using @userinfobot
- Update n8n node with correct ID

### Formatting issues

**Check:**
- Parse mode is set to "Markdown" in n8n
- Special characters are escaped
- Message length < 4096 characters

**Fix:**
- Ensure parse_mode: "Markdown" in Telegram node
- Escape special characters: `_`, `*`, `[`, `]`

## Testing Checklist

✅ Bot created and token saved
✅ Chat ID obtained
✅ Credentials added to n8n
✅ Test message received
✅ Formatting looks correct
✅ Notifications work on phone
✅ Sound/vibrate enabled
✅ End-to-end signal flow tested

## Alternative: Telegram Desktop

For trading from desktop:

1. **Download Telegram Desktop**
   - Windows/Mac/Linux: https://desktop.telegram.org

2. **Enable notifications:**
   - Settings → Notifications
   - Enable desktop notifications
   - Enable sound

3. **Pin trading chat:**
   - Right-click on bot chat
   - Click "Pin to top"

4. **Keep Telegram open** during trading hours

## Cost

**Free!** Telegram is completely free:
- No limits on messages
- No API costs
- No subscription fees

## Next Steps

✅ Telegram configured
→ Test with live signals
→ Adjust notification settings
→ Consider creating dedicated channel
→ Set up Discord as backup (optional)

---

**Need Help?**
- Telegram Support: @TelegramAuditions
- Bot API Docs: https://core.telegram.org/bots/api
- @BotSupport: Official support bot
