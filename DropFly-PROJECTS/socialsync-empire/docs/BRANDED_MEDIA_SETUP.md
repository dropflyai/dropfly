# Branded Media Generation Setup Guide

## Overview
This system ensures all generated media (images and videos) match your brand identity, visual style, and LA urban aesthetic.

## What Changed

### Before (Generic)
```
"Create a stunning image about AI automation"
```
Result: Generic stock photo that could be from any tech company

### After (Branded)
```
"Create a bold, eye-catching Instagram carousel about AI automation.
Visual style: Clean infographic with bold text, modern layouts, YouTube thumbnail energy.
Brand aesthetic: Inglewood/View Park/Los Angeles tech company - modern, urban, professional but approachable.
Colors: deep purple, electric blue, bright yellow.
Setting: South LA business with tech overlays.
Authenticity: Real scenarios not stock photos, authentic LA diversity.
AVOID: Generic corporate imagery, fake staged scenes."
```
Result: On-brand media that looks like it's from YOUR company

## Files Created

### 1. Visual Brand Configuration
**File**: `config/visual-brand.json`

Contains:
- Brand colors (primary, accent, neutral)
- Style keywords (modern, urban, tech-forward, LA aesthetic)
- Content type visual guides (educational, case studies, tool reviews, etc.)
- Scene suggestions (LA business settings, real people, tech elements)
- Composition rules (carousel vs reel layouts)
- Quality standards (resolution, lighting, authenticity, diversity)
- Example prompts for each content type

**To Update**: Edit this JSON file or create a UI page (like /branding)

### 2. Media Prompt Generator
**File**: `lib/media-prompt-generator.ts`

TypeScript utility that:
- Detects content type from topic/content
- Selects appropriate visual style
- Chooses brand colors for content type
- Suggests relevant LA business scenes
- Applies composition rules
- Generates complete branded prompts

### 3. n8n Integration Code
**File**: Included in `media-prompt-generator.ts`

JavaScript function you can copy into n8n Code nodes to generate branded prompts in your workflows.

## How to Use in n8n

### Option 1: API Call (Recommended)
Create an API endpoint in your dashboard that n8n can call:

```javascript
// In your n8n HTTP Request node
POST https://your-dashboard.com/api/generate-media-prompt

Body:
{
  "topic": "{{$json.Topic}}",
  "content": "{{$json.Content}}",
  "format": "{{$json['Post Format']}}",
  "tone": "{{$json.Tone}}"
}

// Response will include branded prompt
```

### Option 2: Copy Function to n8n Code Node

1. Open your media generation workflow in n8n
2. Find the Code node that generates prompts
3. Replace with the function from `getBrandedPromptForN8N()`
4. Update your existing prompt generation to use this function

**Example n8n Code Node**:
```javascript
// Paste the function from BRANDED_MEDIA_SETUP guide
function generateBrandedMediaPrompt(topic, content, format, tone) {
  // ... function code here ...
}

// Use it in your workflow
const items = [];
for (const item of $input.all()) {
  const prompt = generateBrandedMediaPrompt(
    item.json.Topic,
    item.json.Content,
    item.json['Post Format'],
    item.json.Tone
  );

  items.push({
    ...item.json,
    mediaPrompt: prompt
  });
}

return items;
```

### Option 3: Update Existing UPGRADED_SUPER_MEDIA_2025.js

Replace the `generateAdvancedPrompt()` function in your existing media generator with calls to the branded prompt generator.

## Visual Brand Identity

### Brand Colors
**Primary**: Deep purple, electric blue, vibrant cyan
**Accent**: Sunset orange, bright yellow, hot pink
**Neutral**: Clean white, modern gray, deep black

Think: LA sunset meets modern tech

### Style Keywords
- Modern & urban
- Tech-forward but approachable
- LA aesthetic (Inglewood, View Park, South LA)
- Professional without being corporate
- Community-focused & authentic

### Content Type Visual Styles

#### Educational Content
- **Style**: Clean infographic, bold text, modern layouts
- **Colors**: Primary + bright yellow accents
- **Elements**: Icons, diagrams, step-by-step visuals
- **Vibe**: YouTube thumbnail meets startup culture

#### Hypothetical Case Studies
- **Style**: Real LA business scenarios with tech overlays
- **Colors**: Warm tones (orange/cyan/white)
- **Elements**: Actual storefronts, working professionals, results
- **Vibe**: Relatable small business + innovative tech

#### Tool Reviews
- **Style**: Split screen comparisons, honest comparisons
- **Colors**: Neutral grays + yellow highlights
- **Elements**: App screenshots, pros/cons, ratings
- **Vibe**: Consumer Reports meets Instagram

#### Industry Insights
- **Style**: Bold statements, data visualization, futuristic
- **Colors**: Primary + dramatic pink accents
- **Elements**: Bold typography, charts, trend graphics
- **Vibe**: Tech news from the streets, not the boardroom

#### Quick Wins
- **Style**: Punchy, single message, minimal design
- **Colors**: High contrast (orange/black/white)
- **Elements**: Large text, single focal point
- **Vibe**: Stop-scrolling energy, impossible to miss

