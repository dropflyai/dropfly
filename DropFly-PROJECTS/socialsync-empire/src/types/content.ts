// Content creation types and templates

export type CreatorMode =
  | 'ugc'           // User Generated Content - authentic, raw style
  | 'clipping'      // Extract viral clips from long-form content
  | 'educational'   // Tutorial/how-to style
  | 'sales'         // Product promotions, ads, offers
  | 'commentary'    // News reactions, trend commentary
  | 'storytelling'  // Narrative-driven content
  | 'meme'          // Meme-style humor content
  | 'documentary';  // Professional documentary style

export interface CreatorModeTemplate {
  id: CreatorMode;
  name: string;
  emoji: string;
  description: string;
  tone: string;
  styleGuidelines: string[];
  platforms: string[];  // Best platforms for this mode
  avgDuration: string;  // Typical duration
  examples: string[];   // Example prompts
  visualStyle: {
    filters: string[];
    transitions: string[];
    textOverlay: boolean;
    music: string;
  };
}

export const CREATOR_MODE_TEMPLATES: Record<CreatorMode, CreatorModeTemplate> = {
  ugc: {
    id: 'ugc',
    name: 'UGC (User Generated)',
    emoji: '📱',
    description: 'Authentic, personal content that feels real and relatable',
    tone: 'Casual, authentic, conversational, like talking to a friend',
    styleGuidelines: [
      'Handheld camera style',
      'Natural lighting',
      'Casual speaking',
      'Personal anecdotes',
      'Behind-the-scenes feel',
      'Raw, unpolished look',
    ],
    platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
    avgDuration: '15-60 seconds',
    examples: [
      'POV: You just discovered this productivity hack',
      'Trying this viral recipe for the first time',
      'Day in the life of a content creator',
      'Things I wish I knew before starting my business',
    ],
    visualStyle: {
      filters: ['Natural', 'Warm', 'Slightly grainy'],
      transitions: ['Jump cuts', 'Quick zooms', 'Text pops'],
      textOverlay: true,
      music: 'Trending sounds, upbeat',
    },
  },

  clipping: {
    id: 'clipping',
    name: 'Viral Clips',
    emoji: '✂️',
    description: 'Extract the most engaging moments from long-form content',
    tone: 'High-energy, attention-grabbing, punchy',
    styleGuidelines: [
      'Identify hooks and payoffs',
      'Fast-paced editing',
      'Captions for context',
      'Strong opening line',
      'Cliffhanger endings',
      'Remove filler words',
    ],
    platforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'Twitter'],
    avgDuration: '30-90 seconds',
    examples: [
      'Best moment from my latest podcast',
      'This client call went CRAZY',
      'The part everyone missed in my livestream',
      'When he said THIS I was shocked',
    ],
    visualStyle: {
      filters: ['High contrast', 'Vibrant colors'],
      transitions: ['Hard cuts', 'Zoom emphasis'],
      textOverlay: true,
      music: 'Dramatic, suspenseful',
    },
  },

  educational: {
    id: 'educational',
    name: 'Educational/Tutorial',
    emoji: '🎓',
    description: 'Teach something valuable in a clear, structured way',
    tone: 'Clear, instructional, encouraging, expert but approachable',
    styleGuidelines: [
      'Step-by-step structure',
      'Visual demonstrations',
      'Clear voiceover',
      'On-screen text for key points',
      'Actionable takeaways',
      'Professional but friendly',
    ],
    platforms: ['YouTube', 'LinkedIn', 'Instagram', 'TikTok'],
    avgDuration: '60-180 seconds',
    examples: [
      'How to [skill] in 60 seconds',
      '5 steps to [outcome]',
      'Common mistakes when [activity]',
      'Tutorial: [specific process]',
    ],
    visualStyle: {
      filters: ['Clean', 'Professional'],
      transitions: ['Smooth fades', 'Step indicators'],
      textOverlay: true,
      music: 'Background instrumental, subtle',
    },
  },

  sales: {
    id: 'sales',
    name: 'Sales & Marketing',
    emoji: '💰',
    description: 'Promote products/services with persuasive, benefit-driven content',
    tone: 'Persuasive, benefit-focused, exciting, urgency-driven',
    styleGuidelines: [
      'Lead with the benefit',
      'Show product in action',
      'Include social proof',
      'Clear call-to-action',
      'Address objections',
      'Create urgency (limited time, etc.)',
    ],
    platforms: ['Instagram', 'Facebook', 'YouTube', 'TikTok'],
    avgDuration: '15-60 seconds',
    examples: [
      'This tool changed how I [outcome]',
      'Why everyone is switching to [product]',
      '3 reasons you need [product]',
      'Before & after using [product]',
    ],
    visualStyle: {
      filters: ['Vibrant', 'Eye-catching'],
      transitions: ['Dynamic cuts', 'Product reveals'],
      textOverlay: true,
      music: 'Upbeat, motivating',
    },
  },

  commentary: {
    id: 'commentary',
    name: 'News & Commentary',
    emoji: '🗣️',
    description: 'React to trends, news, or viral content with your take',
    tone: 'Opinionated, conversational, timely, engaging',
    styleGuidelines: [
      'Reference current events/trends',
      'Show source material (split screen)',
      'Give hot takes',
      'Encourage discussion',
      'Timely (post quickly)',
      'Add unique perspective',
    ],
    platforms: ['Twitter', 'YouTube', 'TikTok', 'LinkedIn'],
    avgDuration: '30-120 seconds',
    examples: [
      'My thoughts on [trending topic]',
      'Everyone is talking about [event], here\'s why',
      'Reacting to [viral video/news]',
      'The real story behind [headline]',
    ],
    visualStyle: {
      filters: ['Standard', 'News-style'],
      transitions: ['Split screen', 'Overlay clips'],
      textOverlay: true,
      music: 'Minimal or none',
    },
  },

  storytelling: {
    id: 'storytelling',
    name: 'Storytelling',
    emoji: '📖',
    description: 'Craft compelling narratives that hook and emotionally connect',
    tone: 'Narrative, emotional, dramatic, immersive',
    styleGuidelines: [
      'Strong hook (first 3 seconds)',
      'Story arc (setup, conflict, resolution)',
      'Emotional beats',
      'Relatable characters/situations',
      'Surprising twist or payoff',
      'Cinematic visuals',
    ],
    platforms: ['YouTube', 'TikTok', 'Instagram', 'Facebook'],
    avgDuration: '60-180 seconds',
    examples: [
      'The time I almost gave up on my business',
      'How a random conversation changed everything',
      'This stranger taught me [lesson]',
      'My journey from [before] to [after]',
    ],
    visualStyle: {
      filters: ['Cinematic', 'Moody'],
      transitions: ['Smooth fades', 'Flashbacks'],
      textOverlay: false,
      music: 'Emotional, cinematic score',
    },
  },

  meme: {
    id: 'meme',
    name: 'Meme & Humor',
    emoji: '😂',
    description: 'Funny, relatable content using meme formats and trends',
    tone: 'Humorous, sarcastic, relatable, playful',
    styleGuidelines: [
      'Use trending meme formats',
      'Relatable situations',
      'Exaggerated reactions',
      'Quick punchlines',
      'Sound effects',
      'On-point timing',
    ],
    platforms: ['TikTok', 'Instagram Reels', 'Twitter', 'YouTube Shorts'],
    avgDuration: '10-30 seconds',
    examples: [
      'POV: You\'re a [profession] and [situation]',
      'When [relatable moment] happens',
      '[Job] vs [Job] be like',
      'Me explaining [topic] to [audience]',
    ],
    visualStyle: {
      filters: ['High contrast', 'Saturated'],
      transitions: ['Jump cuts', 'Zooms'],
      textOverlay: true,
      music: 'Trending sounds, comedic timing',
    },
  },

  documentary: {
    id: 'documentary',
    name: 'Documentary',
    emoji: '🎬',
    description: 'Professional, investigative content with depth and research',
    tone: 'Authoritative, informative, investigative, polished',
    styleGuidelines: [
      'Well-researched facts',
      'B-roll footage',
      'Interview clips',
      'Data/statistics',
      'Professional narration',
      'Multiple perspectives',
    ],
    platforms: ['YouTube', 'LinkedIn', 'Facebook'],
    avgDuration: '120-300 seconds',
    examples: [
      'The untold story of [topic]',
      'Inside look at [industry/company]',
      'How [product/service] really works',
      'The rise and fall of [brand/trend]',
    ],
    visualStyle: {
      filters: ['Professional', 'Neutral'],
      transitions: ['Smooth', 'Chapter markers'],
      textOverlay: true,
      music: 'Orchestral, documentary-style',
    },
  },
};

// Helper function to get mode by ID
export const getCreatorMode = (id: CreatorMode): CreatorModeTemplate => {
  return CREATOR_MODE_TEMPLATES[id];
};

// Get all modes as array
export const getAllCreatorModes = (): CreatorModeTemplate[] => {
  return Object.values(CREATOR_MODE_TEMPLATES);
};
