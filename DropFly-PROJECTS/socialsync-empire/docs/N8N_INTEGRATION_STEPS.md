# How to Add Branded Media to Your n8n Workflow

## Quick Summary
Replace the code in your **"🎨 Super Media Generator Brain"** node with the branded version that includes your LA/South LA visual identity.

## Step-by-Step Instructions

### 1. Open Your n8n Workflow
1. Go to https://botthentic.com (your n8n instance)
2. Open your content workflow
3. Find the node named **"🎨 Super Media Generator Brain"**

### 2. Replace the Code

1. **Click** on the "🎨 Super Media Generator Brain" node
2. **Select All** the existing code (Ctrl+A or Cmd+A)
3. **Delete** it
4. **Copy** the entire code from `N8N_BRANDED_MEDIA_CODE.js`
5. **Paste** it into the node
6. **Click "Execute Node"** to test

### 3. What Changed

The key change is the new `generateBrandedMediaPrompt()` function that replaces the old generic prompt generation.

**OLD** (Generic):
```javascript
function generateAdvancedPrompt(context, contentAnalysis, visualTheme, selectedGenerator) {
  let prompt = `Create a stunning ${format} for Instagram about "${context.topic}"...`;
  // Generic prompt
}
```

**NEW** (Branded):
```javascript
function generateBrandedMediaPrompt(topic, content, format, tone, contentAnalysis) {
  // Detects content type (educational, case study, tool review, etc.)
  // Applies YOUR brand colors (purple/blue/cyan, orange/yellow/pink)
  // Suggests YOUR LA locations (Inglewood salons, View Park offices, etc.)
  // Uses YOUR brand voice (urban, professional but approachable, South LA authentic)
  // AVOIDS: Stock photos, corporate vibes, Silicon Valley culture
}
```

### 4. Test It

1. **Save** the workflow (Ctrl+S)
2. **Activate** the workflow (toggle switch at top)
3. **Manually trigger** or wait for next scheduled run
4. **Check the prompt** being sent to your media generators

### 5. Verify Branded Prompts

Look for these elements in the generated prompts:

✅ **Brand Location**: "Inglewood/View Park/Los Angeles tech company"
✅ **Brand Voice**: "modern, urban, professional but approachable, South LA authentic"
✅ **Your Colors**: "deep purple, electric blue, bright yellow" OR "sunset orange, vibrant cyan"
✅ **Real LA Scenes**: "Modern nail salon in Inglewood" OR "South LA apartment building"
✅ **Authenticity**: "Real scenarios not stock photos, authentic LA diversity"
✅ **Avoid List**: "AVOID: Generic stock photos, corporate boardroom, Silicon Valley bro culture"

## Example Branded Prompt Output

When you test, you should see prompts like this:

```
Create a professional image for Instagram Carousel about:
"Stop Missing Calls. Maya Answers 24/7".

Visual style: Real LA business scenario with tech overlays, relatable and inspiring.
Mood: Realistic and inspiring.
Brand aesthetic: Inglewood/View Park/Los Angeles tech company - modern, urban,
professional but approachable, South LA authentic.
Colors: sunset orange, vibrant cyan, clean white.
Include elements: local business imagery, real people working, technology in action, results.
Setting: Modern nail salon in Inglewood with tech touches.
Composition: Bold title at top, clear visual in center, readable from thumbnail.
Leave 30% of image for text overlay.
Quality: 4K resolution, Instagram-optimized, professional but natural LA lighting.
Authenticity: Real scenarios not stock photos, authentic LA diversity - Black, Latino,
Asian, mixed communities.
Professional quality, modern clean design, LA urban aesthetic, authentic and relatable.
AVOID: Generic stock photos, corporate boardroom vibes, fake staged scenarios,
Silicon Valley bro culture, overly polished unrealistic imagery.
Make it scroll-stopping, authentic, and perfectly aligned with a South LA tech brand
that keeps it real.
```

## Troubleshooting

### "Prompt looks the same"
- Make sure you replaced the ENTIRE code in the node
- Check the `PROMPT_VERSION` at the top - should say `"v3.0-branded"`
- Execute the node and check the output

### "Getting errors"
- Copy the exact error message
- Check that all your API credentials are still connected
- Make sure you didn't accidentally delete any closing braces `}`

### "Want to customize further"
- Edit the `styles` object in the `generateBrandedMediaPrompt()` function
- Change colors, mood descriptions, or visual styles
- Update the `sceneSuggestion` logic to add more LA locations

## What This Fixes

**Before** (Generic):
- Stock photo vibes
- Could be from any tech company
- No personality or local flavor
- Generic corporate aesthetic

**After** (Branded):
- Unmistakably YOUR brand
- LA/South LA authenticity
- Real business scenarios
- Urban, professional but approachable
- Speaks to your community

## Next Steps

After integrating:

1. **Generate 5-10 posts** to test the new prompts
2. **Compare the media** - should look way more on-brand
3. **Adjust if needed** - edit colors, styles, or scenes in the code
4. **Share with your partner** - they can make changes too

## Need Help?

Check the visual brand config:
- Dashboard: http://localhost:3000/branding
- Config file: `config/visual-brand.json`
- This guide: `BRANDED_MEDIA_SETUP.md`

---

**Ready to make your content look like it's actually from YOUR brand? Let's do this! 🔥**
