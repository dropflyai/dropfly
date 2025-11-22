# 🎨 Engine Selector UX Design Document

## Research Summary

### Key Findings from Industry Leaders:

**Runway's Approach:**
- Model selector in **bottom-left corner** (persistent, unobtrusive)
- Recommendation: "Try Turbo first (cheaper/faster), upgrade to full if needed"
- Shows: Name + Speed + Cost differentiator
- Example: "Gen-4 Turbo (3x faster, 5 credits/sec)" vs "Gen-4 (Premium quality, 12 credits/sec)"

**Midjourney's Approach:**
- **Dual-method selection**:
  1. Quick: Add `--v 6` to prompt
  2. Persistent: `/settings` command for default
- Minimalist UI: Green button = selected
- Focuses on version number, not overwhelming specs

**Luma Dream Machine (Best UX):**
- "Most beautiful UX design" - clean, modern
- Glass effects, pastel gradients
- "The Apple of AI video generation"
- Elegant, clean, creatively organized

### UX Patterns for AI Model Selectors:

1. **Progressive Disclosure**: Start simple, reveal complexity on demand
2. **Smart Defaults**: Auto-select best for user's tier
3. **Real-time Feedback**: Show cost/tokens as they select
4. **Visual Hierarchy**: Group by quality tier, not alphabetically
5. **Guidance**: Help users choose (badges, recommendations)

---

## Our Design Strategy

### 1. **Three-Tier UI Approach**

**Level 1: Simple (Default View)**
```
┌─────────────────────────────────────────────┐
│ Video Engine                                │
│ ┌─────────────────────────────────────────┐ │
│ │ ● Auto (Recommended)                    │ │
│ │   System picks best for your tier       │ │
│ └─────────────────────────────────────────┘ │
│ [Advanced Options ▼]                        │
└─────────────────────────────────────────────┘
```

**Level 2: Categorized (Expanded)**
```
┌─────────────────────────────────────────────┐
│ Video Engine                   🎯 Your Plan │
│ ┌─────────────────────────────────────────┐ │
│ │ ● Auto (Recommended) - FREE             │ │
│ │   System picks: Hunyuan Video           │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ FREE TIER OPTIONS (5)                        │
│ ○ Hunyuan Video         6 tokens/sec  ⭐    │
│   Beats Gen-3 • 16 seconds                   │
│ ○ Hailuo 02             3 tokens/sec        │
│   Ultra-fast • #2 globally                   │
│ ○ Seedance Pro          4 tokens/sec        │
│   Budget king • Maximum performance          │
│                                              │
│ 🔒 STARTER TIER (Upgrade to unlock)          │
│ ○ Kling 2.1            10 tokens/sec  👑    │
│   #1 Ranked • Professional                   │
│                                              │
│ [Show All 25 Engines →]                     │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Cost Preview                             │ │
│ │ 8 sec video = 48 tokens                  │ │
│ │ Your balance: 100 tokens (52 remaining)  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Level 3: Full Comparison (Modal)**
```
┌──────────────────────────────────────────────────────────────┐
│ Compare All Engines                                     [×]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Filter: [All] [Free] [Starter] [Pro]   Sort: [Best Value ▼] │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ FREE TIER                                                 │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ ● Hunyuan Video          $0.06/sec  ⭐ RECOMMENDED       │ │
│ │   Provider: Tencent  •  13B parameters                    │ │
│ │   Max: 16s  •  1080p  •  Beats Gen-3 in benchmarks       │ │
│ │   [Select]  [Learn More]                                  │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ ○ Hailuo 02              $0.028/sec  💨 FASTEST          │ │
│ │   Provider: Minimax  •  #2 Globally Ranked               │ │
│ │   Max: 10s  •  1080p  •  2.5x faster inference           │ │
│ │   [Select]  [Learn More]                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔒 STARTER TIER - Upgrade to unlock                      │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ ○ Kling 2.1              $0.10/sec  👑 #1 RANKED        │ │
│ │   Provider: Kuaishou  •  Tied #1 (93.5/100)             │ │
│ │   Max: 10s  •  1080p  •  Best motion realism            │ │
│ │   [Upgrade Plan]                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2. **Smart Features**

**Adaptive Recommendations:**
- Free tier: Highlight `hunyuan-video` (best value)
- Starter tier: Suggest `kling-2.1` (best quality at tier)
- Pro tier: Default to `veo-3.1` (premium features)
- Show "upgrade" path for better engines

**Real-time Cost Calculator:**
```typescript
const calculateTokens = (seconds: number, pricePerSecond: number) => {
  return Math.ceil(seconds * pricePerSecond * 100); // tokens
};
```

