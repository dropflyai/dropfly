import visualBrandConfig from '../config/visual-brand.json';
import { getBrandVoice } from './brand-voice';

interface VisualBrand {
  visualIdentity: {
    brandColors: {
      primary: string[];
      accent: string[];
      neutral: string[];
      description: string;
    };
    styleKeywords: string[];
    avoidKeywords: string[];
  };
  contentTypes: Record<string, {
    visualStyle: string;
    mood: string;
    elements: string[];
    colorPalette: string;
    example: string;
  }>;
  brandScenes: {
    businessSettings: string[];
    people: string[];
    techElements: string[];
  };
  compositionRules: {
    carousel: {
      layout: string;
      textSpace: string;
      focal: string;
      aspect: string;
    };
    reel: {
      layout: string;
      motion: string;
      pacing: string;
      text: string;
    };
  };
  qualityStandards: {
    resolution: string;
    lighting: string;
    authenticity: string;
    diversity: string;
    accessibility: string;
  };
  promptEnhancements: {
    alwaysInclude: string[];
    neverInclude: string[];
  };
  examplePrompts: Record<string, string>;
}

export function getVisualBrand(): VisualBrand {
  return visualBrandConfig as VisualBrand;
}

export interface MediaGenerationContext {
  topic: string;
  content: string;
  format: 'Carousel' | 'Reel' | 'Infographic';
  tone: string;
  contentType?: 'educational' | 'hypotheticalCaseStudy' | 'toolReview' | 'industryInsight' | 'quickWin';
}

export function generateBrandedMediaPrompt(context: MediaGenerationContext): string {
  const visual = getVisualBrand();
  const brand = getBrandVoice();

  // Detect content type from topic and content
  const contentType = context.contentType || detectContentType(context);

  // Get specific visual guidance for this content type
  const typeGuidance = visual.contentTypes[contentType] || visual.contentTypes.educational;

  // Build the branded prompt
  const parts: string[] = [];

  // 1. Opening - what to create
  if (context.format === 'Reel') {
    parts.push(`Create a professional ${typeGuidance.mood} video for Instagram Reels`);
  } else {
    parts.push(`Create a bold, eye-catching image for Instagram ${context.format.toLowerCase()}`);
  }

  // 2. Topic and context
  parts.push(`about: "${context.topic}"`);

  // 3. Visual style from brand
  parts.push(`Visual style: ${typeGuidance.visualStyle}`);
  parts.push(`Mood: ${typeGuidance.mood}`);

  // 4. Brand identity
  parts.push(`Brand aesthetic: ${brand.company.location} tech company - ${visual.visualIdentity.styleKeywords.slice(0, 5).join(', ')}`);

  // 5. Color palette
  const colors = getColorsForType(contentType, visual);
  parts.push(`Colors: ${colors.join(', ')}`);

  // 6. Key elements for this content type
  parts.push(`Include elements: ${typeGuidance.elements.slice(0, 4).join(', ')}`);

  // 7. Scene/setting suggestions
  const sceneSuggestion = getScenesForContent(context, visual);
  if (sceneSuggestion) {
    parts.push(`Setting: ${sceneSuggestion}`);
  }

  // 8. Composition rules
  if (context.format === 'Reel') {
    const reelRules = visual.compositionRules.reel;
    parts.push(`Composition: ${reelRules.layout}, ${reelRules.motion}, ${reelRules.pacing}`);
  } else {
    const carouselRules = visual.compositionRules.carousel;
    parts.push(`Composition: ${carouselRules.layout}, ${carouselRules.focal}`);
    parts.push(carouselRules.textSpace);
  }

  // 9. Quality standards
  parts.push(`Quality: ${visual.qualityStandards.resolution}, ${visual.qualityStandards.lighting}`);
  parts.push(`Authenticity: ${visual.qualityStandards.authenticity}`);
  parts.push(`Diversity: ${visual.qualityStandards.diversity}`);

  // 10. Always include
  parts.push(visual.promptEnhancements.alwaysInclude.join(', '));

  // 11. Strong negatives
  parts.push(`AVOID: ${visual.promptEnhancements.neverInclude.join(', ')}`);

  // 12. Final quality reminder
  parts.push('Make it scroll-stopping, authentic, and perfectly aligned with a South LA tech brand that keeps it real.');

  return parts.join('. ') + '.';
}

function detectContentType(context: MediaGenerationContext): string {
  const combined = `${context.topic} ${context.content}`.toLowerCase();

  // Educational
  if (combined.match(/\b(how to|tutorial|learn|guide|steps|tips|explained)\b/)) {
    return 'educational';
  }

  // Case study
  if (combined.match(/\b(imagine|could|would|scenario|example|maya|business)\b/)) {
    return 'hypotheticalCaseStudy';
  }

  // Tool review
  if (combined.match(/\b(vs|versus|compare|review|tool|app|software|better|worse)\b/)) {
    return 'toolReview';
  }

  // Industry insight
  if (combined.match(/\b(trend|future|why|industry|market|insight|analysis)\b/)) {
    return 'industryInsight';
  }

  // Quick win
  if (combined.match(/\b(stop|never|always|mistake|hack|trick|secret|now)\b/)) {
    return 'quickWin';
  }

  return 'educational'; // Default
}

