# FIGMA PROMPT: TradeFly Options Trading Dashboard

## Design Brief

Create a **professional, institutional-grade options trading dashboard** for TradeFly AI - a real-time algorithmic options trading platform. This is a customer-facing SaaS product used by traders during active market hours for high-stakes decision-making.

---

## Design Requirements

### 1. User Context
- **Who:** Active options traders (retail to semi-professional)
- **When:** During market hours (9:30 AM - 4:00 PM ET) under time pressure
- **Primary decision:** "Which signal should I trade right now?"
- **Failure definition:** Missing a profitable signal or entering a bad trade due to unclear information
- **UI Mode:** MODE_SAAS (customer-facing, balanced density, strong clarity)

### 2. Core Principle
**CLARITY UNDER PRESSURE** - Every element must help traders make fast, confident decisions. Information density is high, but hierarchy is crystal clear. This is NOT a generic dashboard - it's a trading workstation.

---

## Dashboard Sections (Priority Order)

### SECTION 1: Market Status Bar (Top Banner - Always Visible)
**Purpose:** Immediate market context - is it even safe to trade right now?

**Required Elements:**
- Market status indicator (OPEN 🟢 / CLOSED 🔴 / PRE-MARKET ⚠️)
- Current ET time (live clock)
- Session indicator:
  - 🔥 MORNING MOMENTUM (9:30-11:00 AM) - prime trading window
  - 📊 MID-DAY (11:00 AM - 3:00 PM) - lower quality signals
  - ⚡ POWER HOUR (3:00-4:00 PM) - prime trading window
  - 🌙 CLOSED (4:00 PM+)
- Time until market close (countdown)
- SPY/QQQ current prices (market direction context)

**Design Notes:**
- Use color to show trading windows: green for MORNING/POWER HOUR, yellow for MID-DAY, red for CLOSED
- Make session name prominent - traders need to know if they should even be looking at signals
- Clock must be ET timezone (market hours are ET-based)

---

### SECTION 2: Top Movers Scanner (Below Market Status)
**Purpose:** See what's moving RIGHT NOW - momentum opportunities

**Required Elements:**
- Horizontal scrolling ticker (auto-scroll, pausable on hover)
- Each ticker item shows:
  - Symbol (bold, large)
  - Current price
  - % change (color-coded: green +, red -)
  - Volume indicator (e.g., "2.5x avg" if volume is unusual)
- Summary line: "Tracking 20 stocks: 7 gainers, 13 losers"
- Last refresh time

**Design Notes:**
- Ticker should feel LIVE - use smooth scrolling animation
- % changes should be impossible to miss (large, bold, color)
- Volume multiplier is critical - show "🔥" icon for 3x+ volume

---

### SECTION 3: Signal Filters Panel (Collapsible Sidebar or Top Filter Bar)
**Purpose:** Narrow down signals to trader's criteria

**Filter Categories:**

#### Trading Strategy
- ALL Strategies
- ⚡ Scalping (1-5 min holds, 10-20% targets)
- 🚀 Momentum (15min-2hr, 30-100% targets)
- 📊 Volume Spike (smart money following)
- 📈 Swing (1-5 day holds) [if implemented]

#### Confidence Level (Slider or Dropdown)
- 50%+ (show all)
- 60%+ (good signals)
- 70%+ (strong signals)
- 80%+ (very strong)
- 90%+ (institutional-grade only)

#### Entry Price Range
- Min: $0.01
- Max: $50.00
- Quick presets: Under $1, $1-$5, $5-$10, $10+

#### Days to Expiration (DTE)
- ALL Expirations
- 0-3 DTE (same week - high risk/reward)
- 4-7 DTE (weekly)
- 7-14 DTE
- 14-30 DTE (monthly)
- 30-60 DTE
- 60-90 DTE
- 90+ DTE (LEAPs)

#### Moneyness (Option strike vs stock price)
- ALL Options
- 💰 Deep ITM (>10% in the money)
- 💵 ITM (in the money)
- 🎯 ATM (at the money - usually highest volume)
- 📉 OTM (out of the money)
- 🎲 Far OTM (>10% OTM - lottery tickets)

#### Delta Range (Slider)
- 0.20 - 0.99
- Sweet spot indicator at 0.40-0.70 (institutional range)

#### Greeks Filters (Advanced - Collapsible)
- Min Delta, Max Delta
- Min Gamma
- Max Theta (decay rate)
- Min Vega (volatility sensitivity)

