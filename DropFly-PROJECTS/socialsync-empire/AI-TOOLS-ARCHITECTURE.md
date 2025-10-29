# AI Tools Architecture - Complete Integration Plan

**Status**: 🔄 In Progress
**Date**: 2025-10-27

---

## 🎯 Goal: Universal AI Tools

Create AI tools that work **everywhere** in the platform:
- ✅ Video generation workflow
- ✅ Image generation workflow
- ✅ Standalone tools page
- ✅ Post editor/scheduler
- ✅ Content library

---

## 🛠️ Complete AI Tools List

### Text-Based Content Tools (Token Cost: 1-10 tokens)

| Tool | Token Cost | Use Case | Status |
|------|-----------|----------|--------|
| **Caption Generator** | 2 tokens | Generate social post captions | ✅ API Created |
| **Hashtag Generator** | 1 token | Suggest relevant hashtags | ✅ API Created |
| **Hook Generator** | 2 tokens | Viral video hooks | ✅ API Created |
| **Content Calendar** | 10 tokens | 30-day content plan | ✅ API Created |
| **Thumbnail Text** | 1 token | Catchy thumbnail text | ✅ API Created |

### Video/Audio Tools (Variable Cost: 1-10 tokens/minute)

| Tool | Token Cost | Use Case | Status |
|------|-----------|----------|--------|
| **Video Transcription** | ~2 tokens/min | Audio to text (SRT, VTT) | ✅ Config Added |
| **Auto Captions** | ~3 tokens/min | Burn subtitles into video | ✅ Config Added |
| **Caption Editor** | Free | Edit/style captions | 🔲 Not Started |

---

## 📍 Integration Points

### 1. Video Generation Workflow

**Location**: `/create` → Video Generator

**Tools Available**:
```
┌─────────────────────────┐
│ Video Generated ✅      │
├─────────────────────────┤
│ 🎬 AI Tools Panel       │
│                         │
│ ▶ Add Captions/Subtitles│  ← Auto-captions (Whisper)
│ ▶ Generate Caption      │  ← Social caption
│ ▶ Suggest Hashtags      │  ← Hashtags
│ ▶ Create Thumbnail Text │  ← Thumbnail text
│ ▶ Generate Hooks        │  ← Viral hooks
│                         │
│ [Apply Tools] [Schedule]│
└─────────────────────────┘
```

**User Flow**:
1. User generates video → Success
2. **AI Tools Panel appears** with all relevant tools
3. User clicks "Add Captions" → Video transcribed → Captions burned in
4. User clicks "Generate Caption" → 5 caption options → Pick one
5. User clicks "Suggest Hashtags" → 30 hashtags categorized → Copy
6. Click "Schedule Post" → Goes to scheduler with caption + hashtags pre-filled

---

### 2. Image Generation Workflow

**Location**: `/create` → Image Generator

**Tools Available**:
```
┌─────────────────────────┐
│ Image Generated ✅      │
├─────────────────────────┤
│ 🎨 AI Tools Panel       │
│                         │
│ ▶ Generate Caption      │  ← Social caption
│ ▶ Suggest Hashtags      │  ← Hashtags
│ ▶ Create Thumbnail Text │  ← Thumbnail text (for video thumbs)
│                         │
│ [Apply Tools] [Schedule]│
└─────────────────────────┘
```

**User Flow**:
1. User generates image → Success
2. **AI Tools Panel appears**
3. Click "Generate Caption" → Get caption suggestions
4. Click "Schedule Post" → Scheduler with caption/hashtags

---

### 3. Standalone AI Tools Page

**Location**: `/tools` (NEW PAGE)

**Layout**:
```
┌──────────────────────────────────────┐
│ 🤖 AI Content Tools                  │
├──────────────────────────────────────┤
│                                      │
│ ┌─────────────┐  ┌─────────────┐   │
│ │ 💬 Caption  │  │ #️⃣ Hashtags │   │
│ │ Generator   │  │  Generator  │   │
│ │ 2 tokens    │  │  1 token    │   │
│ └─────────────┘  └─────────────┘   │
│                                      │
│ ┌─────────────┐  ┌─────────────┐   │
│ │ 🎣 Hook     │  │ 📅 Content  │   │
│ │ Generator   │  │  Calendar   │   │
│ │ 2 tokens    │  │  10 tokens  │   │
│ └─────────────┘  └─────────────┘   │
│                                      │
│ ┌─────────────┐  ┌─────────────┐   │
│ │ 🖼️ Thumbnail │  │ 🎤 Transcribe│  │
│ │ Text Gen    │  │  Video      │   │
│ │ 1 token     │  │  ~2 tok/min │   │
│ └─────────────┘  └─────────────┘   │
│                                      │
│ ┌─────────────┐                     │
│ │ 💬 Auto     │                     │
│ │ Captions    │                     │
│ │ ~3 tok/min  │                     │
│ └─────────────┘                     │
└──────────────────────────────────────┘
```

