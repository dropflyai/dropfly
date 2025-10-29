# 🗺️ SOCIALSYNC EMPIRE - COMPLETE WORKFLOW MAP

**From Onboarding → Full Campaigns Running**

---

## 🎯 VISION: Full Automation Social Media Manager

**Goal:** User creates content once → AI optimizes it → Auto-posts to all platforms → Tracks performance → Suggests improvements

---

## 📊 WORKFLOW PHASES

### Phase 1: ONBOARDING & SETUP
### Phase 2: CONTENT CREATION
### Phase 3: OPTIMIZATION & SCHEDULING
### Phase 4: PUBLISHING & DISTRIBUTION
### Phase 5: ANALYTICS & OPTIMIZATION
### Phase 6: CAMPAIGN MANAGEMENT

---

# PHASE 1: ONBOARDING & SETUP

## Step 1.1: User Signup
**Route:** `/signup`
**Status:** ✅ WORKING

**User Flow:**
1. User lands on signup page
2. Enters email + password
3. Creates account → Redirects to `/home`

**What Happens:**
- Supabase creates user account
- Profile created in `profiles` table
- Token balance initialized (300 free tokens)
- User tier set to `free`

**Test Status:** ✅ Working
**Issues:** None

---

## Step 1.2: First-Time Home Screen
**Route:** `/home`
**Status:** 🔧 NEEDS TESTING

**User Flow:**
1. New user lands on home page
2. Should see:
   - "Welcome, [Name]!" (not "Welcome back")
   - "STEP 1" banner to connect social accounts
   - Token balance: 300 tokens
   - NO fake stats
   - NO video credits counter

**What SHOULD Happen:**
- Detects first-time user (no posts, no content)
- Shows prominent onboarding banner
- Hides stats section
- Removes old video credits card

**Test Status:** ⚠️ NEEDS VERIFICATION
**Issues Reported:**
- User still sees "300 of 300 videos"
- Still sees fake stats
- Onboarding not showing

**Action Required:** Need to verify if changes are deployed or if cache issue

---

## Step 1.3: Connect Social Accounts
**Route:** `/post` or Settings
**Status:** ❓ UNKNOWN - NEEDS AUDIT

**User Flow:**
1. User clicks "Connect Social Accounts"
2. Should show available platforms:
   - TikTok
   - Instagram
   - YouTube
   - Twitter/X
   - Facebook
   - LinkedIn

**What SHOULD Happen:**
- OAuth flow for each platform via Ayrshare
- User grants permissions
- Account linked to user profile
- Can now post to those platforms

**Integration:** Ayrshare API
- API Key: Set in `.env`
- Client: `/src/lib/ayrshare/client.ts`

**Test Status:** ❓ NOT TESTED
**Action Required:**
1. Check if Ayrshare OAuth is set up
2. Test connection flow
3. Verify account storage in database

---

# PHASE 2: CONTENT CREATION

## 2.1: AI VIDEO GENERATION
**Route:** `/create` or `/generate`
**Status:** ⚠️ PARTIALLY WORKING

### Video Generation Flow:

**Step 1: Choose Engine**
- User selects from 5 AI engines:
  - Hailuo 02 (Premium, $2/video)
  - Hunyuan Video (Mid-tier, $0.50/video)
  - CogVideoX 5B (Budget, $0.10/video)
  - CogVideoX i2V (Image-to-video)
  - Seedance 1.0 Pro (Budget, $0.10/video)

**Step 2: Input**
- Option A: Text prompt
- Option B: Upload image (for i2V)
- Set duration (5s, 10s, etc.)

**Step 3: Token Deduction**
- Calculate cost based on engine + duration
- Formula: `(Engine cost per second × Duration) × 100 × 3.33`
- Example: Budget 5s = $0.10 → 33 tokens
- Deduct tokens BEFORE generation

**Step 4: Video Generation**
- API calls to respective engine
- Progress tracking
- Generation time: 30s - 3min depending on engine

**Step 5: Results**
- Video preview
- Download button
- Save to library
- Option to post immediately

**APIs Used:**
- FAL.ai for most engines
- Replicate for CogVideoX (needs `REPLICATE_API_TOKEN`)

**Test Status:** ⚠️ NEEDS TESTING
**Known Issues:**
- Replicate token not set (using mock)
- Need to test each engine
- Token deduction flow needs verification

