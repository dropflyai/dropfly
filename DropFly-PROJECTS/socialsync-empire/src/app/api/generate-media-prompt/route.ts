import { NextResponse } from 'next/server';
import { generateBrandedMediaPrompt, MediaGenerationContext } from '@/lib/media-prompt-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, content, format, tone, contentType } = body;

    if (!topic || !content || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, content, format' },
        { status: 400 }
      );
    }

    const context: MediaGenerationContext = {
      topic,
      content,
      format: format as 'Carousel' | 'Reel' | 'Infographic',
      tone: tone || 'Educational',
      contentType,
    };

    const brandedPrompt = generateBrandedMediaPrompt(context);

    return NextResponse.json({
      success: true,
      prompt: brandedPrompt,
      context: {
        topic,
        format,
        detectedType: contentType || 'auto-detected',
      },
    });
  } catch (error) {
    console.error('Error generating media prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate media prompt',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve the n8n integration code
export async function GET() {
  const n8nCode = `// BRANDED MEDIA PROMPT GENERATOR FOR N8N
// Copy this entire function into your n8n Code node

function generateBrandedMediaPrompt(topic, content, format, tone) {
  // Detect content type from topic and content
  const combined = (topic + ' ' + content).toLowerCase();
  let contentType = 'educational';

  if (combined.match(/\\b(how to|tutorial|learn|guide|steps|tips|explained)\\b/)) {
    contentType = 'educational';
  } else if (combined.match(/\\b(imagine|could|would|scenario|example|maya|business)\\b/)) {
    contentType = 'hypotheticalCaseStudy';
  } else if (combined.match(/\\b(vs|versus|compare|review|tool|app|software|better|worse)\\b/)) {
    contentType = 'toolReview';
  } else if (combined.match(/\\b(trend|future|why|industry|market|insight|analysis)\\b/)) {
    contentType = 'industryInsight';
  } else if (combined.match(/\\b(stop|never|always|mistake|hack|trick|secret|now)\\b/)) {
    contentType = 'quickWin';
  }

  // Visual styles for each content type
  const styles = {
    educational: {
      visualStyle: 'Clean infographic with bold text, modern layouts, YouTube thumbnail energy',
      mood: 'Approachable and empowering',
      elements: 'clear typography, step-by-step visuals, icons, diagrams',
      colors: 'deep purple, electric blue, bright yellow'
    },
    hypotheticalCaseStudy: {
      visualStyle: 'Real LA business scenario with tech overlays, relatable and inspiring',
      mood: 'Realistic and inspiring',
      elements: 'local business imagery, real people working, technology in action, results',
      colors: 'sunset orange, vibrant cyan, clean white'
    },
    toolReview: {
      visualStyle: 'Split screen comparison, honest and practical, no BS',
      mood: 'Straight talk and practical',
      elements: 'app screenshots, side-by-side comparisons, pros/cons lists',
      colors: 'modern gray, deep black, bright yellow accents'
    },
    industryInsight: {
      visualStyle: 'Bold statements with data viz, futuristic but accessible, tech-forward',
      mood: 'Confident and forward-thinking',
      elements: 'bold typography, data charts, trend arrows, tech aesthetics',
      colors: 'deep purple, electric blue, hot pink'
    },
    quickWin: {
      visualStyle: 'Punchy single message, high contrast, stop-scrolling energy',
      mood: 'Urgent and actionable',
      elements: 'large bold text, single focal point, clear CTA visual',
      colors: 'sunset orange, deep black, clean white'
    }
  };

  // Scene suggestions based on content
  let sceneSuggestion = '';
  if (content.match(/\\b(salon|nail|beauty|spa)\\b/i)) {
    sceneSuggestion = 'Modern nail salon in Inglewood with tech touches';
  } else if (content.match(/\\b(restaurant|food|dining)\\b/i)) {
    sceneSuggestion = 'Small LA restaurant with AI kiosk';
  } else if (content.match(/\\b(apartment|property|tenant|landlord)\\b/i)) {
    sceneSuggestion = 'South LA apartment building with modern tech';
  } else if (content.match(/\\b(barbershop|barber|haircut)\\b/i)) {
    sceneSuggestion = 'Local barbershop with tablet check-in';
  } else if (content.match(/\\b(store|retail|shop)\\b/i)) {
    sceneSuggestion = 'LA corner store with digital screens';
  } else {
    sceneSuggestion = 'Modern tech workspace with LA urban aesthetic';
  }

  const style = styles[contentType] || styles.educational;

  // Build the branded prompt
  const parts = [];

  // What to create
  parts.push(\`Create a professional \${format === 'Reel' ? 'video for Instagram Reels' : 'image for Instagram ' + format}\`);
  parts.push(\`about: "\${topic}"\`);

  // Visual style
  parts.push(\`Visual style: \${style.visualStyle}\`);
  parts.push(\`Mood: \${style.mood}\`);

  // Brand identity
  parts.push('Brand aesthetic: Inglewood/View Park/Los Angeles tech company - modern, urban, professional but approachable');

  // Colors
  parts.push(\`Colors: \${style.colors}\`);

  // Elements
  parts.push(\`Include elements: \${style.elements}\`);

  // Setting
  if (sceneSuggestion) {
    parts.push(\`Setting: \${sceneSuggestion}\`);
  }

  // Composition
  if (format === 'Reel') {
    parts.push('Composition: Vertical 9:16 format, smooth professional movement, clear story in first 3 seconds');
  } else {
    parts.push('Composition: Bold title at top, clear visual in center, readable from thumbnail. Leave 30% of image for text overlay');
  }

  // Quality standards
  parts.push('Quality: 4K resolution, Instagram-optimized, professional but natural LA lighting');
  parts.push('Authenticity: Real scenarios not stock photos, authentic LA diversity - Black, Latino, Asian, mixed communities');

  // Always include
  parts.push('Professional quality, modern clean design, LA urban aesthetic, authentic and relatable');

  // Avoid
  parts.push('AVOID: Generic stock photos, corporate boardroom, fake staged scenarios, Silicon Valley bro culture');

  // Final touch
  parts.push('Make it scroll-stopping, authentic, and perfectly aligned with a South LA tech brand that keeps it real');

  return parts.join('. ') + '.';
}

// USAGE IN YOUR N8N WORKFLOW:
// Replace your existing prompt generation with this

const items = [];
for (const item of $input.all()) {
  const post = item.json;

  const brandedPrompt = generateBrandedMediaPrompt(
    post.Topic || post.topic,
    post.Content || post.content,
    post['Post Format'] || post.postFormat || 'Carousel',
    post.Tone || post.tone
  );

  items.push({
    ...post,
    mediaPrompt: brandedPrompt,
    // Keep your existing logic for service selection, etc.
  });
}

return items;`;

  return NextResponse.json({
    code: n8nCode,
    instructions: 'Copy this code into your n8n Code node to generate branded media prompts',
  });
}