**User Flow**:
1. User navigates to `/tools`
2. Sees all AI tools as cards
3. Clicks a tool → Opens tool interface
4. Inputs data → Generates result
5. Copies result or saves to library

---

### 4. Post Editor/Scheduler

**Location**: `/schedule` or `/edit`

**Tools Available**:
```
┌─────────────────────────────────────┐
│ Schedule Post                       │
├─────────────────────────────────────┤
│ [Media Upload/URL]                  │
│                                     │
│ Caption:                            │
│ [Text Area] [🤖 AI Generate]       │  ← Caption generator
│                                     │
│ Hashtags:                           │
│ [Text Area] [#️⃣ AI Suggest]       │  ← Hashtag generator
│                                     │
│ If Video:                           │
│ [ ] Add Auto-Captions               │  ← Auto-captions
│ [ ] Transcribe Audio                │  ← Transcription
│                                     │
│ Thumbnail (for video):              │
│ [Upload] [🎨 AI Text Ideas]        │  ← Thumbnail text
│                                     │
│ [Schedule] [Save Draft]             │
└─────────────────────────────────────┘
```

**User Flow**:
1. User uploads video/image or pastes URL
2. Click "AI Generate" next to caption → Get suggestions
3. Click "AI Suggest" next to hashtags → Get hashtags
4. If video: Toggle "Add Auto-Captions" → Captions burned in
5. Schedule post with all AI-generated content

---

### 5. Content Library Integration

**Location**: `/library` → View Saved Content

**Tools Available**:
- Regenerate captions for old posts
- Add captions to old videos
- Generate hashtags for archived content
- Bulk operations (add captions to multiple videos)

---

## 🔌 Technical Architecture

### API Structure

```
/api/ai/tools (POST)
├─ tool: 'caption' | 'hashtag' | 'hook' | 'calendar' | 'thumbnail'
├─ input: string
├─ platform?: string
├─ niche?: string
└─ Returns: { result, tokensUsed, newBalance }

/api/ai/transcribe (POST)
├─ videoUrl: string
├─ duration: number
└─ Returns: { transcript, srt, vtt, tokensUsed }

/api/ai/auto-captions (POST)
├─ videoUrl: string
├─ duration: number
├─ style?: { fontFamily, fontSize, color, position }
└─ Returns: { videoUrl (with captions), tokensUsed }
```

### Token Costs

| Tool | Base Cost | Variable Cost | Example |
|------|-----------|---------------|---------|
| Caption | 2 tokens | - | 1 use = 2 tokens |
| Hashtag | 1 token | - | 1 use = 1 token |
| Hook | 2 tokens | - | 1 use = 2 tokens |
| Calendar | 10 tokens | - | 1 use = 10 tokens |
| Thumbnail | 1 token | - | 1 use = 1 token |
| Transcription | - | ~2 tokens/min | 5 min video = 10 tokens |
| Auto-Captions | - | ~3 tokens/min | 5 min video = 15 tokens |

### Free Tier Impact

**Free Tier**: 300 tokens/month

**Example Usage**:
- Generate 3 videos (60 tokens)
- Add captions to 2 videos (30 tokens for 5 min each)
- Generate 50 captions (100 tokens)
- Generate 50 hashtag sets (50 tokens)
- Generate 10 hooks (20 tokens)
- **Total**: 260 tokens → Still 40 tokens left!

---

## 🎨 UI Components

### 1. AI Tools Button Component
```tsx
<AIToolsButton
  context="video" | "image" | "post"
  mediaUrl={videoUrl}
  onApply={(result) => applyToContent(result)}
/>
```

### 2. AI Tools Panel Component
```tsx
<AIToolsPanel
  tools={['caption', 'hashtag', 'hook', 'thumbnail']}
  mediaUrl={videoUrl}
  onToolComplete={(tool, result) => handleResult(tool, result)}
/>
```

