# DropFly SocialSync Empire - True Automation Architecture

## Executive Summary

This is a **campaign-first, automation-first** social media platform. Clients don't create individual posts - they create **campaigns** that run themselves.

---

## The DropFly Way: Campaign-Based Automation

### ❌ What We're NOT Building
- One-off content creators (like InVideo, Runway, Kling)
- Manual post schedulers (like Buffer, Hootsuite)
- Video editing tools (like CapCut, Premiere)

### ✅ What We ARE Building
- **Set-and-forget campaign automation**
- **AI-powered content pipelines**
- **Multi-platform publishing on autopilot**
- **Performance-driven optimization**

---

## Core Concept: Campaigns

### What is a Campaign?

A campaign is a **self-running content engine** configured once and automated forever.

```
Campaign = Topic/Niche + Platforms + Frequency + AI Instructions
```

**Example Campaign:**
```json
{
  "name": "Fitness Tips Daily",
  "niche": "Home workouts for busy professionals",
  "platforms": ["tiktok", "instagram", "youtube_shorts"],
  "frequency": "daily",
  "post_time": "06:00 AM EST",
  "video_engine": "kling-2.1",
  "voice": "energetic",
  "duration": "30-60 seconds",
  "status": "active"
}
```

**What Happens Automatically:**
1. Every day at 6 AM, system generates a new script about home workouts
2. Creates video using Kling 2.1
3. Adds trending hashtags and hook
4. Posts to TikTok, Instagram, and YouTube simultaneously
5. Tracks performance
6. Client does NOTHING except review dashboard weekly

---

## User Flow: Campaign-First Experience

### Step 1: Create Campaign (2 minutes)
```
User lands on /campaigns
↓
Click "Create New Campaign"
↓
Fill simple form:
  - Campaign name
  - What's your niche/topic?
  - Which platforms?
  - How often? (daily/3x week/weekly)
  - What time?
  - Video style preference
↓
Click "Launch Campaign"
↓
DONE - Campaign runs forever
```

### Step 2: Monitor Dashboard (optional)
```
User visits /campaigns/[id]
↓
See all auto-generated posts
↓
Performance metrics
↓
Pause/Edit campaign if needed
```

### Step 3: Scale (when ready)
```
User creates more campaigns
OR
Upgrades tier for more posts/month
```

---

## Technical Architecture

### Database Schema Changes Needed

```sql
-- New table: campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  platforms TEXT[] NOT NULL, -- ['tiktok', 'instagram', 'youtube']
  frequency TEXT NOT NULL, -- 'daily', '3x_week', 'weekly', 'custom'
  post_times TEXT[] NOT NULL, -- ['06:00', '14:00', '18:00']
  timezone TEXT DEFAULT 'America/New_York',

  -- Video settings
  video_engine TEXT DEFAULT 'kling-2.1',
  video_duration_min INTEGER DEFAULT 30,
  video_duration_max INTEGER DEFAULT 60,
  video_style TEXT, -- 'energetic', 'calm', 'professional', etc.

  -- AI instructions
  tone TEXT, -- 'casual', 'professional', 'humorous'
  target_audience TEXT,
  brand_voice JSONB,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
  next_post_at TIMESTAMPTZ,
  last_post_at TIMESTAMPTZ,

  -- Stats
  total_posts INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table: campaign_posts (links campaigns to scheduled_posts)
CREATE TABLE campaign_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  scheduled_post_id UUID REFERENCES scheduled_posts(id),
  content_id UUID REFERENCES content(id),

  -- Post generation metadata
  topic TEXT,
  script JSONB,
  video_url TEXT,
  thumbnail_url TEXT,

  -- Performance
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'ready', 'posted', 'failed'
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

-- Update scheduled_posts to reference campaigns
ALTER TABLE scheduled_posts ADD COLUMN campaign_id UUID REFERENCES campaigns(id);

-- New table: campaign_analytics (daily rollups)
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  posts_generated INTEGER DEFAULT 0,
  posts_published INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL,
  top_performing_post_id UUID,
  UNIQUE(campaign_id, date)
);
```