**Design Notes:**
- Filters should be persistent (don't reset on page refresh)
- Show active filter count badge (e.g., "5 filters active")
- "Reset All" button should be prominent when filters are active
- Consider filter presets: "High Confidence", "Affordable (<$5)", "Same Week"

---

### SECTION 4: Signals Feed (Main Content - Card Grid)
**Purpose:** THE MONEY SECTION - actual trading opportunities

**Signal Card Design (Each Card):**

#### Card Header
- **Symbol + Strike + Type** (e.g., "AAPL $150 CALL")
  - Make symbol HUGE and bold
  - Strike and type should be immediately clear
- **Expiration Date + DTE** (e.g., "Dec 20, 2025 • 4 DTE")
- **Confidence Badge** (e.g., "85%" - color-coded: red <70%, yellow 70-84%, green 85-94%, blue 95%+)
- **Strategy Tag** (pill/badge: "SCALP" / "MOMENTUM" / "VOLUME SPIKE")

#### Card Body (Price Action - Most Critical Section)
**3-column grid:**

| ENTRY | TARGET | STOP |
|-------|--------|------|
| $2.50 (BID: ask price) | $3.00 (+20%) | $2.00 (-20%) |

- Entry = current ASK price (what you'll actually pay)
- Target = profit goal (show % gain)
- Stop = hard stop loss (show % loss)
- Color code: entry (blue), target (green), stop (red)
- Risk/Reward ratio displayed clearly (e.g., "R/R: 2.5:1")

#### Card Details (Expandable or Always Visible)
- **Signal Reason** (exact quote from API):
  - Example: "Scalp: 3.2% momentum + RSI 35 oversold + 1200 vol"
  - Must show NUMBERS, not vague descriptions
- **Contract Details:**
  - Underlying price: $152.50
  - Strike: $150
  - Moneyness: "ATM" (at the money)
- **Greeks:**
  - Delta: 0.45 (how much option moves with stock)
  - Gamma: 0.03 (delta acceleration)
  - Theta: -0.15 (daily decay)
  - Vega: 0.22 (volatility sensitivity)
- **Volume Metrics:**
  - Current volume: 1,250 contracts
  - vs 30-day avg: 3.2x (show multiplier - critical!)
  - Bid-ask spread: $0.05 (tightness = liquidity)

#### Card Actions
- **Primary Button:** "Trade on [Broker Name]" or "Copy Contract ID"
- **Secondary Actions:**
  - 📋 Copy contract symbol (OCC format)
  - 📊 View chart
  - ⏰ Set price alert
  - 🔔 Watch this signal

#### Card Footer (Metadata)
- Timestamp: "Generated 2 minutes ago"
- Signal ID (for tracking)

**Design Notes:**
- Cards should feel scannable - key info (symbol, confidence, entry price) must pop
- Use color intentionally:
  - Green = profit (target price)
  - Red = loss (stop price)
  - Blue/purple = neutral (entry, confidence)
- Consider "HOT SIGNAL" badge for signals generated in last 5 minutes
- Show time decay: signals get less prominent as they age

---

### SECTION 5: Active Positions Panel (Sidebar or Modal)
**Purpose:** Track open trades - where am I at RIGHT NOW?

**For Each Active Position:**
- Symbol + Strike + Type
- Entry price vs Current price
- Unrealized P/L: $+125 (+8.5%) - large, color-coded
- Exit strategy:
  - 🎯 Target: $3.00 (if not hit yet)
  - 🛑 Stop: $2.00
  - ⏱️ Trailing stop: $2.75 (25% trail)
  - ⏰ Max hold time: 1:45 remaining (2hr max)
- Actions:
  - Close position
  - Adjust stop/target
  - Take 50% profit (Najarians rule - automatic at 2x gain)

**Summary Stats:**
- Total positions: 2/3 (max 3 concurrent)
- Total P/L today: +$245 (+2.1%) - HUGE, color-coded
- Daily limit remaining: -0.9% until halt (3% max loss)
- Buying power available: $8,500

**Design Notes:**
- P/L numbers should be MASSIVE - this is what traders care about
- Use red/green backgrounds for extreme P/L (not just text color)
- Show proximity to daily loss limit clearly (progress bar?)
- "Take 50% profit" button should be prominent when position hits 2x

---

### SECTION 6: Performance Dashboard (Separate Tab or Modal)
**Purpose:** Am I actually making money? What's working?

**Key Metrics:**

#### Today
- Total P/L: $+450 (+3.8%)
- Win rate: 7/10 (70%)
- Average R/R achieved: 2.1:1
- Best trade: NVDA $140 CALL (+45%)
- Worst trade: TSLA $250 PUT (-18%)

#### This Week
- Total P/L: $+1,240 (+10.5%)
- Win rate: 18/25 (72%)
- Profit factor: 2.4 (gross profit / gross loss)

#### Strategy Performance (Table)
| Strategy | Trades | Win Rate | Avg R/R | Total P/L |
|----------|--------|----------|---------|-----------|
| SCALP | 15 | 73% | 1.8:1 | +$320 |
| MOMENTUM | 8 | 75% | 2.5:1 | +$680 |
| VOLUME | 2 | 50% | 3.0:1 | +$240 |

#### Time-of-Day Performance
- Morning (9:30-11AM): 80% win rate (12/15 trades) - BEST
- Mid-day (11AM-3PM): 60% win rate (3/5 trades)
- Power Hour (3-4PM): 75% win rate (3/4 trades)

**Design Notes:**
- Use data visualization: bar charts for strategy performance, line chart for P/L over time
- Highlight best-performing strategy (auto-suggest focusing on it)
- Show "morning momentum is your edge" if data supports it

---

### SECTION 7: Risk Management Panel (Always Visible - Sidebar or Top Bar)
**Purpose:** Don't blow up the account

**Risk Indicators (Traffic Light System):**

#### Position Limits
- 🟢 2/3 positions (1 slot available)
- 🟡 3/3 positions (MAX - can't add more)
- 🔴 3/3 + daily loss near limit (DANGER)

#### Daily Loss Limit
- Progress bar showing proximity to -3% limit
- Example: "-1.2% / -3.0% limit" (green)
- Example: "-2.7% / -3.0% limit" (red - WARNING)
- "Circuit breaker will halt trading at -3.0%"

#### Account Risk Per Trade
- Current setting: 2% ($200 on $10k account)
- Suggested position size for next trade: 8 contracts
- "Risking $200 to make $400 (2:1 R/R)"

**Design Notes:**
- Use actual traffic light colors (green/yellow/red) - universally understood
- Progress bars should fill toward red (danger visualization)
- When near daily limit, make warning IMPOSSIBLE to miss (flash, large text)

---

### SECTION 8: Educational Tooltips & Context
**Purpose:** Help traders understand what they're looking at

**Tooltip Examples:**
- Delta: "How much option price moves when stock moves $1. Delta 0.50 = $0.50 option move per $1 stock move"
- Theta: "Daily time decay. -$0.15 means option loses $15/day in value from time passing"
- Moneyness ATM: "Strike price equals stock price. Usually highest volume and liquidity"
- Volume 3.2x: "3.2 times normal volume - unusual activity detected"
- R/R 2:1: "Risk $1 to make $2. Minimum institutional standard"

**Design Notes:**
- Tooltips should be concise (1-2 sentences max)
- Use "?" icon next to technical terms
- Consider a "Learn" modal with deeper explanations

---

## Required UI States

### 1. Loading State
- Skeleton cards for signals (show structure without data)
- "Scanning 5,000+ options contracts..." with progress indicator
- Don't block the UI - show what's ready first

### 2. Empty State (No Signals)
- 📊 Icon + message: "No Signals Found"
- Explanation: "Current filters are very strict. Try:"
  - Lower confidence threshold
  - Wider price range
  - More expiration dates
- Show when filters were last applied: "Last scan: 2 minutes ago"
- "Refresh Signals" button

### 3. Error State
- ⚠️ Icon + message: "Unable to Load Signals"
- Technical details (for debugging): "API returned 500"
- Actions:
  - "Retry" button
  - "Check System Status" link
- Don't lose user's filter settings

### 4. Success State (Has Signals)
- Show signal count: "Found 12 signals matching your criteria"
- Sort options: Confidence (high to low), Time (newest first), Price (low to high)
- Auto-refresh indicator: "Refreshing every 30 seconds"

### 5. Market Closed State
- 🌙 Icon + "Market Closed"
- Next open time: "Opens tomorrow at 9:30 AM ET (in 14h 23m)"
- Still show historical signals (for planning)
- "Get notified when market opens" option

---

## Design System Guidelines

### Typography
- **Headings:** Bold, sans-serif (Inter, SF Pro, or similar)
- **Numbers (prices, P/L):** Monospace font (for alignment)
- **Symbol tickers:** All-caps, extra bold, 18-24px
- **Body text:** 14-16px, legible at arm's length

### Color Palette
**Functional Colors:**
- Green (#10b981): Profit, target price, bullish signals, OPEN status
- Red (#ef4444): Loss, stop price, bearish signals, CLOSED status
- Blue (#3b82f6): Neutral actions, entry price, informational
- Yellow (#f59e0b): Warnings, mid-day session, moderate confidence
- Purple (#8b5cf6): High confidence signals, premium features

**UI Background:**
- Dark mode primary (default): #0a0a0a to #1a1a1a
- Card backgrounds: Slightly lighter (#1f1f1f)
- Borders: Subtle (#2a2a2a)

**Text:**
- Primary text: #ffffff (white)
- Secondary text: #9ca3af (gray)
- Muted text: #6b7280 (darker gray)

### Spacing
- Use 8px grid system
- Card padding: 16-24px
- Section gaps: 24px
- Dense information areas: 8-12px gaps

### Iconography
- Use emojis for quick scanning: 🔥 hot, ⚡ fast, 📊 data, 🎯 target, 🛑 stop
- Or use consistent icon set (Heroicons, Lucide, etc.)
- Icons should enhance, not replace text labels

---

## Mobile Considerations
**Priority 1: Single Signal View**
- Show one signal card at a time (swipeable carousel)
- Collapse filters into bottom sheet
- Market status bar stays pinned to top
- Quick actions (Trade, Watch, Dismiss) as bottom buttons

**Priority 2: Essential Metrics Only**
- Show: Symbol, Confidence, Entry/Target/Stop, Reason
- Hide by default: Greeks, detailed volume metrics
- "More details" expands to show full info

---

## Interaction Patterns

### Auto-Refresh
- Signals refresh every 30 seconds
- Show countdown: "Next refresh in 0:28"
- Pause auto-refresh when user is interacting with a card
- Visual indicator when new signals arrive (badge, toast notification)

### Keyboard Shortcuts (Power Users)
- `/` - Focus filter search
- `r` - Refresh signals
- `←→` - Navigate between signal cards
- `Enter` - Trade/copy selected signal
- `Esc` - Close modals/expanded views

### Notifications
- Browser notification when high-confidence signal (90%+) appears
- Sound alert option (toggle)
- Desktop alerts for position exits (stop hit, target reached)

---

## Accessibility Requirements (WCAG AA Minimum)

- Color is not the only indicator (use icons + text)
- All interactive elements keyboard accessible
- Focus states clearly visible
- Text contrast ratio >= 4.5:1
- Alt text for all icons/images
- Screen reader announces signal updates

---

## Performance Targets

- Initial load: <2 seconds
- Signal card render: <100ms per card
- Filter application: <300ms (feel instant)
- Smooth 60fps scrolling

---

## Export/Share Features

- **Screenshot Signal:** Generate shareable image of signal card
- **Copy Contract Symbol:** One-click copy of OCC symbol
- **Export Trade Log:** Download CSV of all trades (for taxes, analysis)
- **Share Strategy Performance:** Generate weekly report card

---

## Final Design Checklist

Before finalizing:
- [ ] Can a trader identify the best signal in <3 seconds?
- [ ] Is the market status instantly obvious?
- [ ] Are profit/loss numbers impossible to miss?
- [ ] Do risk management warnings scream when needed?
- [ ] Can a trader execute a trade in <5 clicks?
- [ ] Is every piece of information justified (no decorative elements)?
- [ ] Do all states (loading, empty, error) have clear next actions?
- [ ] Is this usable under time pressure during market hours?

---

## Design Inspiration (DON'T Copy - Learn From)

**Good References:**
- Bloomberg Terminal (information density done right)
- Robinhood (simplicity for options chains)
- TradingView (chart clarity)
- Stripe Dashboard (clear metrics, good hierarchy)

**Avoid:**
- Generic SaaS dashboards (too much whitespace)
- Coinbase (too simplified - this is serious trading)
- Traditional brokerage UIs (outdated, cluttered)

---

## Final Note

This is a **trading tool, not a portfolio tracker**. Every pixel should help traders:
1. Identify opportunities fast
2. Understand risk clearly
3. Execute with confidence
4. Learn from results

**If it doesn't serve one of these goals, delete it.**
