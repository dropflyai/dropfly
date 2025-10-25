# UGC Video Integration Guide

**Powered by Higgsfield × WAN 2.5** - Product placement preset with native audio

## Why Higgsfield for CozyPaws

| Feature | Benefit |
|---------|---------|
| **Cost** | 2 free/day + unlimited on $9 tier (vs Kie.ai 60/mo then paid) |
| **Quality** | 1080p, 10s, native lip-sync + music + SFX in one call |
| **Speed** | 5-10s generation (faster than RunComfy WAN node) |
| **Preset** | "Product placement" auto camera orbit + pet-friendly audio |
| **Output** | No post-editing needed, ready for TikTok/Instagram Reels |

## Files Created

1. `/api/higgs-ugc/route.ts` - Main video generation endpoint
2. `/api/higgs-ugc/status/[jobId]/route.ts` - Job status polling
3. `supabase-migration-002-ugc-videos.sql` - Database schema
4. `UGCVideoGenerator.tsx` - Admin component
5. `UGCVideoGallery.tsx` - Product page component
6. `.env.example` - Environment variables

## Quick Start

### 1. Get Higgsfield API Key (30 seconds)

```bash
# Visit https://api.higgsfield.ai
# Sign up (GitHub OAuth)
# Copy API key from dashboard
# Set environment variable
export HIGGS_API_KEY=hf_...
```

### 2. Run Database Migration

```bash
psql $DATABASE_URL -f supabase-migration-002-ugc-videos.sql
```

### 3. Setup Cloudflare R2

```bash
# Create bucket
wrangler r2 bucket create cozypaws-ugc

# Set public access
wrangler r2 bucket cors update cozypaws-ugc \
  --allow-origin "*" \
  --allow-method GET \
  --allow-header "*"

# Get credentials
wrangler r2 bucket credentials create cozypaws-ugc
```

### 4. Environment Variables

```bash
HIGGS_API_KEY=hf_...           # Higgsfield API key
R2_ENDPOINT=https://...        # Cloudflare R2 endpoint
R2_ACCESS_KEY_ID=...           # R2 access key
R2_SECRET_ACCESS_KEY=...       # R2 secret
R2_BUCKET_NAME=cozypaws-ugc    # R2 bucket name
R2_PUBLIC_URL=https://ugc...   # Public CDN URL
```

### 5. Add to Product Detail Page

Update `src/app/product/[id]/page.tsx`:

```tsx
import { UGCVideoGallery } from '@/components/product/UGCVideoGallery';

{product.ugc_videos && product.ugc_videos.length > 0 && (
  <UGCVideoGallery videos={product.ugc_videos} />
)}
```

### 6. Add to Admin Dashboard

Create `src/app/admin/products/[sku]/page.tsx`:

```tsx
import { UGCVideoGenerator } from '@/components/admin/UGCVideoGenerator';

<UGCVideoGenerator sku={product.sku} productImage={product.images[0]} />
```

## API Usage

### Generate Video

```bash
curl -X POST https://cozypaws.com/api/higgs-ugc \
  -F "sku=DOG-TOY-001" \
  -F "imageFile=@product.png" \
  -F "pet_type=corgi"
```

**Response (200 - Completed):**
```json
{
  "jobId": "higgs-abc123",
  "url": "https://ugc.cozypaws.com/ugc/DOG-TOY-001-corgi-1234567890.mp4",
  "status": "completed",
  "hasAudio": true,
  "preset": "product_placement"
}
```

**Response (202 - Processing):**
```json
{
  "jobId": "higgs-abc123",
  "status": "processing",
  "message": "Video generation in progress. Check back later.",
  "checkUrl": "/api/higgs-ugc/status/higgs-abc123"
}
```

### Check Job Status

```bash
curl https://cozypaws.com/api/higgs-ugc/status/higgs-abc123
```

**Response:**
```json
{
  "jobId": "higgs-abc123",
  "status": "completed",
  "output_url": "https://higgsfield.ai/output/xyz.mp4",
  "progress": 100
}
```

## Workflow

1. Admin uploads product to catalog (or imports from CJ/AliExpress)
2. Admin clicks "Generate Video" in admin panel
3. Selects pet type (dog/cat/corgi/kitten/puppy/small pet)
4. API calls Higgsfield with:
   - Product image from catalog
   - Template prompt: "Cozy living room, {pet_type} playing, product in foreground..."
   - Preset: `product_placement` (auto camera orbit)
   - Audio: enabled (ambient music + SFX)
5. Polls job status every 1.5s (typical completion: 5-10s)
6. Downloads 1080p MP4 from Higgsfield
7. Uploads to Cloudflare R2 under `/ugc/{sku}-{pet_type}-{timestamp}.mp4`
8. Saves public URL to `products.ugc_videos[]` JSONB array
9. Video appears on product page in 9:16 mobile format with audio

## Product Placement Preset Features

- **Auto camera orbit**: Smooth right-orbit movement around product
- **Pet-friendly audio**: Ambient music + gentle SFX (no barking/meowing)
- **Lighting**: Warm afternoon sunlight simulation
- **Background**: Cozy modern living room with depth
- **Focus**: Product stays in foreground, pet in mid-ground
- **Duration**: 10 seconds (perfect for TikTok/Reels/Shorts)
- **Resolution**: 1080p (9:16 vertical)

## Cost Analysis

| Tier | Higgsfield | Kie.ai |
|------|------------|--------|
| Free | 2 videos/day | 60 videos/month |
| Paid | $9/mo unlimited | ~$0.50/video after 60 |
| Break-even | Month 1 if >60 vids | N/A |

**For CozyPaws**: If generating >2 videos/day in growth phase, $9 tier is cheaper than Kie.ai.

## GitHub Actions Integration

Add to `.github/workflows/ci.yml`:

```yaml
env:
  HIGGS_API_KEY: ${{ secrets.HIGGS_API_KEY }}
  R2_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
  R2_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
```

## Troubleshooting

### Video not generating after 30s
- Check Higgsfield API status: https://status.higgsfield.ai
- Verify API key is valid
- Check job status endpoint for error details

### Audio not playing on mobile
- iOS Safari requires user interaction before audio plays
- Add `muted` attribute to `<video>` tag for autoplay
- Show unmute button overlay

### R2 upload fails
- Verify R2 credentials are correct
- Check bucket CORS policy allows POST from your domain
- Ensure bucket exists: `wrangler r2 bucket list`

### Video quality lower than expected
- Higgsfield outputs 1080p by default
- Check source image is >720p
- Verify `aspect_ratio: '9:16'` is set

## Future Enhancements

- [ ] Batch generation for all products
- [ ] A/B test different pet types
- [ ] Track conversion lift from UGC videos
- [ ] Add "talking avatar" preset for product demos
- [ ] Generate storyboard variants (3-shot product tour)
- [ ] Custom LoRA fine-tuning for brand consistency

## Support

- Higgsfield docs: https://docs.higgsfield.ai
- Discord: https://discord.gg/higgsfield
- Email: support@higgsfield.ai
