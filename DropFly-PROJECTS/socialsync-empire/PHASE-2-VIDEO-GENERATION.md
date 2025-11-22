# Phase 2: Video Generation Integration

## Overview
Integrate AI video generation to automatically create videos from generated scripts.

## API Options Analysis

### 1. FAL.AI (Recommended ⭐)
- **Pricing**: $0.10-0.50 per video (10-50 tokens equivalent)
- **Quality**: High quality, fast generation
- **Features**: Text-to-video, image-to-video, video editing
- **API**: Simple REST API
- **Speed**: 30-120 seconds per video
- **Max Length**: Up to 3 minutes
- **Best For**: Cost-effective, high-volume automation

### 2. RunwayML
- **Pricing**: $12/month + $0.05/sec of video
- **Quality**: Highest quality, cinematic
- **Features**: Gen-2 text-to-video, motion brush
- **Speed**: 60-180 seconds per video
- **Best For**: Premium quality content

### 3. D-ID (Avatar Videos)
- **Pricing**: $0.30 per video (30 tokens)
- **Quality**: Realistic talking avatars
- **Features**: Photo + script → talking avatar
- **Speed**: 20-60 seconds per video
- **Best For**: Presenter-style videos

### 4. HeyGen
- **Pricing**: $24/month for 10 credits
- **Quality**: Very realistic avatars
- **Features**: AI avatars, voice cloning
- **Best For**: Professional presenter videos

## Recommendation: Start with FAL.AI

**Why FAL.AI**:
- ✅ Most cost-effective ($0.10-0.30 per video vs $0.50+ others)
- ✅ Fast generation (30-60 seconds)
- ✅ Simple API integration
- ✅ Good quality for social media
- ✅ No monthly subscription needed
- ✅ Can upgrade to D-ID/HeyGen later for avatars

## Implementation Plan

### Step 1: Create Video Generation API Endpoint
**File**: `src/app/api/ai/generate-video/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, campaign_post_id, brand_colors } = await request.json();

    // Token cost for video generation
    const tokenCost = 75; // ~$0.75 worth

    // Deduct tokens
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'video_generation',
      cost: tokenCost,
      description: `Video generation for campaign post`,
      metadata: { campaign_post_id }
    });

    if (!deductionResult.success) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        required: tokenCost
      }, { status: 403 });
    }

    try {
      // Call FAL.AI API
      const falResponse = await fetch('https://fal.run/fal-ai/fast-sdxl', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.FAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: buildVideoPrompt(script, brand_colors),
          num_inference_steps: 25,
          guidance_scale: 7.5,
          num_images: 1
        })
      });

      const videoData = await falResponse.json();

      // Upload to Supabase Storage
      const videoBlob = await fetch(videoData.images[0].url).then(r => r.blob());
      const fileName = `${user.id}/${campaign_post_id}/${Date.now()}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(fileName);

      // Update campaign post with video URL
      await supabase
        .from('campaign_posts')
        .update({
          video_url: publicUrl,
          status: 'video_ready'
        })
        .eq('id', campaign_post_id);

      return NextResponse.json({
        success: true,
        video_url: publicUrl,
        tokensUsed: tokenCost
      });

    } catch (apiError: any) {
      // Refund tokens on failure
      if (deductionResult.transaction?.id) {
        await tokenService.refundTokens(
          user.id,
          deductionResult.transaction.id,
          'Video generation failed'
        );
      }
      throw apiError;
    }

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Video generation failed'
    }, { status: 500 });
  }
}

function buildVideoPrompt(script: any, brandColors: any) {
  return `Create a dynamic social media video with:
- Hook: ${script.hook}
- Main message: ${script.script}
- CTA: ${script.cta}
- Style: Modern, engaging, mobile-optimized
- Colors: ${brandColors?.primary || '#9333ea'}, ${brandColors?.secondary || '#3b82f6'}
- Duration: 30-60 seconds
- Format: 9:16 (vertical for TikTok/Instagram)`;
}
```

### Step 2: Create Video Generation Cron Job
**File**: `src/app/api/cron/generate-campaign-videos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Find posts with scripts ready but no video
    const { data: readyPosts } = await supabase
      .from('campaign_posts')
      .select('*, campaigns!inner(*)')
      .eq('status', 'ready')
      .is('video_url', null)
      .limit(10); // Process 10 at a time

    if (!readyPosts?.length) {
      return NextResponse.json({
        success: true,
        message: 'No posts ready for video generation',
        processed: 0
      });
    }

    const results = {
      processed: readyPosts.length,
      succeeded: 0,
      failed: 0
    };

    for (const post of readyPosts) {
      try {
        // Get brand colors if available
        let brandColors = null;
        if (post.campaigns.brand_package_id) {
          const { data: brand } = await supabase
            .from('brand_packages')
            .select('primary_color, secondary_color, accent_color')
            .eq('id', post.campaigns.brand_package_id)
            .single();
          brandColors = brand;
        }

        // Call video generation API
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ai/generate-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: post.script,
            campaign_post_id: post.id,
            brand_colors: brandColors
          })
        });

        if (response.ok) {
          results.succeeded++;
        } else {
          results.failed++;
        }

      } catch (error) {
        results.failed++;
        console.error(`Failed to generate video for post ${post.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
```

### Step 3: Update vercel.json
Add video generation cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-campaign-posts",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/generate-campaign-videos",
      "schedule": "15 * * * *"
    }
  ]
}
```

### Step 4: Update Token Service
Add video_generation operation:

**File**: `src/lib/tokens/token-service.ts`

Add to operation costs:
```typescript
video_generation: 75, // ~$0.75
```

### Step 5: Create Storage Bucket
In Supabase dashboard:
1. Go to Storage
2. Create new bucket: `campaign-videos`
3. Set to public
4. Add RLS policies (users can upload/view their own)

### Step 6: Environment Variables
Add to `.env.local`:
```
FAL_API_KEY=your_fal_api_key_here
```

## Testing Plan

1. Create campaign with brand package
2. Wait for script generation (cron)
3. Manually trigger video cron: `curl http://localhost:3010/api/cron/generate-campaign-videos`
4. Check `campaign_posts` table for video_url
5. Verify video plays and shows brand colors

## Alternative: Use D-ID for Avatar Videos

If you want talking avatar videos instead:

```typescript
// D-ID API call
const didResponse = await fetch('https://api.d-id.com/talks', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${process.env.DID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    script: {
      type: 'text',
      input: script.script,
      provider: {
        type: 'microsoft',
        voice_id: 'en-US-JennyNeural'
      }
    },
    source_url: avatarImageUrl, // From brand_avatars table
    config: {
      stitch: true
    }
  })
});
```

## Cost Analysis

### Per Video (FAL.AI):
- API Cost: $0.30
- Token Cost: 75 tokens ($0.75 to user)
- Profit Margin: $0.45

### Monthly (100 videos):
- API Cost: $30
- Token Revenue: $75
- Net Profit: $45

### Monthly (1000 videos):
- API Cost: $300
- Token Revenue: $750
- Net Profit: $450

## Success Criteria

- ✅ Videos auto-generated from scripts
- ✅ Brand colors applied to videos
- ✅ Videos stored in Supabase
- ✅ Token deduction working
- ✅ Cron runs every 15 minutes
- ✅ Error handling with refunds
- ✅ Video preview in campaign detail page

## Next Steps After Phase 2

- Add video editing capabilities
- Add custom intro/outro clips
- Add logo overlay to videos
- Add background music
- Add captions/subtitles
- Multiple video styles (animated, live-action, avatar)
