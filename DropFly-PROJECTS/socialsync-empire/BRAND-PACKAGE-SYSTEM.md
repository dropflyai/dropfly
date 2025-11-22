# 🎨 Brand Package System

**Status**: API Complete ✅ | UI In Progress
**Purpose**: Allow users to upload brand assets and customize AI content generation

---

## 📋 Overview

The Brand Package System enables users to create comprehensive brand profiles (EPKs) that include:
- **Brand Identity** - Mission, voice, personality, values
- **Visual Assets** - Logos, product photos, reference images
- **AI Avatars** - Photos for creating AI-generated avatars
- **Content Guidelines** - Do's, don'ts, tone, style preferences
- **Brand Colors** - Primary, secondary, accent colors

This data is used to personalize AI-generated content, making scripts and videos perfectly aligned with the user's brand.

---

## 🗄️ Database Schema

### 1. `brand_packages` Table
Main brand information storage

**Columns**:
- `id` - UUID primary key
- `user_id` - References auth.users
- `name` - Brand name (required)
- `tagline` - Brand tagline
- `mission_statement` - Brand mission
- `brand_voice` - e.g., "Professional", "Casual"
- `brand_personality` - e.g., "Innovative", "Bold"
- `target_audience` - Target demographic
- `key_values` - Array of brand values
- `primary_color`, `secondary_color`, `accent_color` - Hex codes
- `logo_url`, `logo_dark_url` - Uploaded logo URLs
- `website_url` - Brand website
- `social_handles` - JSONB with platform handles
- `industry` - Business industry
- `established_year` - Year founded
- `description` - Brand description
- `is_default` - One default brand per user
- `status` - 'active' or 'archived'
- Timestamps

### 2. `brand_assets` Table
Uploaded files (logos, photos, avatars)

**Asset Types**:
- `logo` - Main logo
- `logo_dark` - Dark mode logo
- `product_photo` - Product images
- `reference_image` - Style references
- `avatar_photo` - Photos for AI avatars
- `background_image` - Background assets
- `banner_image` - Banner/header images
- `other` - Miscellaneous

**Columns**:
- `id`, `brand_package_id`, `user_id`
- `asset_type` - Type from list above
- `file_name`, `file_url` - File details
- `file_size`, `mime_type` - File metadata
- `title`, `description` - Asset description
- `tags` - Array of tags
- `usage_count`, `last_used_at` - Usage tracking
- Timestamps

### 3. `brand_guidelines` Table
Content creation guidelines

**Columns**:
- `id`, `brand_package_id`, `user_id`
- `dos`, `donts` - Arrays of guidelines
- `preferred_topics`, `avoided_topics` - Topic preferences
- `tone_guidelines`, `writing_style` - Style guides
- `humor_level` - 'none', 'light', 'moderate', 'heavy'
- `formality_level` - 'casual', 'semi-formal', 'formal'
- `default_cta`, `cta_style` - Call-to-action preferences
- `branded_hashtags`, `preferred_hashtags` - Hashtag strategy
- `preferred_video_length`, `preferred_music_genre` - Video prefs
- Timestamps

### 4. `brand_avatars` Table
AI avatar configurations

**Avatar Types**:
- `self` - User themselves
- `team_member` - Team member
- `influencer` - Influencer/creator
- `character` - Branded character
- `ai_generated` - Fully AI-generated

**Columns**:
- `id`, `brand_package_id`, `user_id`
- `name` - Avatar name
- `avatar_type` - Type from list above
- `reference_image_urls` - Array of reference photos
- `gender`, `age_range`, `ethnicity` - Demographics
- `voice_type` - For future voice generation
- `personality_traits` - Array of traits
- `is_default` - Default avatar for brand
- `usage_count` - Usage tracking
- Timestamps

---

## 🔌 API Endpoints

### Brand Packages

**GET `/api/brand-packages`**
- List all user's brand packages
- Includes related assets, guidelines, avatars
- Returns array of brand packages

**POST `/api/brand-packages`**
- Create new brand package
- Required: `name`
- Optional: All other brand fields
- Returns created brand package

**GET `/api/brand-packages/[id]`**
- Get specific brand package with all data
- Includes assets, guidelines, avatars
- Returns single brand package

**PATCH `/api/brand-packages/[id]`**
- Update brand package
- Only updates provided fields
- Handles is_default logic (unsets others)
- Returns updated brand package

**DELETE `/api/brand-packages/[id]`**
- Delete brand package
- Cascades to delete assets, guidelines, avatars
- Returns success message

### File Uploads

**POST `/api/brand-packages/[id]/upload`**
- Upload brand asset (logo, photo, avatar, etc.)
- Accepts multipart/form-data
- Required fields:
  - `file` - Image file (JPG, PNG, GIF, WebP, SVG)
  - `asset_type` - Asset type (logo, product_photo, etc.)
- Optional fields:
  - `title` - Asset title
  - `description` - Asset description
- Max file size: 10MB
- Uploads to Supabase Storage `brand-assets` bucket
- Returns asset record with public URL

**DELETE `/api/brand-packages/[id]/upload?asset_id=[assetId]`**
- Delete specific asset
- Removes from storage and database
- Returns success message

---

## 🎨 Storage Structure

**Supabase Storage Bucket**: `brand-assets`

**File Path Format**: `{user_id}/{brand_package_id}/{timestamp}-{random}.{ext}`