### 3. Inline AI Generator Button
```tsx
<TextArea
  placeholder="Enter caption..."
  aiSuggest={{
    tool: 'caption',
    input: videoTopic,
    onSelect: (caption) => setCaption(caption)
  }}
/>
```

---

## 📋 Implementation Checklist

### Phase 1: Core APIs ✅
- [x] Create `/api/ai/tools` endpoint
- [x] Add token operations to config
- [x] Add TypeScript types
- [x] Implement caption generation
- [x] Implement hashtag generation
- [x] Implement hook generation
- [x] Implement content calendar
- [x] Implement thumbnail text generation

### Phase 2: Transcription APIs (NEXT)
- [ ] Create `/api/ai/transcribe` endpoint (Whisper)
- [ ] Create `/api/ai/auto-captions` endpoint
- [ ] Test with sample videos
- [ ] Handle different video formats

### Phase 3: UI Components
- [ ] Create `AIToolsButton` component
- [ ] Create `AIToolsPanel` component
- [ ] Create standalone tools page (`/tools`)
- [ ] Create tool result display components
- [ ] Add loading states and error handling

### Phase 4: Integration
- [ ] Integrate into video generation workflow
- [ ] Integrate into image generation workflow
- [ ] Integrate into post scheduler
- [ ] Integrate into content library
- [ ] Add bulk operations

### Phase 5: Polish
- [ ] Add tool usage analytics
- [ ] Create tutorial/onboarding
- [ ] Add keyboard shortcuts
- [ ] Optimize token costs
- [ ] Add A/B testing for generated content

---

## 🚀 Quick Start for Users

### Generate a Video with Full AI Workflow:

1. **Go to `/create`** → Generate Video
2. **Video generates** → AI Tools Panel appears
3. **Click "Add Captions"** → Transcription + captions added (15 tokens for 5 min video)
4. **Click "Generate Caption"** → Get 5 caption options (2 tokens)
5. **Click "Suggest Hashtags"** → Get 30 hashtags (1 token)
6. **Click "Generate Hooks"** → Get 7 viral hooks (2 tokens)
7. **Total cost**: 20 tokens for fully AI-powered video post

### Use Standalone Tools:

1. **Go to `/tools`**
2. **Pick any tool** → Input your content
3. **Generate** → Get results
4. **Copy or Save** to library

### Quick Caption Generation:

1. **Go to `/schedule`**
2. **Upload media**
3. **Click "AI Generate"** next to caption
4. **Pick from 5 options** → Done!

---

## 💡 Power User Features (Future)

### 1. Saved Templates
- Save favorite caption styles
- Save hashtag combinations
- Reuse successful hooks

### 2. Bulk Operations
- Add captions to 10 videos at once
- Generate captions for entire content library
- Batch hashtag generation

### 3. AI Workflows
- Create automated workflows: "Generate video → Add captions → Create caption → Schedule"
- One-click content creation pipelines

### 4. Personalization
- AI learns your brand voice
- Suggest captions in your style
- Auto-apply your preferred hashtags

---

## 📊 Success Metrics

**Track**:
- Most used tool (caption? hashtag?)
- Average tokens per user per month
- Tool completion rate
- Time saved per tool use
- User satisfaction (NPS score)

**Optimize for**:
- Fast generation (<3 seconds)
- High quality results (>80% user acceptance)
- Low token cost (<50% of user's monthly allocation)

---

## 🔧 Technical Notes

### OpenAI API Usage

**Models**:
- Caption/Hashtag/Hook/Thumbnail: `gpt-4o-mini` (cheap, fast)
- Content Calendar: `gpt-4o-mini` (longer output)
- Transcription: `whisper-1` (audio → text)

**Cost per call**:
- gpt-4o-mini: ~$0.003-$0.02 per request
- whisper-1: $0.006 per minute

### Video Caption Burning

**Options**:
1. **FFmpeg** (Local) - Free, fast, requires server processing
2. **Shotstack API** - $0.05 per minute, cloud-based
3. **Creatomate API** - $0.08 per minute, more features

**Recommendation**: Start with FFmpeg for MVP, scale to Shotstack if needed

### Caching Strategy

- Cache generated captions for 30 days (save tokens on re-use)
- Cache transcriptions permanently (audio doesn't change)
- Don't cache hooks/hashtags (trends change)

---

**Status**: 🔄 Phase 1 Complete | Phase 2 In Progress
**Next**: Build transcription API + Create standalone tools page