function getColorsForType(contentType: string, visual: VisualBrand): string[] {
  const { primary, accent, neutral } = visual.visualIdentity.brandColors;

  switch (contentType) {
    case 'educational':
      return [...primary, accent[1]]; // Purple/blue + yellow
    case 'hypotheticalCaseStudy':
      return [accent[0], primary[2], neutral[0]]; // Orange + cyan + white (warm)
    case 'toolReview':
      return [neutral[1], neutral[2], accent[1]]; // Gray/black + yellow accents
    case 'industryInsight':
      return [...primary, accent[2]]; // Purple/blue + pink (dramatic)
    case 'quickWin':
      return [accent[0], neutral[2], neutral[0]]; // Orange + black/white (high contrast)
    default:
      return [...primary];
  }
}

function getScenesForContent(context: MediaGenerationContext, visual: VisualBrand): string | null {
  const content = context.content.toLowerCase();

  // Match business types
  if (content.match(/\b(salon|nail|beauty|spa)\b/)) {
    return visual.brandScenes.businessSettings[0]; // Nail salon
  }
  if (content.match(/\b(restaurant|food|dining)\b/)) {
    return visual.brandScenes.businessSettings[3]; // Restaurant
  }
  if (content.match(/\b(apartment|property|tenant|landlord)\b/)) {
    return visual.brandScenes.businessSettings[2]; // Apartment building
  }
  if (content.match(/\b(barbershop|barber|haircut)\b/)) {
    return visual.brandScenes.businessSettings[5]; // Barbershop
  }
  if (content.match(/\b(store|retail|shop)\b/)) {
    return visual.brandScenes.businessSettings[1]; // Corner store
  }

  // Generic tech scenes for other content
  if (context.format === 'Carousel') {
    return 'Modern tech workspace or abstract digital environment with LA urban aesthetic';
  }

  return null;
}

export function generateSimplePrompt(topic: string, format: string): string {
  // Quick shorthand version for basic use
  return generateBrandedMediaPrompt({
    topic,
    content: topic,
    format: format as any,
    tone: 'Educational',
  });
}

// Export a prompt that can be used in n8n Code nodes
export function getBrandedPromptForN8N(): string {
  return `
// Import this function in your n8n Code node
function generateBrandedMediaPrompt(topic, content, format, tone) {
  // Detect content type
  const combined = (topic + ' ' + content).toLowerCase();
  let contentType = 'educational';

  if (combined.match(/\\b(how to|tutorial|learn|guide|steps)\\b/)) contentType = 'educational';
  else if (combined.match(/\\b(imagine|could|maya|scenario)\\b/)) contentType = 'hypotheticalCaseStudy';
  else if (combined.match(/\\b(vs|compare|review|tool)\\b/)) contentType = 'toolReview';
  else if (combined.match(/\\b(trend|future|why|insight)\\b/)) contentType = 'industryInsight';
  else if (combined.match(/\\b(stop|never|hack|now)\\b/)) contentType = 'quickWin';

  const styles = {
    educational: 'Clean infographic with bold text, modern layouts, YouTube thumbnail energy',
    hypotheticalCaseStudy: 'Real LA business scenario with tech overlays, relatable and inspiring',
    toolReview: 'Split screen comparison, honest and practical, no BS',
    industryInsight: 'Bold statements with data viz, futuristic but accessible, tech-forward',
    quickWin: 'Punchy single message, high contrast, stop-scrolling energy'
  };

  const colors = {
    educational: 'deep purple, electric blue, bright yellow',
    hypotheticalCaseStudy: 'sunset orange, vibrant cyan, clean white',
    toolReview: 'modern gray, deep black, bright yellow',
    industryInsight: 'deep purple, electric blue, hot pink',
    quickWin: 'sunset orange, deep black, clean white'
  };

  const style = styles[contentType] || styles.educational;
  const colorPalette = colors[contentType] || colors.educational;

  return \`Create a professional Instagram \${format} about: "\${topic}".
Style: \${style}.
Brand: South LA tech company - modern, urban, professional but approachable.
Colors: \${colorPalette}.
Composition: Bold, clear, \${format === 'Carousel' ? 'leave 30% for text overlay' : 'vertical 9:16 format'}.
Quality: 4K, Instagram-optimized, authentic LA diversity, professional lighting.
Aesthetic: LA urban tech - real scenarios not stock photos, community-focused.
AVOID: Generic corporate imagery, fake staged scenes, Silicon Valley bro culture.
Make it scroll-stopping and authentic.\`;
}

// Usage in your n8n node:
const prompt = generateBrandedMediaPrompt(
  $json.topic || $json.Topic,
  $json.content || $json.Content,
  $json.postFormat || $json['Post Format'],
  $json.tone || $json.Tone
);
`;
}