**Example**:
```
a29fe625-5e29-459d-b7a1-c30d1a6d3532/
  └── 8f4b7c2a-1234-5678-90ab-cdef12345678/
      ├── 1699123456789-abc123.png (logo)
      ├── 1699123457890-def456.jpg (product photo)
      └── 1699123458901-ghi789.jpg (avatar reference)
```

**Public Access**: All files are publicly accessible via URL

**RLS Policies**: Users can only upload/delete their own files

---

## 🤖 AI Integration

### How Brand Packages Enhance AI Generation

When generating content, the AI will reference:

1. **Brand Voice & Personality**
   - Adjusts tone (professional vs casual)
   - Matches personality (bold vs minimalist)

2. **Mission & Values**
   - Aligns messaging with brand mission
   - Incorporates key values naturally

3. **Content Guidelines**
   - Follows do's and don'ts
   - Avoids unwanted topics
   - Uses preferred CTAs and hashtags

4. **Visual Assets**
   - References product photos for context
   - Uses brand colors in video generation
   - Applies logos to final videos

5. **Avatar Configuration**
   - Selects appropriate avatar for video
   - Matches voice type and personality

### Updated AI Prompt Structure

```typescript
const brandContext = brandPackage ? `

BRAND CONTEXT:
- Brand: ${brandPackage.name}
- Mission: ${brandPackage.mission_statement}
- Voice: ${brandPackage.brand_voice}
- Target Audience: ${brandPackage.target_audience}
- Key Values: ${brandPackage.key_values?.join(', ')}

CONTENT GUIDELINES:
- DO: ${guidelines?.dos?.join(', ')}
- DON'T: ${guidelines?.donts?.join(', ')}
- Tone: ${guidelines?.tone_guidelines}
- Humor Level: ${guidelines?.humor_level}

Use these brand guidelines to create content that perfectly aligns with the brand's identity.
` : '';

const prompt = `You are an expert content creator.${brandContext}

Create a video script about: "${topic}"
...
`;
```

---

## 📱 UI Components to Build

### 1. Brand Packages List Page
**Route**: `/brand-packages`

**Features**:
- Grid of brand package cards
- Show logo, name, industry
- "Create New Brand" button
- Default badge
- Click to edit

### 2. Create/Edit Brand Package Page
**Route**: `/brand-packages/create` and `/brand-packages/[id]/edit`

**Sections**:
- **Basic Info** - Name, tagline, description
- **Brand Identity** - Mission, voice, personality, values
- **Visual Identity** - Colors (color pickers), logo upload
- **Contact** - Website, social handles
- **Upload Zone** - Drag & drop for assets
- **Asset Gallery** - Uploaded logos, product photos, avatars
- **Guidelines** (optional advanced section)
  - Do's & Don'ts
  - Tone & style preferences
  - Hashtag strategy

### 3. Brand Package Selector
**Component**: Used in campaign creation and AI tools

**Features**:
- Dropdown to select brand package
- Shows logo and name
- "No brand" option for generic content
- Link to create/edit brand

### 4. Asset Upload Component
**Component**: Reusable upload widget

**Features**:
- Drag & drop zone
- File type validation
- Image preview
- Upload progress
- Asset type selector
- Title/description fields

---

## 🔐 Security & Privacy

- **RLS Enabled** on all brand tables
- Users can only see/edit their own brands
- **Storage Policies** restrict uploads to user's folder
- **File Validation** (type, size) on server side
- **Public URLs** for easy sharing but user-controlled

---

## 💰 Future Enhancements

### Phase 2: Advanced Features
- **Brand Templates** - Pre-made brand packages for common industries
- **Team Collaboration** - Share brand packages with team members
- **Brand Analytics** - Track which assets perform best
- **AI Brand Voice Training** - Fine-tune AI on brand's existing content
- **Multi-language Support** - Brand identity in multiple languages

### Phase 3: Video Generation Integration
- **Automatic Logo Overlay** - Add logo to all videos
- **Brand Color Themes** - Apply brand colors to video backgrounds
- **Custom Intro/Outro** - Upload branded video clips
- **Music Library** - Curated music matching brand style

---

## 📊 Token Economics

**Brand Package Operations**: FREE
- Creating brand packages
- Uploading assets
- Editing guidelines

**AI Content Generation with Brand Context**: 7 tokens
- Same cost as without brand package
- Brand context enhances quality at no extra cost
- Future: Premium brand features may require tokens

---

## 🎯 User Journey

1. **User signs up** → Prompted to create first brand package
2. **Upload logo** → Adds brand colors, mission
3. **Create campaign** → Selects brand package from dropdown
4. **AI generates content** → Uses brand voice, colors, guidelines
5. **Content published** → Perfectly aligned with brand identity
6. **User adds more brands** → Manages multiple clients/businesses

---

## ✅ Implementation Checklist

### Backend (Complete ✅)
- [x] Database schema & migration
- [x] Brand packages CRUD API
- [x] File upload API
- [x] Storage bucket configuration
- [x] RLS policies

### Frontend (Next Steps)
- [ ] Brand packages list page
- [ ] Create/edit brand package page
- [ ] Asset upload component
- [ ] Brand package selector component
- [ ] Color picker component
- [ ] Image gallery component

### Integration
- [ ] Update AI script generation to use brand context
- [ ] Update campaign creation to include brand selector
- [ ] Update cron job to fetch brand data
- [ ] Add brand preview in campaign detail

---

## 🚀 Next Session Goals

1. Build brand packages list UI
2. Build create/edit brand package form
3. Implement file upload component
4. Integrate brand package selector into campaign creation
5. Update AI prompts to include brand context

This will complete the brand package system and make AI content truly personalized! 🎨