**Visual Indicators:**
- ⭐ = Recommended for your tier
- 👑 = Highest ranked (#1)
- 💨 = Fastest generation
- 🎬 = Best for social media
- 🔊 = Has native audio
- 🔒 = Requires upgrade

### 3. **Information Architecture**

**Grouping Strategy:**
```
1. Auto (Smart Default)
2. Your Tier Engines (Accessible)
   - Sort by: Best Value → Quality → Speed
3. Higher Tier Engines (Locked, teasers)
   - Show 1-2 to encourage upgrade
```

**Comparison Dimensions:**
1. **Cost** - Tokens per second (most important)
2. **Quality** - Ranking/benchmark scores
3. **Speed** - Generation time
4. **Features** - Audio, length, resolution
5. **Use Case** - Social media, cinematic, etc.

### 4. **Token Cost Display**

**Always Visible:**
```
┌────────────────────────────────────┐
│ Your Tokens: 100                   │
│ This video: 48 tokens (8 seconds)  │
│ After: 52 tokens remaining          │
└────────────────────────────────────┘
```

**Interactive Slider:**
```
Video Length: [====●====] 8 seconds
              1         15

Cost with Hunyuan: 48 tokens
Cost with Kling: 80 tokens  (+67%)
```

---

## Implementation Plan

### Phase 1: Basic Selector (MVP)
- [x] Auto-select working in API
- [ ] Simple dropdown with tier engines
- [ ] Show cost per engine
- [ ] Real-time token calculator

### Phase 2: Enhanced UX
- [ ] Categorized view (tier-based grouping)
- [ ] Visual badges (⭐ 👑 💨)
- [ ] Locked engine teasers
- [ ] Upgrade prompts

### Phase 3: Advanced Features
- [ ] Full comparison modal
- [ ] Filter/sort capabilities
- [ ] Save preferred engine
- [ ] A/B testing suggestions

---

## Component Structure

```typescript
<VideoEngineSelector
  userTier="free"
  tokenBalance={100}
  videoDuration={8}
  onChange={(engine, cost) => {}}
  defaultEngine="auto"
  showComparison={false}
/>

Children:
  ├─ <EngineDropdown />       // Simple selector
  ├─ <TokenCalculator />       // Real-time cost
  ├─ <EngineBadges />          // Visual indicators
  ├─ <TierUpgradePrompt />     // When locked clicked
  └─ <ComparisonModal />       // Full comparison
```

---

## Key UX Principles

### 1. **Don't Overwhelm**
- Default to "Auto" - 80% of users shouldn't need to choose
- Progressive disclosure - show complexity only when needed
- Clear visual hierarchy - important info first

### 2. **Build Trust**
- Explain why we recommend certain engines
- Show transparent pricing (tokens, not just dollars)
- Provide benchmarks and rankings from trusted sources

### 3. **Encourage Exploration**
- Make it easy to compare
- Preview feature differences
- Show upgrade benefits clearly

### 4. **Optimize for Speed**
- Quick selection (single click for defaults)
- Persistent preferences
- Keyboard shortcuts for power users

---

## Copywriting Guidelines

### For "Auto" Option:
✅ "Auto (Recommended) - We pick the best engine for your tier"
❌ "Automatic Engine Selection Algorithm"

### For Engine Names:
✅ "Hunyuan Video - Best value, beats Gen-3"
❌ "Hunyuan Video (Tencent, 13B parameters, v1.0)"

### For Locked Features:
✅ "Upgrade to Starter for Kling 2.1 (#1 ranked engine)"
❌ "This feature requires a paid subscription"

### For Cost:
✅ "8 sec video = 48 tokens (48¢ value)"
❌ "Cost: 6 tokens/second × 8 seconds = 48 tokens total"

---

## Success Metrics

**Primary Goals:**
1. 80%+ users stick with "Auto" (good defaults)
2. <5 seconds to select an engine (fast UX)
3. <10% selection errors (clear information)

**Secondary Goals:**
1. 20% upgrade rate from engine comparison
2. High satisfaction with engine quality
3. Low support tickets about tokens/costs

---

## Next Steps

1. ✅ Research complete
2. ⏳ Implement basic dropdown selector
3. ⏳ Add token cost calculator
4. ⏳ Add tier-based grouping
5. ⏳ Build comparison modal
6. ⏳ Test with users
7. ⏳ Iterate based on feedback

---

**Design Philosophy:**
> "Make the simple things simple, and the complex things possible."
>
> Default to smart automation, but give power users the control they need to optimize for their specific needs.
