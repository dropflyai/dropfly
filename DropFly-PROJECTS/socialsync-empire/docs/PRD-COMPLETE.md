# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SocialSync Empire Suite – Complete Edition
# Version: 6.0 (includes all watermark-remover features + new AI features)
# Last Updated: 2025-10-24
# Base Framework: Watermark-Remover (production-ready)
# New Features: AI Video Generation, Autonomous Posting, Trend Radar
# Word Count: ≈ 15,000 words (comprehensive)

---

# 📋 Executive Summary

SocialSync Empire Suite is a **white-label, AI-powered video + social-media growth platform** that:
- **Generates** viral videos from text using Kling, Veo3, Runway, Seedance
- **Processes** videos with 10+ professional tools (watermark removal, cropping, conversion, etc.)
- **Posts** autonomously to 6+ platforms (TikTok, Instagram, YouTube, Twitter, Facebook, LinkedIn)
- **Tracks** trends in real-time (15-min polling)
- **Delivers** ≥ 300% margin on every SKU

**Timeline:** 6 weeks to $1M ARR track
**Target:** Solo creators, agencies, enterprise brands who want ownership + margin
**Base:** Watermark-Remover (15,000+ production-ready lines)
**New Code:** 6,000 lines (AI video, posting, trends, analytics)

---

# 1. Complete Feature Set

## 1.1 Video Processing Tools (From Watermark-Remover Base)

### ✅ Video Downloader
**Status:** Production-ready
**Purpose:** Download videos from 50+ platforms for editing

**Features:**
- 50+ platform support (YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, etc.)
- Quality selection (4K, 1080p, 720p, 480p, 360p, audio-only)
- Format selection (MP4, WEBM, MP3, M4A)
- Metadata extraction (title, thumbnail, duration, views)
- Batch download support
- Progress tracking
- Error handling with retry

**Technical:**
- Libraries: ytdl-core, @distube/ytdl-core
- API: /api/download-video (GET info, POST download)
- Storage: Local download or cloud upload

---

### ✅ Watermark Remover
**Status:** Production-ready
**Purpose:** Remove watermarks/logos from videos

**Features:**
- 5 removal methods:
  - Blur (Gaussian blur over watermark area)
  - Pixelate (pixelate watermark region)
  - Fill (content-aware fill using surrounding pixels)
  - Inpaint (advanced AI-powered inpainting)
  - Advanced (multi-pass processing)
- Interactive region selection (drag to select watermark)
- Multiple region support (remove multiple watermarks)
- Quality presets (high, medium, low)
- Intensity control (0-100)
- Real-time preview
- Batch processing

**Technical:**
- Backend: Python (OpenCV, NumPy)
- API: /api/process-video
- Methods: FFmpeg filters + custom algorithms
- Performance: < 30s for 1-min video (1080p)

---

### ✅ Social Media Cropper
**Status:** Production-ready
**Purpose:** Crop videos to perfect specs for any platform

**Features:**
- 50+ platform presets with optimal settings
- Platform categories:
  - Short-form video (TikTok, Reels, Shorts)
  - Long-form video (YouTube, Vimeo)
  - Stories (Instagram, Facebook, Snapchat)
  - Professional (LinkedIn, Twitter)
- Aspect ratios: 9:16, 1:1, 16:9, 4:5, 2:3, custom
- Smart positioning:
  - Auto-detect faces (center on subject)
  - Manual positioning (drag to reframe)
  - Edge detection (avoid cropping important content)