---

## API Endpoints Needed

### Campaign Management
```typescript
POST /api/campaigns
  Input: { name, niche, platforms, frequency, video_settings }
  Output: { campaignId, next_post_at }

GET /api/campaigns
  Output: [ ...campaigns ]

GET /api/campaigns/[id]
  Output: { campaign, recent_posts, analytics }

PATCH /api/campaigns/[id]
  Input: { status, settings_to_update }
  Output: { updated_campaign }

DELETE /api/campaigns/[id]
  Output: { success }
```

### Campaign Automation (Cron Jobs)
```typescript
POST /api/cron/generate-campaign-posts
  - Runs every hour
  - Finds campaigns with next_post_at <= NOW()
  - Generates content for due posts
  - Updates next_post_at based on frequency

POST /api/cron/publish-campaign-posts
  - Runs every 5 minutes
  - Finds campaign_posts with status='ready' and scheduled_for <= NOW()
  - Publishes via Ayrshare
  - Updates status to 'posted'

POST /api/cron/collect-analytics
  - Runs every 6 hours
  - Fetches performance data from Ayrshare
  - Updates campaign_posts and campaign_analytics
  - Flags top/bottom performers for AI learning
```

### Campaign Generation Pipeline
```typescript
POST /api/campaigns/[id]/generate-post
  Process:
  1. Get campaign settings
  2. Generate trending topic within niche (Claude)
  3. Generate script (/api/ai/generate-script)
  4. Generate video (/api/video/generate)
  5. Generate captions/hashtags (/api/ai/tools)
  6. Create scheduled_post record
  7. Deduct tokens (full pipeline cost)
  Output: { campaign_post_id, scheduled_for }
```

---

## Automation Flow (Complete Pipeline)

### Daily Campaign Execution

```
CRON JOB: Every Hour
├─> Check campaigns table for next_post_at <= NOW()
├─> For each due campaign:
    │
    ├─> Step 1: Generate Topic
    │   └─> POST /api/trends/get (with niche filter)
    │   └─> Claude selects best trending topic
    │
    ├─> Step 2: Generate Script
    │   └─> POST /api/ai/generate-script
    │   └─> Input: topic + campaign.tone + campaign.target_audience
    │   └─> Output: { hook, script, cta, hashtags }
    │
    ├─> Step 3: Generate Video
    │   └─> POST /api/video/generate
    │   └─> Engine: campaign.video_engine
    │   └─> Duration: campaign.video_duration_min-max
    │   └─> Prompt: script + campaign.video_style
    │   └─> Output: { video_url, thumbnail_url }
    │
    ├─> Step 4: Generate Social Copy
    │   └─> POST /api/ai/tools
    │   └─> Tools: caption, hashtags, hook
    │   └─> Platform-optimized for each in campaign.platforms
    │
    ├─> Step 5: Schedule Post
    │   └─> Create campaign_post record (status: 'ready')
    │   └─> Create scheduled_post for each platform
    │   └─> scheduled_for = campaign.next_post_time TODAY
    │
    ├─> Step 6: Update Campaign
    │   └─> Increment campaign.total_posts
    │   └─> Calculate next_post_at based on frequency
    │   └─> Deduct tokens (script + video + tools + posting)
    │
    └─> Step 7: Token Check
        └─> If user out of tokens: pause campaign + notify user
```

### Publishing Flow

```
CRON JOB: Every 5 Minutes
├─> Check scheduled_posts WHERE scheduled_for <= NOW() AND status='pending'
├─> For each due post:
    │
    ├─> Verify video is ready
    ├─> POST /api/social/post (Ayrshare)
    │   └─> platforms: post.platforms
    │   └─> media: video_url
    │   └─> caption: optimized for each platform
    │
    ├─> Update scheduled_post status to 'posted'
    ├─> Update campaign_post.posted_at
    └─> Log to campaign_analytics
```

