# Discord Setup Guide

Complete guide to setting up Discord for trading signal alerts.

## Why Discord?

- Rich formatting and embeds
- Desktop-first experience (great for multi-monitor setups)
- Voice channels (optional, for trading with partners)
- Free to use
- Supports webhooks natively
- Better for team collaboration

## Setup Steps

### Step 1: Create a Discord Server (if you don't have one)

1. **Open Discord** (desktop app or web: https://discord.com)

2. **Click the "+" icon** on the left sidebar

3. **Select "Create My Own"**

4. **Choose "For me and my friends"**

5. **Name your server**
   - Example: "Trading Signals"
   - Upload an icon (optional)

6. **Click "Create"**

### Step 2: Create a Channel for Signals

1. **Right-click on your server name**

2. **Select "Create Channel"**

3. **Choose "Text Channel"**

4. **Name the channel**
   - Example: `#trading-signals`
   - Keep it lowercase, use hyphens

5. **Set as Private** (optional)
   - Toggle "Private Channel"
   - Only you can see signals

6. **Click "Create Channel"**

### Step 3: Create a Webhook

1. **Click the ⚙️ (gear icon)** next to your channel name

2. **Go to "Integrations"** tab on the left

3. **Click "Create Webhook"** (or "View Webhooks" if you have existing ones)

4. **Click "New Webhook"**

5. **Customize your webhook:**
   - **Name:** Day Trading Bot
   - **Channel:** #trading-signals (or your channel name)
   - **Avatar:** Upload an icon (optional)

6. **Click "Copy Webhook URL"**
   - Save this URL securely
   - Example: `https://discord.com/api/webhooks/123456789012345678/abcdefgh...`

7. **Click "Save Changes"**

### Step 4: Configure n8n

1. **Open your n8n workflow**

2. **Click on "Send to Discord" node**

3. **Paste Webhook URL:**
   - In the node settings, find "Webhook URL"
   - Paste your Discord webhook URL
   - No credentials needed (URL contains auth)

4. **Test the connection:**
   - Click "Execute Node"
   - Check Discord channel for test message

### Step 5: Customize Webhook (Optional)

Make your webhook messages look professional:

#### Option A: Simple Text Messages (Current)

Basic text format (what's already configured):

```
🚨 TRADING SIGNAL 🚨

NVDA – VWAP_RECLAIM_LONG – Quality: HIGH
Price: 188.20 | VWAP: 187.90 | EMA9/20/50: 188.10/187.70/186.90
Context: Strong VWAP reclaim with rising volume
Idea: CALL
Entry: 188.10–188.30 | Stop: below VWAP | Target: +10–15%
```

#### Option B: Rich Embeds (Advanced)

Create beautiful formatted messages with embeds.

**Update the n8n "Send to Discord" node:**

Replace the current message with this structure:

```json
{
  "embeds": [{
    "title": "🚨 TRADING SIGNAL",
    "description": "**NVDA – VWAP_RECLAIM_LONG**",
    "color": 3066993,
    "fields": [
      {
        "name": "Quality",
        "value": "⭐⭐⭐ HIGH",
        "inline": true
      },
      {
        "name": "Idea",
        "value": "📈 CALL",
        "inline": true
      },
      {
        "name": "Timeframe",
        "value": "1min",
        "inline": true
      },
      {
        "name": "📊 Price Levels",
        "value": "Price: $188.20\nVWAP: $187.90\nEMA9: $188.10 | EMA20: $187.70 | EMA50: $186.90"
      },
      {
        "name": "💡 Analysis",
        "value": "Strong VWAP reclaim with rising volume and bullish EMA alignment"
      },
      {
        "name": "📈 Trade Plan",
        "value": "**Entry:** $188.10–$188.30\n**Stop:** Below VWAP ($187.80)\n**Target:** +12%"
      }
    ],
    "footer": {
      "text": "Remember: Max 2-3 trades/day | Stop at -7%"
    },
    "timestamp": "2025-11-25T10:45:00.000Z"
  }]
}
```

**Embed color codes:**
- Green (HIGH quality): `3066993`
- Yellow (MEDIUM quality): `16776960`
- Red (LOW quality): `15158332`
- Blue: `3447003`

### Step 6: Set Up Notifications

#### On Desktop

1. **Right-click on #trading-signals channel**

2. **Select "Notification Settings"**

3. **Set to "All Messages"**
   - This ensures you get notified for every signal

4. **Enable sound:**
   - User Settings (⚙️ bottom left)
   - Notifications
   - Enable sounds for your server

#### On Mobile

1. **Open Discord mobile app**

2. **Go to your server**

3. **Tap the server name (top)**

4. **Tap "Notifications"**

5. **Enable:**
   - ✅ Mobile Push Notifications
   - ✅ Show notification badge
   - ✅ Suppress @everyone and @here (keep OFF for signals)

6. **For the #trading-signals channel:**
   - Swipe left on channel
   - Tap bell icon
   - Select "All Messages"

### Step 7: Test End-to-End

1. **Trigger a test signal** in n8n
   - Use the test payload from `../tests/test-payloads.json`
   - Send to your n8n webhook

2. **Check Discord**
   - Message appears in #trading-signals channel
   - Formatting looks correct
   - Notification received on desktop/mobile

3. **Verify notification sound** plays on desktop

## Advanced Features

### Multiple Channels by Quality

Create separate channels for different signal qualities:

**Setup:**

1. **Create 3 channels:**
   - `#high-quality-signals`
   - `#medium-quality-signals`
   - `#all-signals`

2. **Create 3 webhooks** (one for each channel)

3. **In n8n, add routing logic:**
   - Add an IF node after "Format Alert Message"
   - Route HIGH → #high-quality-signals
   - Route MEDIUM → #medium-quality-signals
   - Route all → #all-signals

4. **Set notifications:**
   - #high-quality-signals: All messages, loud sound
   - #medium-quality-signals: Mentions only
   - #all-signals: Muted (for reference)

### Add Roles and Mentions

To get @mentioned for HIGH-quality signals:

1. **Create a role:**
   - Server Settings → Roles
   - Create "Trader" role
   - Assign to yourself

2. **Update n8n message:**
   - For HIGH quality: Add `<@&ROLE_ID>` to message
   - Get role ID: Right-click role → Copy ID (need Developer Mode on)

3. **Result:**
   - HIGH-quality signals will @mention you
   - Gets your attention immediately

### Trading Journal Channel

Create a `#trade-journal` channel:

1. **Manually log your trades:**
   - Entry time and price
   - Exit time and price
   - P&L
   - Notes

2. **Pin important lessons**

3. **Review weekly** for improvement

### Voice Channel for Focus

Create a voice channel and join during trading hours:

1. **Create "Trading Zone" voice channel**
2. **Join during market hours**
3. **Helps maintain focus and discipline**
4. **Optional: Invite trading partner for accountability**

## Message Formatting

Discord supports **Markdown** formatting:

### Text Formatting

- `**bold**` → **bold**
- `*italic*` → *italic*
- `__underline__` → __underline__
- `~~strikethrough~~` → ~~strikethrough~~
- `` `code` `` → `code`
- ``` ```code block``` ``` → code block

### Colors and Emphasis

Use emojis for quick visual recognition:

- 🟢 `🟢` - GREEN/BULLISH
- 🔴 `🔴` - RED/BEARISH
- ⭐ `⭐` - HIGH quality
- ⚠️ `⚠️` - MEDIUM quality
- ❌ `❌` - LOW quality
- 📈 `📈` - CALL/LONG
- 📉 `📉` - PUT/SHORT

### Example Formatted Message

```
🚨 **TRADING SIGNAL** 🚨

**NVDA** – VWAP_RECLAIM_LONG – Quality: ⭐⭐⭐ **HIGH**

📊 **Price Levels**
Price: $188.20 | VWAP: $187.90
EMA9/20/50: $188.10/$187.70/$186.90

💡 **Analysis**
Strong VWAP reclaim with rising volume and bullish EMA alignment

📈 **Trade Plan**
Idea: **CALL** 🟢
Entry: $188.10–$188.30
Stop: Below VWAP ($187.80)
Target: +12%

⏰ 10:45 AM ET | 📊 1min

---
*Remember: Max 2-3 trades/day | Stop at -7% | Target +10-15%*
```

## Webhook Best Practices

### Security

❌ **Never:**
- Share your webhook URL publicly
- Post it on GitHub
- Send in plain text

✅ **Always:**
- Keep URL private
- Store in n8n only
- Regenerate if exposed

### Regenerate Compromised Webhook

If your webhook URL is exposed:

1. **Go to Discord server**
2. **Channel Settings → Integrations**
3. **Find the webhook**
4. **Click "Delete Webhook"**
5. **Create a new one**
6. **Update n8n with new URL**

### Rate Limits

Discord webhooks have rate limits:
- **30 requests per minute** per webhook
- For trading signals, this is more than enough
- Typical: 10-20 signals per day

## Discord Mobile App

### Setup for Trading

1. **Download Discord app:**
   - iOS: App Store
   - Android: Google Play

2. **Enable notifications:**
   - Settings → Notifications
   - Enable all notification types

3. **Pin your server:**
   - Long-press on server icon
   - Mute other servers during trading hours

4. **Quick access:**
   - Swipe right to see all channels
   - Tap #trading-signals for quick view

### Notification Priority (Android)

1. **Long-press on Discord app icon**
2. **App Info → Notifications**
3. **Set to "Urgent" or "High Priority"**
4. **Override Do Not Disturb** (optional)

## Discord Desktop

### Optimal Setup for Trading

1. **Download Discord Desktop:**
   - Windows/Mac: https://discord.com/download

2. **Settings for trading:**
   - Keybind: Set `Ctrl+Shift+D` to open Discord
   - Notifications: Enable desktop notifications
   - Sounds: Enable for #trading-signals
   - Overlay: Disable (can be distracting)

3. **Pin Discord to taskbar/dock**

4. **Keep minimized but visible during trading**

### Multi-Monitor Setup

If you have multiple monitors:

1. **Monitor 1:** Trading platform (Robinhood, etc.)
2. **Monitor 2:** TradingView charts
3. **Monitor 3 (or side panel):** Discord signals

**Or:**

- Main monitor: Charts + platform
- Second monitor: Discord full-screen on #trading-signals

## Troubleshooting

### Webhook not posting

**Check:**
- Webhook URL is correct
- Webhook not deleted in Discord
- Channel still exists
- n8n workflow active

**Fix:**
- Verify webhook in Discord → Integrations
- Check n8n execution logs
- Test webhook manually with curl

### Not receiving notifications

**Check:**
- Discord notifications enabled globally
- Server notifications enabled
- Channel notifications set to "All Messages"
- Do Not Disturb mode OFF

**Fix:**
- Check notification settings at all levels
- Disable Do Not Disturb
- Ensure Discord is open (desktop) or app is running (mobile)

### Messages appearing in wrong channel

**Check:**
- Webhook URL matches intended channel
- Webhook configuration in Discord

**Fix:**
- Verify webhook channel in Discord settings
- Update n8n with correct webhook URL

### Formatting not working

**Check:**
- Markdown syntax is correct
- Embeds JSON is valid
- No special characters breaking format

**Fix:**
- Test Markdown in Discord manually
- Validate JSON structure
- Escape special characters

## Cost

**Free!** Discord is completely free:
- No limits on messages (within rate limits)
- No webhook costs
- No subscription needed
- Unlimited servers and channels

## Comparison: Discord vs Telegram

| Feature | Discord | Telegram |
|---------|---------|----------|
| Desktop Experience | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| Mobile Experience | ⭐⭐⭐⭐ Great | ⭐⭐⭐⭐⭐ Excellent |
| Formatting | ⭐⭐⭐⭐⭐ Rich embeds | ⭐⭐⭐ Markdown |
| Setup Complexity | ⭐⭐⭐⭐⭐ Very easy | ⭐⭐⭐⭐ Easy |
| Notification Speed | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Instant |
| Team Collaboration | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |

**Recommendation:** Use both! Telegram for mobile, Discord for desktop.

## Testing Checklist

✅ Server created
✅ Channel created
✅ Webhook created and URL copied
✅ Webhook configured in n8n
✅ Test message received
✅ Formatting looks good
✅ Notifications enabled
✅ Sound works
✅ End-to-end signal flow tested

## Next Steps

✅ Discord configured
→ Test with live signals
→ Adjust notification preferences
→ Consider creating multiple channels for different quality levels
→ Set up mobile app for on-the-go alerts

---

**Need Help?**
- Discord Support: https://support.discord.com
- Webhooks Guide: https://discord.com/developers/docs/resources/webhook
- Community: https://discord.com/community