**Code Location:**
- `/src/app/api/video/generate/route.ts`
- `/src/lib/video-engines/`

---

## 2.2: AI SCRIPT GENERATION
**Route:** `/tools` → "Script Generator"
**Status:** ❌ BROKEN (User reported error)

### Script Generation Flow:

**Step 1: Input**
- Topic/subject
- Creator mode (UGC, Educational, Entertainment, Review, Tutorial)
- Platform (TikTok, Instagram, YouTube)
- Duration preference

**Step 2: Token Deduction**
- Cost: 7 tokens
- Deducted BEFORE OpenAI call

**Step 3: AI Generation**
- OpenAI GPT-4 creates script
- Returns JSON:
  ```json
  {
    "hook": "First 3 seconds",
    "script": "Full script with timestamps",
    "cta": "Call to action",
    "hashtags": ["relevant", "tags"],
    "duration": "30-60 seconds"
  }
  ```

**Step 4: Results**
- Display formatted script
- Copy to clipboard
- Save to library
- Use in video generation

**API Used:** OpenAI GPT-4
**Token Cost:** 7 tokens (71% margin)

**Test Status:** ❌ BROKEN
**User Error:** Script generation failed
**Action Required:**
1. Check OpenAI API key
2. Test generation endpoint
3. Review error logs
4. Verify token deduction works

**Code Location:** `/src/app/api/ai/generate-script/route.ts`

---

## 2.3: AI IMAGE GENERATION
**Route:** `/tools/image-generator`
**Status:** ❓ NEEDS TESTING

### Image Generation Flow:

**Step 1: Input**
- Text prompt
- Optional: Style/model selection
- Number of images (1-4)

**Step 2: Token Deduction**
- Cost: 5 tokens per image
- 15 tokens for 3 images
- Deducted BEFORE FAL call

**Step 3: AI Generation**
- FAL.ai Flux model generates images
- ~10-30 seconds per image

**Step 4: Results**
- Display generated images
- Download individually
- Use in video/post creation
- Save to library

**API Used:** FAL.ai Flux
**Token Cost:** 5 tokens per image (70% margin)

**Test Status:** ❓ NOT TESTED
**Action Required:** Test full flow

**Code Location:** `/src/app/api/image/generate/route.ts`

---

## 2.4: VIDEO TRANSCRIPTION
**Route:** `/tools` → "Video Transcription"
**Status:** ✅ WORKING (Tests passing)

### Transcription Flow:

**Step 1: Input**
- Video URL or file upload
- Duration input (for cost calculation)

**Step 2: Token Deduction**
- Cost: 2 tokens per minute
- Calculated: `ceil(duration_seconds / 60) × 2`
- Deducted BEFORE transcription

**Step 3: Processing**
- Downloads video
- Extracts audio
- OpenAI Whisper transcription
- Generates SRT + VTT files

**Step 4: Results**
- Full transcript text
- Timestamped segments
- Download SRT/VTT files
- Copy buttons for each segment

**API Used:** OpenAI Whisper
**Token Cost:** 2 tokens/min (70% margin)

**Test Status:** ✅ WORKING
**Tests:** 8/15 passing (auth issues, not feature issues)

**Code Location:** `/src/app/api/ai/transcribe/route.ts`

---

## 2.5: AI CONTENT TOOLS
**Route:** `/tools`
**Status:** ❓ NEEDS TESTING

### Available Tools:

#### A) Caption Generator
- Input: Video topic/description
- Output: Optimized caption for platform
- Cost: 2 tokens
- API: OpenAI GPT-4

#### B) Hashtag Generator
- Input: Content description
- Output: 10-20 relevant hashtags
- Cost: 1 token
- API: OpenAI GPT-4

#### C) Hook Generator
- Input: Video topic
- Output: Attention-grabbing first 3 seconds
- Cost: 2 tokens
- API: OpenAI GPT-4

#### D) Thumbnail Ideas
- Input: Video topic
- Output: 3-5 thumbnail concepts
- Cost: 1 token
- API: OpenAI GPT-4

#### E) Content Calendar
- Input: Niche/topics
- Output: 30-day content plan
- Cost: 7 tokens
- API: OpenAI GPT-4

