import brandVoiceConfig from '../config/brand-voice.json';

export interface BrandVoice {
  company: {
    name: string;
    location: string;
    tagline: string;
  };
  brandVoice: {
    core: string;
    essence: string;
    principles: string[];
  };
  products: Array<{
    name: string;
    description: string;
    useCases: string[];
  }>;
  targetAudience: Array<{
    segment: string;
    needs: string[];
    painPoints: string[];
  }>;
  contentPillars: Array<{
    name: string;
    percentage: number;
    examples: string[];
  }>;
  toneOptions: Array<{
    name: string;
    description: string;
    example: string;
  }>;
  doExamples: string[];
  dontExamples: string[];
  exampleTransformations: Array<{
    bad: string;
    good: string;
  }>;
  hashtagStrategy: {
    aiTech: string[];
    industry: string[];
    local: string[];
    product: string[];
    community: string[];
  };
  contentFormats: {
    carousel: {
      description: string;
      bestFor: string[];
    };
    reel: {
      description: string;
      bestFor: string[];
    };
  };
  brandPersonality: string[];
  contentToAvoid?: Array<{
    category: string;
    reason: string;
    examples: string[];
    betterAlternative: string;
  }>;
  lastUpdated: string;
  version: string;
}

export function getBrandVoice(): BrandVoice {
  return brandVoiceConfig as BrandVoice;
}

export function generateContentPrompt(count: number, focus: string = 'mixed'): string {
  const brand = getBrandVoice();

  const productsText = brand.products
    .map((p, i) => `${i + 1}. ${p.name} - ${p.description}`)
    .join('\n');

  const audienceText = brand.targetAudience
    .map(a => `- ${a.segment} who need ${a.needs.join(', ')}`)
    .join('\n');

  const contentPillarsText = brand.contentPillars
    .map(cp => `- ${cp.name} (${cp.percentage}%) - ${cp.examples[0]}`)
    .join('\n');

  const examplesText = brand.exampleTransformations
    .map(ex => `❌ BAD: "${ex.bad}"\n✅ GOOD: "${ex.good}"`)
    .join('\n\n');

  // Build avoid list section
  const avoidListText = brand.contentToAvoid
    ? brand.contentToAvoid
        .map(avoid => `❌ AVOID: ${avoid.category}\n   Why: ${avoid.reason}\n   Instead: ${avoid.betterAlternative}`)
        .join('\n\n')
    : '';

  return `You are an expert Instagram content creator writing posts in proper English for an AI automation company based in ${brand.company.location}.

CRITICAL: Write all content in clear, conversational, grammatically correct English. No gibberish, no random characters, no nonsense words.

BRAND IDENTITY:
- Company: ${brand.company.tagline}
- Voice: ${brand.brandVoice.core}
- Think: ${brand.brandVoice.essence}
- Tone: ${brand.brandVoice.principles[0]}

OUR PRODUCTS:
${productsText}

TARGET AUDIENCE:
${audienceText}

CONTENT RULES:
${brand.brandVoice.principles.map(p => `- ${p}`).join('\n')}

Focus: ${focus === 'mixed' ? 'Mix of tutorials, hypothetical case studies, tool reviews, and industry insights' : focus}

Generate exactly ${count} Instagram post topics. Include variety:
${contentPillarsText}

INSTRUCTIONS FOR EACH POST:
1. Topic: Write a compelling headline in plain English (example: "5 Ways AI Saves Small Businesses Money")
2. Content: Write 2-4 complete sentences in conversational English, as if explaining to a friend
3. Post Format: Choose either "Carousel" or "Reel"
4. Tone: Choose one: ${brand.toneOptions.map(t => t.name).join(', ')}
5. Hashtags: Write 5-7 hashtags separated by spaces

GOOD EXAMPLES:
${examplesText}

CONTENT TO AVOID:
${avoidListText}

IMPORTANT QUALITY REQUIREMENTS:
- Use proper English grammar and spelling
- Write complete, coherent sentences
- No placeholder text like "[insert text]" or "lorem ipsum"
- No random characters or garbled text
- Make content specific and actionable
- Sound natural and conversational

Return ONLY a valid JSON array. No other text before or after the JSON.

Example format:
[
  {
    "Topic": "5 Ways AI Saves Small Businesses Money",
    "Content": "Running a small business in LA? AI can seriously cut your costs. From automating customer service to handling your bookkeeping, AI tools are getting smarter and more affordable every day. Let's break down the top 5 ways you can start saving this month.",
    "Post Format": "Carousel",
    "Tone": "Educational",
    "Hashtags": "#AIAutomation #SmallBusiness #TechTips #LABusiness #Productivity #SaveMoney"
  }
]`;
}

export function getAllHashtags(): string[] {
  const brand = getBrandVoice();
  return [
    ...brand.hashtagStrategy.aiTech,
    ...brand.hashtagStrategy.industry,
    ...brand.hashtagStrategy.local,
    ...brand.hashtagStrategy.product,
    ...brand.hashtagStrategy.community,
  ];
}

export function getProductNames(): string[] {
  const brand = getBrandVoice();
  return brand.products.map(p => p.name);
}

export function getToneOptions(): string[] {
  const brand = getBrandVoice();
  return brand.toneOptions.map(t => t.name);
}