### Analytics Collection

```
CRON JOB: Every 6 Hours
├─> GET /api/social/profiles (Ayrshare analytics)
├─> For each posted campaign_post:
    │
    ├─> Fetch views, likes, comments, shares from Ayrshare
    ├─> Calculate engagement_rate
    ├─> Update campaign_post analytics
    ├─> Update campaign totals
    │
    └─> Identify top/bottom 20% performers
        └─> Feed to AI for learning (future: auto-optimize)
```

---

## Infrastructure: What We'll Actually Use

### Existing & Ready (Use NOW)
1. **Supabase PostgreSQL** - Store campaigns, posts, analytics
2. **Supabase Cron** - Built-in scheduled functions
3. **Vercel Cron Jobs** - API route scheduling
4. **Anthropic Claude** - Script generation + topic selection
5. **FAL.AI** - Video generation (25 engines)
6. **Ayrshare** - Multi-platform posting
7. **OpenAI GPT-4** - Captions/hashtags/hooks

### Add Later (Phase 2)
1. **n8n** - Visual workflow builder for complex campaigns
2. **AWS S3** - Video storage for large files
3. **Redis** - Queue management for peak times

### Don't Need Right Now
- ❌ EC2 server (Vercel handles everything)
- ❌ Separate video storage (use Supabase/FAL.AI URLs)
- ❌ Complex queue systems (Vercel cron is enough for MVP)

---

## Token Economics: Campaign Costs

### Per Post (Full Pipeline)
```
Script generation:        7 tokens
Video generation:        75 tokens (avg for Kling 2.1, 45 sec)
Captions/hashtags:        3 tokens
Social posting:           5 tokens (multi-platform)
---
TOTAL PER POST:          90 tokens = $0.90
```

### Campaign Cost Examples

**Daily Posting (30 posts/month):**
- Cost: 30 × 90 = 2,700 tokens = $27/month
- Requires: **Pro Tier** (6,000 tokens/month = $79)
- **Margin: $52/month per client**

**3x Weekly (12 posts/month):**
- Cost: 12 × 90 = 1,080 tokens = $10.80/month
- Fits in: **Starter Tier** (2,000 tokens/month = $29)
- **Margin: $18.20/month per client**

**Weekly (4 posts/month):**
- Cost: 4 × 90 = 360 tokens = $3.60/month
- Fits in: **Free Tier** (300 tokens/month = $0)
- Wait... free tier can't afford even 1 full post!

### Revised Token Allocation

**Free Tier Should:**
- 300 tokens = 3 complete posts/month (script + video + post)
- OR unlimited scripts only (no video/posting)
- **Recommendation**: Free = scripts only, paid = full automation

**Starter Tier:**
- 2,000 tokens = 22 complete posts/month
- Perfect for: 3x weekly posting (12 posts) + extras
- **Sweet spot for solo creators**

**Pro Tier:**
- 6,000 tokens = 66 complete posts/month
- Perfect for: Daily posting (30) + 2 campaigns
- **Sweet spot for influencers/small businesses**

**Enterprise Tier:**
- 20,000 tokens = 222 complete posts/month
- Perfect for: Multiple daily campaigns (agencies)

---

## User Experience: Campaign Dashboard

### Main Dashboard (`/campaigns`)