- Batch cropping (1 video → 10 platform versions)
- Quality validation (warns if video doesn't meet platform specs)

**Technical:**
- Data: 50+ platform specs (/src/data/platformSpecs.ts)
- API: /api/crop-video
- Processing: FFmpeg crop filter
- Face detection: OpenCV (optional)

---

### ✅ Format Converter
**Status:** Production-ready
**Purpose:** Convert videos to any format with optimal quality

**Features:**
- 8 output formats: MP4, MOV, AVI, WEBM, MKV, FLV, WMV, M4V
- 5 video codecs: H.264 (default), H.265/HEVC, VP9, AV1, MPEG-4
- 3 audio codecs: AAC (default), MP3, Opus
- Compression presets:
  - Ultrafast, Superfast, Veryfast, Faster, Fast
  - Medium (balanced)
  - Slow, Slower, Veryslow, Placebo
- Quality control:
  - CRF (Constant Rate Factor): 0-51
  - Bitrate control (CBR, VBR, 2-pass)
  - Resolution scaling (upscale, downscale, maintain)
- Upscaling methods:
  - Lanczos (high quality)
  - Bicubic (balanced)
  - Bilinear (fast)
  - Nearest neighbor (pixel art)
- Advanced settings:
  - Keyframe interval
  - GOP size
  - B-frames
  - Color space conversion

**Technical:**
- API: /api/convert-video
- Engine: FFmpeg with custom presets
- Compression database: 50+ platform-specific presets

---

### ✅ Thumbnail Generator
**Status:** Production-ready
**Purpose:** Create perfect thumbnails/covers for videos

**Features:**
- 3 generation modes:
  - Manual (select specific frame)
  - Auto (detect best frame - highest contrast, no blur)
  - Interval (generate thumbnail every N seconds)
- Smart detection:
  - Face detection (prefer frames with faces)
  - Contrast analysis (pick visually striking frames)
  - Motion blur detection (skip blurry frames)
- Editing tools:
  - Text overlay (title, caption)
  - Filters (brightness, contrast, saturation, blur)
  - Crop/resize
  - Border/frame
- Export formats: JPG, PNG, WEBP
- Multiple resolutions (1920x1080, 1280x720, 640x360, custom)
- Batch generation (100 thumbnails from 1 video)

**Technical:**
- API: /api/generate-thumbnail
- Detection: OpenCV face detection + contrast analysis
- Editing: Canvas API (client-side) + FFmpeg (server-side)

---

### ✅ Cover Art Creator
**Status:** Production-ready
**Purpose:** Extract and edit frames for social media posts

**Features:**
- Frame extraction at any timestamp
- Basic editing:
  - Crop, resize, rotate
  - Filters (grayscale, sepia, vintage, etc.)
  - Text overlay with custom fonts
  - Stickers/emojis
- Templates:
  - Instagram post (1:1)
  - Instagram story (9:16)
  - Facebook post (16:9)
  - Twitter post (16:9)
  - LinkedIn post (1.91:1)
- Export: JPG, PNG, WEBP, GIF

**Technical:**
- API: /api/extract-frame
- Editor: Canvas API + Fabric.js (drag-drop elements)

---

### 🚧 Video Trimmer (Planned)
**Status:** Not yet implemented
**Purpose:** Trim videos to exact length

**Planned Features:**
- Timeline editor with frame-accurate trimming
- Multi-segment trim (remove multiple sections)
- Keyframe navigation
- Audio waveform visualization
- Duration presets (15s, 30s, 60s, 90s, 3min)

---

### 🚧 Video Compressor (Planned)
**Status:** Not yet implemented
**Purpose:** Reduce file size while maintaining quality

**Planned Features:**
- Target file size mode (e.g., "compress to < 100 MB")
- Target bitrate mode
- Smart compression (analyze video, pick best settings)
- Quality comparison (before/after preview)
- Batch compression

---

### 🚧 Audio Extractor (Planned)
**Status:** Not yet implemented
**Purpose:** Extract audio from videos

**Planned Features:**
- Extract to MP3, WAV, AAC, OGG, FLAC
- Volume normalization
- Noise reduction
- Fade in/out
- Trim audio

---

### 🚧 Subtitle Manager (Planned)
**Status:** Not yet implemented
**Purpose:** Add/edit/remove subtitles

**Planned Features:**
- Auto-generate subtitles (Whisper API)
- Manual subtitle editor
- Multiple languages
- Styling (font, color, position, background)
- SRT, VTT, ASS format support

---

### 🚧 Photo Editor (Planned)
**Status:** Not yet implemented
**Purpose:** Edit images for thumbnails/covers

**Planned Features:**
- Full photo editing suite
- Filters, adjustments, effects
- Text, stickers, shapes
- Background removal
- AI enhancements

---

## 1.2 NEW: Brand Voice & Visual Identity Manager

### 🆕 AI Avatar Generator & Manager
**Status:** ✅ **Implemented** (2025-10-24)
**Purpose:** Create AI avatars from user photos that appear in generated videos for brand consistency and personalization

**Features:**
- **Photo Upload:** Clients upload 1-5 photos of themselves or brand representatives
- **AI Avatar Training:**
  - Automatic face detection and extraction
  - AI model training (~3 minutes per avatar)
  - Generate consistent character across unlimited videos
  - Support for multiple avatars per account (e.g., CEO, team members, mascot)
- **Avatar Management:**
  - Upload, organize, and delete avatars
  - Set default avatar for automated content
  - Preview avatars before using in videos
  - Status tracking (processing, ready, failed)
- **Video Integration:**
  - Avatars can "speak" any script with AI voice
  - Consistent appearance across all videos
  - Multiple styles (professional, casual, animated)
  - Auto-insert avatar in video generation flow
- **Brand Consistency:**
  - Same face/person in all brand content
  - No need for constant photoshoots
  - Scale personal branding infinitely
  - Perfect for agencies managing multiple clients

**Technical Implementation:**
```typescript
// Component: src/components/features/AvatarManager.tsx
// Features:
- File upload with drag-and-drop
- Image preprocessing (crop, resize, enhance)
- Avatar status management (processing → ready)
- Default avatar selection
- Delete/manage multiple avatars
- Integration with AI video generation
```

**AI Services (To Integrate):**
- **HeyGen API:** Text-to-avatar-video (realistic talking heads)
- **D-ID API:** Photo-to-video animation
- **Midjourney/Stable Diffusion:** Generate consistent character styles
- **Custom Avatar Model:** Train on user photos for unique look

**User Flow:**
1. Navigate to Settings → AI Avatars
2. Click "Upload New Avatar"
3. Upload 1-5 clear photos (front-facing, good lighting)
4. AI processes photos (~3 minutes)
5. Avatar is ready to use in video generation
6. When creating content, select which avatar appears in video
7. AI generates video with that avatar speaking the script

**Use Cases:**
- **Solo Creators:** Your face in all videos without recording
- **Agencies:** Client avatars for personalized content
- **Brands:** CEO/spokesperson consistency
- **White-Label:** End customers upload their own avatars
- **Product Demos:** Consistent "demo person" across all tutorials

**Benefits:**
- **Time Savings:** No need to record yourself for every video
- **Consistency:** Same look/feel across all content
- **Scale:** Generate 100 videos/day with your avatar
- **Personalization:** Each client gets videos with THEIR face
- **Global Reach:** Avatar can "speak" any language with AI voice
- **Cost Savings:** No actors, videographers, or studios needed

**Monetization:**
- **Free Tier:** 1 avatar, 10 videos/month
- **Pro Tier ($49/mo):** 3 avatars, unlimited videos
- **Agency Tier ($149/mo):** 10 avatars, white-label
- **Enterprise:** Unlimited avatars, API access

**Integration Points:**
1. **Create Tab:** Avatar selection in video generation wizard
2. **More Tab:** Avatar management interface
3. **API:** `/api/avatars` (upload, list, delete, train)
4. **Database:** `avatars` table (user_id, image_url, model_id, status)
5. **AI Video APIs:** Pass avatar_id to Kling/Veo3/Runway for consistent characters

**Status:** ✅ UI Components Built (2025-10-24)
- AvatarManager component (upload, manage, select)
- Integration in Create flow (select avatar before generating)
- Settings page (More tab → AI Avatars)

**Next Steps:**
1. Integrate with HeyGen API for avatar-to-video
2. Add avatar training backend (Python + face detection)
3. Store avatar models in Supabase Storage
4. Add avatar selection to AI video generation flow
5. Build avatar preview/testing feature

---

### 🆕 Brand Voice Configurator
**Status:** To be implemented (Week 2) - **Port from content-creation repo (already built!)**
**Purpose:** Ensure all AI-generated content matches your company's unique brand personality

**Features:**

#### Core Brand Identity
- **Company Info:**
  - Company name
  - Tagline
  - Mission statement
  - Industry/niche
  - Target audience demographics
  - Unique value proposition

- **Brand Personality:**
  - Voice tone (professional, casual, friendly, authoritative, playful, inspirational, etc.)
  - Personality traits (trustworthy, innovative, bold, caring, etc.)
  - Communication style (direct, storytelling, educational, humorous)
  - Formality level (1-10 scale)

- **Messaging Guidelines:**
  - Key messages (top 3-5 core messages to always communicate)
  - Words to use (brand-specific terminology)
  - Words to avoid (off-brand language)
  - Tone modifiers per platform (LinkedIn = professional, TikTok = casual)
  - Emoji usage preferences (yes/no, which types)

- **Content Strategy:**
  - Content pillars (education, entertainment, promotion, community)
  - 70/30 split config (70% value content, 30% promotional)
  - Posting frequency per platform
  - Best posting times
  - Hashtag strategy (#branded, #trending, #niche)

#### Visual Brand Identity
- **Brand Colors:**
  - Primary color (hex code)
  - Secondary color
  - Accent colors (up to 5)
  - Text colors (light/dark modes)
  - Gradient preferences

- **Typography:**
  - Primary font (Google Fonts)
  - Secondary font
  - Heading styles
  - Body text styles

- **Logo & Watermarks:**
  - Logo upload (transparent PNG)
  - Logo position (corner, center, custom)
  - Logo size (small, medium, large)
  - Watermark opacity (0-100%)
  - Show logo on all videos (yes/no)

- **Visual Style:**
  - Aesthetic preferences (modern, vintage, minimalist, bold, etc.)
  - Filter preferences (none, warm, cool, high-contrast, etc.)
  - Video overlays (text animations, transitions)
  - Thumbnail templates

#### Content Templates
- **Video Script Templates:**
  - Hook templates (first 3 seconds)
  - Body templates (main content structure)
  - CTA templates (call-to-action patterns)
  - Platform-specific variations

- **Caption Templates:**
  - Opening lines (attention-grabbing starters)
  - Body structure (how to present value)
  - Closing CTAs (engagement prompts)
  - Hashtag formulas

- **Product/Service Catalog:**
  - List of products/services to mention
  - Key features per product
  - Benefits per product
  - Pricing (if public)
  - Links (product pages, landing pages)

#### AI Integration
- **Prompt Prefix System:**
  - Every AI generation gets brand voice injected
  - Example: "Generate a video in [Brand Name]'s voice: [tone], [style], [personality]. Our target audience is [audience]. Key message: [message]. User prompt: [actual prompt]"

- **Content Validation:**
  - AI checks generated content against brand guidelines
  - Flags off-brand language
  - Suggests improvements
  - Brand consistency score (0-100%)

- **Dynamic Adaptation:**
  - AI learns from user edits (which suggestions they keep/reject)
  - Refines brand voice over time
  - A/B test different tones (measure engagement)

#### Multi-Brand Support (Enterprise)
- **Sub-Brands:**
  - Agencies can manage multiple client brands
  - Each brand gets own config
  - Quick-switch between brands
  - Bulk operations per brand

- **Brand Templates:**
  - Save brand configs as templates
  - Clone template for new clients
  - Import/export brand configs (JSON)

**Technical Implementation:**
- **Storage:** JSON config files per user (port from content-creation)
  - /config/brand-voice/{user_id}.json
  - /config/visual-brand/{user_id}.json
  - /config/product-catalog/{user_id}.json

- **Database:** Supabase
  ```sql
  CREATE TABLE brand_configs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    brand_name TEXT,
    config JSONB, -- entire brand voice config
    visual_config JSONB, -- colors, fonts, logo URLs
    templates JSONB, -- script/caption templates
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
  );
  ```

- **API Routes:**
  - `GET /api/brand/config` - Get user's brand config
  - `POST /api/brand/config` - Update brand config
  - `POST /api/brand/validate` - Validate content against brand
  - `GET /api/brand/templates` - Get brand templates

- **UI Components:**
  - `/app/dashboard/brand` - Brand configurator page
  - Multi-step wizard (onboarding)
  - JSON editor for power users
  - Preview panel (see how content looks with brand applied)

**Example Brand Voice Config (JSON):**
```json
{
  "brandName": "TechFlow Solutions",
  "tagline": "Simplify Your Tech Stack",
  "industry": "B2B SaaS",
  "targetAudience": "Tech-savvy CTOs and Engineering Leaders",
  "voiceTone": "professional yet approachable",
  "personality": ["innovative", "trustworthy", "helpful"],
  "communicationStyle": "educational with occasional humor",
  "formalityLevel": 7,
  "keyMessages": [
    "We simplify complex tech so you can focus on building",
    "Enterprise-grade security without enterprise complexity",
    "Join 10,000+ developers who trust TechFlow"
  ],
  "wordsToUse": ["streamline", "effortless", "powerful", "intuitive"],
  "wordsToAvoid": ["complicated", "expensive", "difficult"],
  "emojiUsage": "moderate",
  "contentPillars": {
    "education": 40,
    "casestudies": 30,
    "product": 20,
    "community": 10
  },
  "platformTones": {
    "linkedin": "professional, thought-leadership",
    "twitter": "concise, insights, engaging",
    "tiktok": "casual, behind-the-scenes, fun",
    "youtube": "educational, in-depth, helpful"
  },
  "visualBrand": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6",
    "accentColor": "#10B981",
    "logo": "https://cdn.techflow.com/logo.png",
    "logoPosition": "bottom-right",
    "fonts": {
      "primary": "Inter",
      "secondary": "Space Grotesk"
    }
  }
}
```

**Why This Matters:**
- **Consistency:** Every video, post, caption feels like YOUR brand
- **Scale:** Generate 1000 posts that all sound like you wrote them
- **Quality:** AI understands your voice → better content
- **Agency Value:** Manage 20 clients, each with unique voice
- **White-Label:** Your customers can set their own brand voice

**Integration Points:**
1. **AI Video Generation:** Inject brand voice into video prompts
2. **Script Generator:** Use brand templates for scripts
3. **Caption Generator:** Apply brand tone to captions
4. **Visual Overlays:** Auto-add logo, brand colors to videos
5. **Trend Adaptation:** Adapt trending content to brand voice
6. **Validation:** Check every post against brand guidelines before posting

**Reuse from Content-Creation:**
The content-creation repo already has a **production-ready brand voice system** with:
- 415-line brand-voice.json (comprehensive config)
- 187-line product-ads.json (product catalog)
- 147-line visual-brand.json (colors, fonts, logo)
- Brand voice injection in AI prompts
- **We just need to port it over!**

---

## 1.3 NEW: AI Video Generation

### 🆕 Text-to-Video Engine
**Status:** To be implemented (Week 2)
**Purpose:** Generate viral videos from text prompts

**Features:**
- 4 AI engines with automatic selection:
  - **Kling** (fast, low cost, 5-60s)
  - **Veo3** (Google, high quality, 10-120s)
  - **Runway Gen-3** (cinematic, 5-10s)
  - **Seedance** (experimental, budget-friendly)
- Engine selection modes:
  - Auto (AI picks best engine for prompt)
  - Manual (user selects engine)
  - Fallback (try next engine if first fails)
- Prompt enhancement:
  - AI expands simple prompts ("pool fail" → detailed scene)
  - Style presets (cinematic, viral, comedy, dramatic)
  - Aspect ratio enforcement (9:16, 1:1, 16:9)
- Duration control: 5-120 seconds
- Quality tiers: Draft (fast), Standard, High (slow)
- Cost tracking per render

**Technical:**
- API: /api/render (PRD spec)
- Engines: REST APIs (Kling, Veo3, Runway, Seedance)
- Orchestration: /lib/ai-engines/engine-selector.ts
- Margin tracking: Token cost × 4 = price (300%+ margin)

**API Spec:**
```typescript
POST /api/render
Body: {
  prompt: string
  engine?: 'kling' | 'veo3' | 'runway' | 'seedance' | 'auto'
  duration: 5-120 (seconds)
  aspect_ratio: '9:16' | '1:1' | '16:9'
  style?: string (optional preset)
  quality?: 'draft' | 'standard' | 'high'
}
Response: {
  mp4_url: string
  token_cost: number
  margin_cents: number
  engine_used: string
  duration_actual: number
}
```

---

### 🆕 Viral Script Generator
**Status:** To be implemented (Week 2)
**Purpose:** Generate viral video scripts using AI

**Features:**
- Input: Topic + platform + duration
- Output: Script with:
  - Hook (first 3 seconds)
  - Body (main content)
  - Call-to-action (last 5 seconds)
- Script templates:
  - Educational (how-to, tutorial)
  - Entertainment (comedy, fails, reactions)
  - Promotional (product, service)
  - Storytelling (narrative arc)
- Platform-specific optimization:
  - TikTok: Fast-paced, trending sounds
  - Instagram Reels: Aesthetic, lifestyle
  - YouTube Shorts: Educational, tips
  - LinkedIn: Professional, insights
- Trend integration (uses trending topics/hashtags)

**Technical:**
- API: /api/generate-script
- LLM: Claude 3.5 Sonnet (primary), GPT-4o (fallback)
- Prompts: Stored in /config/script-templates/

---

## 1.3 NEW: Autonomous Social Media Posting

### 🆕 Multi-Platform Posting Agent
**Status:** To be implemented (Week 3)
**Purpose:** Auto-post videos to 6+ platforms without manual intervention

**Supported Platforms:**
- ✅ Instagram (Reels, Feed, Stories) - via Ayrshare
- ✅ Facebook (Feed, Reels, Stories) - via Ayrshare
- ✅ LinkedIn (Feed) - via Ayrshare
- 🆕 TikTok (Feed) - via Playwright stealth
- 🆕 Twitter/X (Video posts) - via official API
- 🆕 YouTube Shorts - via official API

**Features:**
- One-click scheduling:
  - Upload video once
  - Auto-post to all platforms
  - Platform-specific formatting (captions, hashtags)
- Smart scheduling:
  - Optimal posting times per platform
  - Time zone support
  - Frequency limits (avoid spam detection)
- Caption generation:
  - AI-generated captions per platform
  - Hashtag suggestions (trending + relevant)
  - @mentions, emojis
  - Character limits enforced
- Post validation:
  - Check video meets platform specs
  - Auto-convert if needed
  - Quality warnings
- Retry logic:
  - Retry failed posts (3 attempts)
  - Exponential backoff
  - Error notifications

**Technical:**
- API: /api/post-video
- Services:
  - Ayrshare API (IG, FB, LI)
  - Playwright (TikTok stealth mode)
  - Twitter API v2
  - YouTube Data API v3
- Queue: BullMQ (Redis-backed job queue)
- Proxy: GeoSurf residential proxies (stealth)

---

### 🆕 Ban-Rate Monitoring
**Status:** To be implemented (Week 5)
**Purpose:** Track and minimize account bans

**Features:**
- Real-time monitoring:
  - Track every upload attempt
  - Detect "shadow bans" (low engagement)
  - Alert on account warnings
- Ban-rate dashboard:
  - Per-platform ban rate (target: < 0.3%)
  - Per-user ban rate
  - Historical trends
- Mitigation strategies:
  - Slow down posting if ban-rate rises
  - Rotate proxies
  - Vary posting times
  - Add random delays (humanize)
- Insurance mode:
  - Manual review before risky posts
  - Whitelist trusted accounts
  - Blacklist flagged content

**Technical:**
- Dashboard: Grafana + Prometheus
- Storage: Supabase (posts table - track status)
- Alerts: Email + Slack webhooks

---

## 1.4 NEW: Trend Radar

### 🆕 Real-Time Trend Scraper
**Status:** To be implemented (Week 5)
**Purpose:** Auto-detect viral trends every 15 minutes

**Features:**
- Platform scrapers:
  - TikTok trending page (sounds, hashtags, topics)
  - Instagram Explore (trending reels)
  - YouTube trending (Shorts tab)
  - Twitter trending topics
- Data collected:
  - Trending sounds/audio URLs
  - Trending hashtags
  - Trending topics/challenges
  - Viral score (engagement velocity)
- Integration:
  - Auto-suggest trends in video generation
  - Pre-fill trending hashtags in captions
  - Prioritize trend-aligned content
- Expiration:
  - Trends expire after 24 hours
  - Re-scrape every 15 minutes
  - Archive top trends for analysis

**Technical:**
- API: /api/trends (GET current trends)
- Scraper: Playwright headless browser
- Storage: Supabase (trends table)
- Cron: Vercel Cron Jobs (every 15 min)

---

## 1.5 NEW: White-Label System

### 🆕 Agency Customization
**Status:** To be implemented (Week 4)
**Purpose:** Agencies can rebrand as their own platform

**Features:**
- Custom domain:
  - CNAME setup (e.g., studio.agency.com)
  - SSL certificate auto-provisioning
  - Branded URLs in emails
- Visual branding:
  - Custom logo (header, favicon)
  - Brand colors (primary, secondary, accent)
  - Custom fonts (Google Fonts)
- Feature control:
  - Enable/disable specific tools
  - Set tool limits per tier
  - Custom pricing display
- Sub-account management:
  - Agencies can add clients
  - Per-client usage tracking
  - Per-client billing

**Technical:**
- Config: /config/white-label.json per user
- Storage: Supabase (white_label_accounts table)
- Domain routing: Next.js middleware (detect domain → load config)

---

## 1.6 NEW: Pricing & Billing

### 🆕 Stripe Integration
**Status:** To be implemented (Week 4)
**Purpose:** Charge users, track revenue, manage subscriptions

**Pricing Tiers:**

| Tier | Price | Features | Margin |
|------|-------|----------|--------|
| **Free** | $0/mo | 10 renders/mo, watermark, basic tools | N/A |
| **Starter** | $15/mo | 100 renders/mo, no watermark, all tools | 370% |
| **Pro** | $49/mo | Unlimited renders, white-label, priority | 370% |
| **Enterprise** | $199/mo | Everything + SLA, compliance, support | 560% |

**Overage Pricing:**
- $0.01 per token (after monthly limit)
- Margin: 300% (token cost $0.0025)

**Features:**
- Stripe Checkout (hosted payment page)
- Webhook handling (subscription events)
- Usage metering (track renders per user)
- Invoicing (auto-generated monthly invoices)
- Cancellation flow (retain users with offers)

**Technical:**
- API: /api/stripe/checkout, /api/stripe/webhook
- Library: stripe npm package
- Storage: Supabase (users table - tier field)

---

## 1.7 NEW: Analytics Dashboard

### 🆕 Margin Tracking
**Status:** To be implemented (Week 5)
**Purpose:** Track profitability per user, render, post

**Metrics:**
- Per-render margin:
  - Token cost (input to AI engine)
  - Sale price (user's tier price / monthly renders)
  - Margin % = (price - cost) / cost × 100
- Per-user margin:
  - Monthly revenue (tier price)
  - Monthly costs (renders × token cost + infra)
  - Lifetime value (LTV)
- Overall margin:
  - Total MRR (monthly recurring revenue)
  - Total costs (AI tokens + infra)
  - Blended margin (target: 370%)

**Dashboard:**
- Real-time margin chart (line graph)
- Per-tier breakdown (pie chart)
- Top users by margin (table)
- Cost alerts (if margin < 300%, notify)

**Technical:**
- Dashboard: Custom Next.js page + Recharts
- Data: Supabase (renders table - token_cost, margin_cents)
- Refresh: Real-time with Supabase subscriptions

---

### 🆕 Engagement Analytics
**Status:** To be implemented (Week 6)
**Purpose:** Track video performance across platforms

**Metrics:**
- Per-post engagement:
  - Views, likes, shares, comments
  - Engagement rate = (likes + shares + comments) / views
  - Best performing platform
- Per-user analytics:
  - Total views across all posts
  - Average engagement rate
  - Top performing videos
- Trend analysis:
  - Engagement over time
  - Best posting times
  - Viral coefficient (how many posts went viral)

**Technical:**
- Data collection: Platform APIs (TikTok, IG, YouTube, etc.)
- Storage: Supabase (posts table - engagement JSONB field)
- Dashboard: Custom Next.js page

---

## 1.8 Cloud Storage (Existing from Watermark-Remover)

### ✅ Multi-Cloud Upload
**Status:** Production-ready

**Supported Providers:**
- Google Drive (OAuth 2.0)
- Dropbox (Access Token)
- Airtable (API Key + Base ID)
- Supabase Storage (S3-compatible)
- AWS S3 (Access Key + Secret)
- Local filesystem

**Features:**
- One-click upload after processing
- Automatic folder organization
- Metadata storage (title, tags, created date)
- Batch upload (queue multiple files)
- Progress tracking
- Error handling with retry

**Technical:**
- APIs: /api/download-video (includes cloud upload logic)
- Libraries: @google-cloud/storage, dropbox, aws-sdk, @supabase/supabase-js

---

# 2. Technical Architecture

## 2.1 Tech Stack

### Frontend
- **Framework:** Next.js 15.5.4 (App Router + Turbopack)
- **UI:** React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **State:** React Context API

### Backend
- **API:** Next.js API Routes (/app/api/**)
- **Database:** Supabase (PostgreSQL)
- **Video Processing:** FFmpeg + Python (OpenCV)
- **AI Video:** Kling, Veo3, Runway, Seedance APIs
- **LLM:** Claude 3.5 Sonnet (DeepSeek fallback)
- **Posting:** Ayrshare API + Playwright
- **Queue:** BullMQ (Redis)
- **Storage:** Supabase Storage (S3)

### Infrastructure
- **Hosting:** Vercel Pro ($20/mo)
- **Database:** Supabase Pro ($25/mo)
- **Queue:** Redis Cloud ($10/mo)
- **Proxy:** GeoSurf ($33/mo for 1GB)
- **Monitoring:** Grafana Cloud (free tier)

### DevOps
- **CI/CD:** GitHub Actions → Vercel auto-deploy
- **Cron:** Vercel Cron Jobs (trend scraper every 15 min)
- **Logs:** Vercel Logs + Supabase Logs
- **Alerts:** Slack webhooks

---

## 2.2 Database Schema (Supabase PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  tier TEXT CHECK (tier IN ('free','starter','pro','enterprise')),
  white_label_config JSONB,
  burn_rate_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Renders table (AI video generation)
CREATE TABLE renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  engine TEXT CHECK (engine IN ('kling','veo3','runway','seedance')),
  mp4_url TEXT,
  token_cost INTEGER,
  margin_cents INTEGER,
  ban_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table (social media posts)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  render_id UUID REFERENCES renders(id),
  platform TEXT CHECK (platform IN ('tiktok','instagram','youtube','twitter','facebook','linkedin')),
  caption TEXT,
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft','scheduled','posted','failed')),
  engagement JSONB, -- {views, likes, shares, comments}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trends table (15-min polling)
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  trending_sound_url TEXT,
  trending_hashtags TEXT[],
  trending_topics TEXT[],
  viral_score INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- White-label accounts
CREATE TABLE white_label_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  domain TEXT UNIQUE,
  logo_url TEXT,
  brand_colors JSONB,
  custom_config JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2.3 API Routes

### Existing (Watermark-Remover)
- `GET/POST /api/download-video` - Download videos from 50+ platforms
- `POST /api/process-video` - Remove watermarks
- `POST /api/crop-video` - Crop to platform specs
- `POST /api/convert-video` - Convert formats
- `POST /api/process-video-pipeline` - Multi-step processing
- `POST /api/generate-thumbnail` - Create thumbnails
- `POST /api/extract-frame` - Extract cover art frames

### New (SocialSync)
- `POST /api/render` - Generate AI video from text
- `POST /api/generate-script` - Generate viral scripts
- `POST /api/post-video` - Post to social platforms
- `GET /api/trends` - Get current trending topics
- `POST /api/stripe/checkout` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe events
- `GET /api/analytics/margin` - Get margin data
- `GET /api/analytics/engagement` - Get engagement data

---

# 3. Development Roadmap (6 Weeks)

## Week 1: Foundation ✅
- [x] Copy watermark-remover as base
- [x] Install dependencies
- [x] Update branding to SocialSync
- [x] Set up Supabase database
- [x] Write complete PRD

**Deliverable:** Working base app with all existing tools

---

## Week 2: AI Video Generation 🚧
- [ ] Implement Kling API integration
- [ ] Implement Veo3 API integration
- [ ] Implement Runway API integration
- [ ] Implement Seedance API integration
- [ ] Build /api/render endpoint
- [ ] Build engine selector (auto-pick best)
- [ ] Test: Input "pool fail" → get 15s viral reel

**Deliverable:** Working text-to-video generation

---

## Week 3: Autonomous Posting
- [ ] Integrate Ayrshare API (IG, FB, LinkedIn)
- [ ] Build TikTok poster (Playwright stealth)
- [ ] Build Twitter/X poster (official API)
- [ ] Build YouTube Shorts poster (official API)
- [ ] Implement BullMQ job queue
- [ ] Test: Schedule 3 posts/day, auto-publish to 5 platforms

**Deliverable:** Working autonomous posting system

---

## Week 4: Pricing + White-Label
- [ ] Stripe checkout integration
- [ ] Usage metering (track renders per user)
- [ ] White-label branding config
- [ ] Custom domain support
- [ ] Sub-account management (agencies)

**Deliverable:** Working billing + white-label demo

---

## Week 5: Trend Radar + Analytics
- [ ] Build trend scrapers (TikTok, IG, YouTube, Twitter)
- [ ] Store trends in Supabase (refresh every 15 min)
- [ ] Integrate trends into video generation
- [ ] Build margin tracking dashboard
- [ ] Build ban-rate monitoring

**Deliverable:** Trend radar live + analytics dashboard

---

## Week 6: Beta Launch
- [ ] Polish mobile UI
- [ ] Write documentation
- [ ] Create onboarding flow
- [ ] Recruit 10 beta users
- [ ] Collect feedback
- [ ] Bug fixes

**Deliverable:** 10 beta users, 100 uploads, $490 MRR

---

# 4. Success Metrics

| Metric | Target | Evidence |
|--------|--------|----------|
| Beta Users | 10 | Email list |
| Total Uploads | 100 | Supabase renders count |
| Ban Rate | < 0.3% | Ban-rate dashboard |
| MRR | $490 | Stripe dashboard (10 × $49) |
| Margin | 370% | Cost tracker |
| Uptime | > 99% | Vercel analytics |
| NPS | > 60 | Typeform survey |

---

# 5. Cost Structure (Locked $423/month)

| Item | Cost | % of Budget |
|------|------|-------------|
| Vercel Pro | $20 | 4.7% |
| Supabase Pro | $25 | 5.9% |
| Redis Cloud | $10 | 2.4% |
| GeoSurf Proxy | $33 | 7.8% |
| DeepSeek API | $60 | 14.2% |
| Kling API | $100 | 23.6% |
| Ayrshare | $50 | 11.8% |
| **Total** | **$298** | **70.4%** |

**Buffer:** $125/month (29.6%) for overages

---

# 6. Competitive Advantage

| Feature | Competitors | SocialSync |
|---------|-------------|------------|
| Text→Video AI | ❌ Manual editing | ✅ 4 AI engines |
| Auto-Upload | ❌ Manual posting | ✅ 6 platforms |
| Trend Radar | ❌ None | ✅ 15-min refresh |
| White-Label | ❌ Watermark only | ✅ Full branding |
| Video Tools | ❌ 1-2 tools | ✅ 10+ tools |
| Margin | 60-70% | ✅ 370% |
| Ban-Rate Tracking | ❌ None | ✅ < 0.3% |

---

# 7. Conclusion

SocialSync Empire Suite combines:
1. **Production-ready video tools** (15,000 lines from watermark-remover)
2. **AI video generation** (Kling, Veo3, Runway, Seedance)
3. **Autonomous posting** (6 platforms)
4. **Trend intelligence** (15-min refresh)
5. **370% margin** (locked profitability)

**Timeline:** 6 weeks to beta launch
**Investment:** $0 (bootstrapped, solo dev)
**Revenue Target:** $490 MRR (Week 6) → $1M ARR (Week 20)

---

**Status:** Ready to build
**Next Step:** Week 2 - Implement AI video generation
**Lock Date:** 2025-10-24 04:00 UTC

---

# Appendix: Complete Feature List

## ✅ Implemented (Watermark-Remover Base)
1. Video Downloader (50+ platforms)
2. Watermark Remover (5 methods)
3. Social Media Cropper (50+ platforms)
4. Format Converter (8 formats, 5 codecs)
5. Thumbnail Generator (auto, manual, interval)
6. Cover Art Creator (frame extraction + editing)
7. Cloud Storage (6 providers)
8. Mobile-Optimized UI
9. Video Processing Pipeline
10. Platform Specs Database

## 🆕 To Implement (SocialSync New)
11. AI Video Generation (4 engines)
12. Viral Script Generator (AI-powered)
13. Multi-Platform Posting (6 platforms)
14. Trend Radar (15-min refresh)
15. White-Label System
16. Stripe Billing
17. Margin Tracking Dashboard
18. Ban-Rate Monitoring
19. Engagement Analytics
20. Sub-Account Management

## 🚧 Planned (Future)
21. Video Trimmer
22. Video Compressor
23. Audio Extractor
24. Subtitle Manager
25. Photo Editor
26. AI Enhancements (upscaling, background removal)
27. Desktop App (Electron)
28. Mobile App (React Native)
29. Browser Extension
30. API Access (Enterprise)

**Total Features:** 30+ (10 production-ready, 10 new, 10 planned)