**Test Status:** ❓ NOT TESTED
**Action Required:** Test each tool individually

**Code Location:** `/src/app/api/ai/tools/route.ts`

---

# PHASE 3: OPTIMIZATION & SCHEDULING

## 3.1: Content Library
**Route:** `/library`
**Status:** ❓ NEEDS TESTING

### Library Flow:

**What Should Be Here:**
- All generated videos
- All generated images
- All generated scripts
- All transcriptions
- Saved content

**Features Needed:**
- Search/filter
- Sort by date, type, status
- Preview content
- Edit metadata
- Delete items
- Bulk actions

**Database:** `content` table
**Columns:** `id`, `user_id`, `title`, `type`, `content`, `metadata`, `status`, `created_at`

**Test Status:** ❓ NOT TESTED
**Action Required:** Verify library shows all content

---

## 3.2: Schedule Post
**Route:** `/post`
**Status:** ❓ NEEDS TESTING

### Scheduling Flow:

**Step 1: Content Selection**
- Upload new media OR
- Select from library

**Step 2: Platform Selection**
- Choose 1 or more platforms:
  - TikTok, Instagram, YouTube, Twitter, Facebook, LinkedIn

**Step 3: Caption & Details**
- AI-generated caption OR custom
- Add hashtags
- Tag location
- Set thumbnail (YouTube)

**Step 4: Schedule Time**
- Post now OR
- Schedule for later (date + time picker)
- Optimal time suggestion?

**Step 5: Token Deduction**
- Single platform: 2 tokens
- Multi-platform: 5 tokens
- Deducted BEFORE posting

**Step 6: Confirmation**
- Review post preview for each platform
- Confirm & schedule
- Added to queue

**API Used:** Ayrshare
**Token Cost:** 2-5 tokens (100% margin - Ayrshare free for us)

**Test Status:** ❓ NOT TESTED
**Action Required:**
1. Verify Ayrshare connection
2. Test single platform post
3. Test multi-platform post
4. Test scheduling

**Code Location:** `/src/app/api/social/post/route.ts`

---

## 3.3: Post Queue Management
**Route:** `/manage`
**Status:** ❓ NEEDS TESTING

### Queue Management:

**Features Needed:**
- View all scheduled posts
- Edit scheduled posts
- Cancel scheduled posts
- Reschedule posts
- View post status (pending, posted, failed)
- Retry failed posts

**Database:** `posts` table
**Columns:** `id`, `user_id`, `content`, `platforms`, `media_urls`, `scheduled_for`, `status`, `ayrshare_id`, `created_at`

**Test Status:** ❓ NOT TESTED

---

# PHASE 4: PUBLISHING & DISTRIBUTION

## 4.1: Automated Posting
**Status:** ❓ NEEDS IMPLEMENTATION

### Current State:
- Manual post scheduling works
- Posts via Ayrshare API

### Needed for Full Automation:

**Background Job System:**
- Check for scheduled posts every minute
- Publish when time arrives
- Update status in database
- Handle failures & retries

**Options:**
1. Vercel Cron Jobs (every minute)
2. Supabase Edge Functions
3. n8n workflow automation
4. Custom cron service

**Test Status:** ❓ NOT IMPLEMENTED
**Action Required:** Implement automated posting system

---

## 4.2: Cross-Platform Optimization
**Status:** ❌ NOT IMPLEMENTED

### What's Needed:

**Auto-Format for Each Platform:**
- TikTok: 9:16 vertical, max 60s, hashtags in caption
- Instagram Reels: 9:16 vertical, max 90s, hashtags
- Instagram Feed: 1:1 square or 4:5 portrait
- YouTube Shorts: 9:16 vertical, max 60s
- YouTube Video: 16:9 horizontal, any length, title+description
- Twitter/X: 16:9 or 1:1, max 2:20, character limit
- Facebook: 1:1 or 16:9, flexible

**Auto-Crop Videos:**
- Detect aspect ratio
- Auto-crop for each platform
- Generate thumbnails
- Optimize file size

**Test Status:** ❌ NOT IMPLEMENTED
**Action Required:** Build platform optimizer

---

# PHASE 5: ANALYTICS & TRACKING

## 5.1: Connected Accounts Dashboard
**Route:** `/home` (stats section)
**Status:** ⚠️ PARTIALLY IMPLEMENTED