```
┌─────────────────────────────────────────────────────────┐
│  Your Campaigns                    [+ New Campaign]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ 🔥 Fitness Tips Daily               [Active] │       │
│  │ TikTok • Instagram • YouTube                 │       │
│  │ Posts daily at 6:00 AM                       │       │
│  │                                               │       │
│  │ 📊 Last 7 days:                              │       │
│  │ 7 posts • 12.3K views • 4.2% engagement      │       │
│  │                                               │       │
│  │ Next post: Today 6:00 AM (2 hours)           │       │
│  │ [View Posts] [Edit] [Pause]                  │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ 💼 LinkedIn Business Tips      [Paused]     │       │
│  │ LinkedIn                                     │       │
│  │ Posts 3x/week at 9:00 AM                    │       │
│  │                                               │       │
│  │ ⚠️ Paused: Insufficient tokens               │       │
│  │ [Buy Tokens] [Edit] [Resume]                 │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Campaign Creation Flow (`/campaigns/new`)

```
Step 1: Campaign Basics
┌──────────────────────────────────────────┐
│ Campaign Name                            │
│ [Fitness Tips for Busy Professionals]    │
│                                           │
│ What's your niche?                       │
│ [Quick home workouts, no equipment]      │
│                                           │
│ Target Audience                          │
│ [30-45 year old professionals]           │
└──────────────────────────────────────────┘

Step 2: Platform Selection
┌──────────────────────────────────────────┐
│ Where should we post?                    │
│ ☑ TikTok                                 │
│ ☑ Instagram Reels                        │
│ ☑ YouTube Shorts                         │
│ ☐ LinkedIn                               │
│ ☐ Facebook                               │
└──────────────────────────────────────────┘

Step 3: Schedule
┌──────────────────────────────────────────┐
│ How often?                               │
│ ○ Daily                                  │
│ ● 3 times per week                       │
│ ○ Weekly                                 │
│ ○ Custom                                 │
│                                           │
│ What time?                               │
│ [06:00 AM] EST                           │
└──────────────────────────────────────────┘

Step 4: Video Style
┌──────────────────────────────────────────┐
│ Video Engine                             │
│ [Kling 2.1 ▼] (Recommended)              │
│                                           │
│ Duration                                 │
│ [30-60 seconds]                          │
│                                           │
│ Video Style                              │
│ ○ Energetic                              │
│ ● Professional                           │
│ ○ Calm & Relaxing                        │
│ ○ Fun & Quirky                           │
│                                           │
│ Tone                                     │
│ ● Motivational                           │
│ ○ Educational                            │
│ ○ Entertaining                           │
└──────────────────────────────────────────┘

Step 5: Review & Launch
┌──────────────────────────────────────────┐
│ Campaign Summary:                        │
│                                           │
│ • 3 posts per week                       │
│ • Posted to 3 platforms each             │
│ • ~12 posts/month                        │
│                                           │
│ Token Cost:                              │
│ ~1,080 tokens/month ($10.80)            │
│                                           │
│ Your Balance: 1,847 tokens               │
│ ✓ Sufficient for 2 months                │
│                                           │
│ [Launch Campaign] [Back]                 │
└──────────────────────────────────────────┘
```

### Campaign Detail View (`/campaigns/[id]`)

```
┌─────────────────────────────────────────────────────────┐
│  Fitness Tips Daily                          [⚙️ Edit]   │
│  Status: Active • TikTok, Instagram, YouTube            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 Performance (Last 30 days)                          │
│  ┌──────────┬──────────┬──────────┬───────────┐        │
│  │ 12 Posts │ 45.2K    │ 1,892    │ 4.2%      │        │
│  │          │ Views    │ Likes    │ Engagement│        │
│  └──────────┴──────────┴──────────┴───────────┘        │
│                                                          │
│  📅 Upcoming Posts                                      │
│  ┌─────────────────────────────────────────┐           │
│  │ Today 6:00 AM • "5 Min Morning Workout" │ Scheduled │
│  │ Feb 15 6:00 AM • Generating...          │ Pending   │
│  │ Feb 17 6:00 AM • Not yet generated      │ Pending   │
│  └─────────────────────────────────────────┘           │
│                                                          │
│  🎬 Recent Posts                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Thumbnail] "Desk Stretches for Office Workers"   │ │
│  │ Posted: Feb 12, 6:00 AM                           │ │
│  │ TikTok: 8.2K views • IG: 4.1K • YT: 2.8K          │ │
│  │ 👍 892 likes • 💬 45 comments • 🔁 23 shares      │ │
│  │ [View] [Repost] [Edit]                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  [Pause Campaign] [Delete Campaign]                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
**Goal: Basic campaign automation working**