## LA Business Scenes

Your prompts can reference these authentic settings:
- Modern nail salon in Inglewood with tech touches
- LA corner store with digital screens
- South LA apartment building exterior
- Small restaurant with AI kiosk
- View Park home office setup
- Local barbershop with tablet check-in
- Crenshaw district storefront
- Community center with tech lab

## Quality Standards

### Always Include
- Professional quality & Instagram-optimized
- Modern, clean design
- LA urban aesthetic
- Authentic & relatable
- Proper diversity (authentic LA communities)

### Never Include
- Generic stock photos
- Corporate boardroom vibes
- Fake staged scenarios
- Silicon Valley bro culture stereotypes
- Overly polished/unrealistic imagery

## Testing Your Branded Media

### Step 1: Generate a Post
Use your content generation to create a post

### Step 2: Generate Branded Prompt
```javascript
const prompt = generateBrandedMediaPrompt({
  topic: "Stop Missing Calls. Maya Answers Even When You're Closed",
  content: "Your salon closes at 7pm but customers call until midnight...",
  format: "Carousel",
  tone: "Straight Talk"
});

console.log(prompt);
```

### Step 3: Use Prompt in Media Generator
Pass the branded prompt to Flux Pro, Recraft V3, Ideogram, or Higgsfield

### Step 4: Review Results
Check if the media:
- ✅ Matches your brand colors
- ✅ Feels authentic (not stock photo)
- ✅ Has LA/urban aesthetic
- ✅ Aligns with content type
- ✅ Represents diversity authentically

## Updating Your Visual Brand

To change your visual identity:

1. **Edit**: `config/visual-brand.json`
2. **Change**:
   - Brand colors
   - Style keywords
   - Scene suggestions
   - Quality standards
3. **Save**: All future media will use new settings
4. **Version control**: Like your brand voice config, track changes in git

## Example Prompt Outputs

### Educational Post
```
Create a bold, eye-catching image for Instagram carousel about:
"How to Set Up Your First AI Voice Agent in 10 Minutes".

Visual style: Clean infographic with bold text, modern layouts, YouTube thumbnail energy.
Mood: Approachable and empowering.
Brand aesthetic: Inglewood/View Park/Los Angeles tech company - modern, urban,
professional but approachable, LA aesthetic, clean design.
Colors: deep purple, electric blue, bright yellow.
Include elements: clear typography, step-by-step visuals, icons, diagrams.
Setting: Modern tech workspace or abstract digital environment with LA urban aesthetic.
Composition: Bold title at top, clear visual in center, readable from thumbnail,
Center or rule-of-thirds composition. Leave 30% of image for text overlay.
Quality: 4K minimum, Professional but not studio-fake natural LA light.
Authenticity: Real scenarios over stock photos, actual tech over fake interfaces.
Diversity: Authentic LA diversity - Black, Latino, Asian, mixed communities.
Professional quality, Instagram-worthy composition, Modern and clean design,
LA urban aesthetic, Authentic and relatable.
AVOID: Generic stock photo, Corporate boardroom, Fake staged scenarios,
Overly polished/unrealistic, Stereotypical imagery.
Make it scroll-stopping, authentic, and perfectly aligned with a South LA tech
brand that keeps it real.
```

### Case Study Post
```
Create a bold, eye-catching image for Instagram carousel about:
"How Maya Voice Agents Could Save Your Nail Salon $3K/Month".

Visual style: Real business scenarios, relatable small business settings.
Mood: Realistic and inspiring.
Brand aesthetic: Inglewood/View Park/Los Angeles tech company - modern, urban,
professional but approachable, community-focused, authentic.
Colors: sunset orange, vibrant cyan, clean white.
Include elements: local business imagery, real people working, technology in action,
results/numbers.
Setting: Modern nail salon in Inglewood with tech touches.
Composition: Bold title at top, clear visual in center, readable from thumbnail.
Leave 30% of image for text overlay.
Quality: 4K minimum, Professional but not studio-fake natural LA light.
Authenticity: Real scenarios over stock photos, actual tech over fake interfaces.
Diversity: Authentic LA diversity - Black, Latino, Asian, mixed communities.
AVOID: Generic stock photo, Corporate boardroom, Fake staged scenarios.
Make it scroll-stopping, authentic, and perfectly aligned with a South LA tech
brand that keeps it real.
```

## Next Steps

1. **Create API endpoint** (if using Option 1)
2. **Update n8n workflows** with branded prompt generation
3. **Test with a few posts** to see improvement
4. **Iterate on visual brand config** based on results
5. **Document your favorites** - save best prompts as examples

## Support

Questions? Check:
- `config/visual-brand.json` - All visual settings
- `lib/media-prompt-generator.ts` - Prompt generation logic
- Your n8n workflow's Code nodes - Where prompts are created

---

**Remember**: Great media isn't just technically good - it needs to FEEL like your brand.
This system ensures every image and video screams "South LA tech that keeps it real."