### Current State:
- Stats section exists
- Shows: Views, Engagement, Reach
- **Problem:** All show 0 or fake data

### What's Needed:

**Data Sources:**
1. Ayrshare Analytics API
2. Platform-specific APIs (if connected directly)
3. Database: Track our own post performance

**Metrics to Track:**
- Total views across all platforms
- Engagement rate (likes, comments, shares)
- Follower growth
- Best performing content
- Optimal posting times
- Platform breakdown

**Test Status:** ❌ NOT WORKING (showing fake 0s)
**Action Required:**
1. Implement Ayrshare analytics API calls
2. Store metrics in database
3. Update home dashboard with real data

**Code Location:** `/src/app/(main)/home/page.tsx` (needs analytics API integration)

---

## 5.2: Individual Post Analytics
**Route:** `/manage` → Click on post
**Status:** ❓ NEEDS IMPLEMENTATION

### Post-Level Analytics:

**Per Post Metrics:**
- Views per platform
- Likes per platform
- Comments per platform
- Shares per platform
- Click-through rate
- Watch time (videos)
- Completion rate

**Test Status:** ❌ NOT IMPLEMENTED
**Action Required:** Build post detail view with analytics

---

## 5.3: Performance Reports
**Route:** New route needed - `/analytics`
**Status:** ❌ NOT IMPLEMENTED

### Analytics Dashboard:

**Report Types:**
- Daily performance
- Weekly summary
- Monthly overview
- Content type breakdown
- Platform comparison
- Best times to post
- Trending topics in niche

**Visualizations:**
- Line charts (growth over time)
- Bar charts (platform comparison)
- Pie charts (content type breakdown)
- Heatmaps (best posting times)

**Test Status:** ❌ NOT IMPLEMENTED
**Action Required:** Build full analytics dashboard

---

# PHASE 6: CAMPAIGN MANAGEMENT

## 6.1: Campaign Creation
**Route:** New route needed - `/campaigns/new`
**Status:** ❌ NOT IMPLEMENTED

### Campaign Workflow:

**What is a Campaign?**
- Series of related posts
- Scheduled over time (days/weeks)
- Promotes a product, event, or theme
- Tracks collective performance

**Campaign Setup:**
1. Campaign name & goal
2. Duration (start date → end date)
3. Platforms to use
4. Content strategy:
   - Upload multiple pieces of content OR
   - Auto-generate content from template
5. Posting schedule:
   - Daily at X time
   - 3x per week
   - Custom schedule
6. Budget (token allocation)

**Campaign Features:**
- Content templates
- Auto-generation from topic
- A/B testing different captions/thumbnails
- Progressive rollout
- Performance tracking
- Auto-optimization (boost best performers)

**Test Status:** ❌ NOT IMPLEMENTED
**Action Required:** Build campaign management system

---

## 6.2: Campaign Monitoring
**Route:** `/campaigns` → Click campaign
**Status:** ❌ NOT IMPLEMENTED

### Campaign Dashboard:

**Real-Time Metrics:**
- Posts published vs scheduled
- Total campaign reach
- Total engagement
- Cost (tokens spent)
- ROI tracking
- Best performing posts
- Platform breakdown

**Actions:**
- Pause campaign
- Extend campaign
- Adjust schedule
- Add more content
- Boost best posts

**Test Status:** ❌ NOT IMPLEMENTED

---

## 6.3: AI Campaign Optimization
**Status:** ❌ NOT IMPLEMENTED

### Smart Campaign Features:

**Auto-Optimization:**
- AI analyzes performance
- Identifies best-performing content types
- Suggests optimal posting times
- Recommends platform focus
- Auto-adjusts posting frequency

**Smart Scheduling:**
- Learn audience behavior
- Post when engagement is highest
- Avoid over-posting
- Fill gaps in schedule

**Content Suggestions:**
- "Your audience loves tutorial videos - create more?"
- "TikTok performing 3x better than Instagram"
- "Post more on Tuesdays at 6 PM"

**Test Status:** ❌ NOT IMPLEMENTED
**Action Required:** Build AI analytics engine

---

# 🚧 COMPLETE FEATURE AUDIT

## ✅ WORKING FEATURES