**Database:**
- Create campaigns table
- Create campaign_posts table
- Migration script

**API Endpoints:**
- POST /api/campaigns (create)
- GET /api/campaigns (list)
- GET /api/campaigns/[id] (detail)
- POST /api/campaigns/[id]/generate-post (manual trigger for testing)

**Cron Jobs:**
- POST /api/cron/generate-campaign-posts (hourly)
- POST /api/cron/publish-campaign-posts (every 5 min)

**UI:**
- /campaigns (list view)
- /campaigns/new (creation flow)
- /campaigns/[id] (detail view)

**Test Case:**
- User creates 1 campaign
- System generates 1 post automatically
- Post publishes to TikTok at scheduled time
- User sees post in dashboard

---

### Phase 2: Polish (Week 3)
**Goal: Production-ready automation**

**Add:**
- Campaign pause/resume/edit
- Token validation before campaign creation
- Bulk post preview
- Error handling & notifications
- Campaign templates ("Fitness", "Business Tips", "Product Reviews")

**Optimize:**
- Batch generation (prepare next 3 posts in advance)
- Smart scheduling (post at best times based on analytics)
- Auto-pause when out of tokens

---

### Phase 3: Intelligence (Week 4+)
**Goal: Self-optimizing campaigns**

**Add:**
- POST /api/cron/collect-analytics (fetch performance data)
- Campaign analytics dashboard
- AI-powered insights ("Your posts perform better at 8 AM")
- Auto-optimization (test different hooks, adjust based on performance)
- A/B testing (generate 2 versions, post the winner)

---

## Technical Implementation Details

### Cron Job Setup (Vercel)

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/generate-campaign-posts",
      "schedule": "0 * * * *" // Every hour
    },
    {
      "path": "/api/cron/publish-campaign-posts",
      "schedule": "*/5 * * * *" // Every 5 minutes
    },
    {
      "path": "/api/cron/collect-analytics",
      "schedule": "0 */6 * * *" // Every 6 hours
    }
  ]
}
```

### Campaign Generation Logic

```typescript
// /api/cron/generate-campaign-posts/route.ts
export async function POST(req: Request) {
  // 1. Get due campaigns
  const { data: dueCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .lte('next_post_at', new Date().toISOString());

  for (const campaign of dueCampaigns) {
    // 2. Check user tokens
    const balance = await tokenService.getBalance(campaign.user_id);
    if (balance.balance < 90) { // Minimum for full post
      await pauseCampaign(campaign.id, 'insufficient_tokens');
      await notifyUser(campaign.user_id, 'tokens_low');
      continue;
    }

    try {
      // 3. Generate trending topic
      const topic = await generateTopicForCampaign(campaign);

      // 4. Generate script
      const script = await fetch('/api/ai/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          creatorMode: campaign.tone || 'ugc',
          platform: campaign.platforms[0],
          duration: `${campaign.video_duration_min}-${campaign.video_duration_max}`
        })
      });

      // 5. Generate video
      const video = await fetch('/api/video/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: script.script,
          engine: campaign.video_engine,
          duration: campaign.video_duration_min
        })
      });

      // 6. Generate social copy
      const socialCopy = await fetch('/api/ai/tools', {
        method: 'POST',
        body: JSON.stringify({
          tool: 'caption',
          script: script.script,
          platform: campaign.platforms
        })
      });

      // 7. Create campaign_post record
      const { data: campaignPost } = await supabase
        .from('campaign_posts')
        .insert({
          campaign_id: campaign.id,
          topic,
          script: script,
          video_url: video.url,
          thumbnail_url: video.thumbnail,
          status: 'ready'
        })
        .select()
        .single();

      // 8. Create scheduled_posts for each platform
      for (const platform of campaign.platforms) {
        await supabase.from('scheduled_posts').insert({
          user_id: campaign.user_id,
          campaign_id: campaign.id,
          platforms: [platform],
          post_content: {
            video_url: video.url,
            caption: socialCopy[platform],
            hashtags: script.hashtags
          },
          scheduled_for: getNextPostTime(campaign),
          status: 'pending'
        });
      }

      // 9. Update campaign
      await supabase
        .from('campaigns')
        .update({
          next_post_at: calculateNextPostTime(campaign),
          last_post_at: new Date().toISOString(),
          total_posts: campaign.total_posts + 1
        })
        .eq('id', campaign.id);

      // 10. Deduct tokens (done automatically by each API)

    } catch (error) {
      console.error(`Campaign ${campaign.id} generation failed:`, error);
      // Log error, don't pause campaign (retry next hour)
    }
  }

  return Response.json({ success: true, processed: dueCampaigns.length });
}
```

### Token Deduction Strategy

**Current Approach (Keep):**
- Each API endpoint deducts tokens upfront
- Refunds on failure
- Clean separation of concerns

**Campaign Addition:**
- Campaign creation: 0 tokens (just setup)
- Each post generation: Deducted by individual APIs
- If any step fails: Tokens refunded, retry next hour

---

## Migration Plan: From Current App to Campaign App

### Option A: Parallel (Recommended)
- Keep existing /create, /generate, /library pages
- Add new /campaigns section
- Let users choose workflow
- Eventually sunset old pages once campaigns proven

### Option B: Full Pivot
- Replace /create with /campaigns
- Convert /generate to campaign-based
- Migrate existing content to campaign structure

**Recommendation: Option A** - Don't break existing functionality, add campaigns alongside.

---

## Success Metrics

### User Engagement
- % of users who create at least 1 campaign
- Average campaigns per user
- Campaign retention (still active after 30 days)

### Automation Performance
- Posts generated automatically vs manual
- Success rate (generated vs failed)
- Average time from generation to publishing

### Business Metrics
- Token consumption per campaign
- Revenue per campaign (subscription tier)
- Churn rate for active campaign users

---

## Next Steps: What to Build First

### This Week (MVP Sprint)
1. **Database Migration** - Add campaigns tables
2. **API: Create Campaign** - POST /api/campaigns
3. **API: Generate Post** - POST /api/campaigns/[id]/generate-post (manual)
4. **UI: Campaign List** - /campaigns page
5. **UI: Create Campaign** - /campaigns/new flow
6. **Test End-to-End** - Create campaign → Generate 1 post → Verify

### Next Week
1. **Cron Job: Auto-Generate** - Hourly check for due posts
2. **Cron Job: Auto-Publish** - 5-min check for ready posts
3. **UI: Campaign Dashboard** - /campaigns/[id] detail view
4. **Token Validation** - Prevent campaigns without tokens
5. **Test Automation** - Create campaign → Wait 24hr → Verify auto-post

### Week 3
1. **Analytics Collection** - Cron job for performance data
2. **Campaign Pause/Resume** - When tokens run out
3. **User Notifications** - Email alerts for low tokens, failed posts
4. **Polish UI** - Better dashboards, loading states
5. **Production Deploy** - Full automation live

---

## The DropFly Difference

**Other Tools:**
- "Create a video" → Manual
- "Schedule a post" → One-off
- "Check analytics" → Reactive

**DropFly SocialSync Empire:**
- "Create a campaign" → Runs forever
- "Review dashboard" → Fully automated
- "Scale to 10 campaigns" → Still automated

**Tagline:** "Set it once. Automate forever."

---

This is the DropFly way. Automation-first. Campaign-driven. Client does nothing except grow their audience.

Ready to build?