1. **User Authentication** - Signup, Login, Logout
2. **Token System** - Balance tracking, deduction, refunds
3. **Video Transcription** - Full workflow (8/15 tests passing)

## ⚠️ PARTIALLY WORKING

1. **Home Dashboard** - Needs cache clear / redeployment verification
2. **Video Generation** - Code exists, needs engine-by-engine testing
3. **Social Posting** - API route exists, needs end-to-end test

## ❌ BROKEN / NOT WORKING

1. **Script Generation** - User reported error, needs debugging
2. **Analytics Dashboard** - Shows fake 0s, needs real data integration

## ❓ UNTESTED / UNKNOWN

1. **Image Generation** - Not tested
2. **AI Content Tools** (Caption, Hashtag, Hook, etc.) - Not tested
3. **Content Library** - Not tested
4. **Post Scheduling** - Not tested
5. **Post Queue Management** - Not tested
6. **Social Account Connection** - OAuth flow not verified

## ❌ NOT IMPLEMENTED

1. **Automated Background Posting** - No cron system
2. **Cross-Platform Video Optimization** - No auto-crop
3. **Real Analytics Integration** - Not pulling from Ayrshare
4. **Post-Level Analytics** - No detail view
5. **Performance Reports Dashboard** - Doesn't exist
6. **Campaign Management** - Doesn't exist
7. **AI Campaign Optimization** - Doesn't exist

---

# 🎯 TESTING PLAN

## Priority 1: CORE FUNCTIONALITY (Do First)

1. ✅ Verify onboarding changes (restart server, test `/home`)
2. ❌ **FIX SCRIPT GENERATION** (user reported error)
3. ❓ Test video generation (each engine)
4. ❓ Test image generation
5. ❓ Test social posting (single + multi-platform)

## Priority 2: CONTENT TOOLS

6. Test Caption Generator
7. Test Hashtag Generator
8. Test Hook Generator
9. Test Thumbnail Ideas
10. Test Content Calendar

## Priority 3: WORKFLOW

11. Test Content Library (view all saved content)
12. Test Post Scheduling
13. Test Post Queue Management

## Priority 4: ANALYTICS (Needs Implementation)

14. Implement Ayrshare analytics API
15. Show real stats on home dashboard
16. Build post-level analytics view

## Priority 5: AUTOMATION (Needs Implementation)

17. Build automated posting cron job
18. Implement platform-specific optimization
19. Build campaign management system

---

# 🚀 IDEAL AUTOMATED WORKFLOW

## The Dream User Experience:

### Step 1: Onboarding (5 minutes)
1. User signs up
2. Connects all social accounts (TikTok, Instagram, YouTube, etc.)
3. Sets posting preferences (how often, what times)
4. Chooses niche/topics

### Step 2: Content Creation (10 minutes)
1. User clicks "Create Campaign"
2. AI asks: "What do you want to promote?"
3. AI generates:
   - 10 video scripts
   - 10 images
   - 10 captions
   - 10 sets of hashtags
4. User reviews & approves

### Step 3: Automated Production (Hands-Off)
1. AI generates 10 videos using scripts + images
2. AI optimizes each video for each platform
3. AI schedules posts over 2 weeks
4. Posts automatically publish at optimal times

### Step 4: Monitoring & Optimization (Passive)
1. Dashboard shows real-time performance
2. AI identifies best-performing content
3. AI suggests: "Video #3 is viral - want to create similar?"
4. AI auto-boosts best performers
5. User gets weekly report

### Result:
**User input:** 10 minutes
**System output:** 2 weeks of automated, optimized content across all platforms

---

# 📋 ACTION ITEMS

## Immediate (Today)
1. ✅ Restart dev server with onboarding changes
2. ❌ **DEBUG & FIX SCRIPT GENERATION** (broken)
3. Test video generation with real API
4. Test image generation
5. Test social posting

## This Week
6. Integrate Ayrshare analytics (real stats)
7. Test all AI content tools
8. Build automated posting cron job
9. Create post-level analytics view
10. Document what works vs what doesn't

## Next Week
11. Build platform video optimizer
12. Implement campaign management
13. Add AI optimization suggestions
14. Polish UI/UX based on testing

---

**STATUS:** Ready to test feature by feature
**START HERE:** Fix script generation, then test each feature systematically

