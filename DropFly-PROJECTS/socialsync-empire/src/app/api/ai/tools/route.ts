import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

// Lazy-load OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

type AIToolType = 'caption' | 'hashtag' | 'hook' | 'calendar' | 'thumbnail';

interface AIToolRequest {
  tool: AIToolType;
  input: string;
  platform?: string;
  niche?: string;
  audience?: string;
  tone?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: AIToolRequest = await request.json();
  const { tool, input, platform, niche, audience, tone } = body;

  if (!tool || !input) {
    return NextResponse.json(
      { error: 'Tool type and input are required' },
      { status: 400 }
    );
  }

  // Map tool to token operation
  const operationMap: Record<AIToolType, string> = {
    caption: 'caption_generation',
    hashtag: 'hashtag_generation',
    hook: 'hook_generation',
    calendar: 'content_calendar',
    thumbnail: 'thumbnail_text_generation',
  };

  const operation = operationMap[tool];
  const tokenCost = tokenService.calculateCost(operation);
  let deductionResult;

  try {
    // Get token balance and daily limit
    const balance = await tokenService.getBalance(user.id);
    const dailyInfo = await tokenService.getDailyLimitInfo(user.id);

    if (!balance || !dailyInfo) {
      return NextResponse.json(
        { error: 'Unable to fetch token balance' },
        { status: 500 }
      );
    }

    // Deduct tokens BEFORE calling OpenAI
    deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation,
      cost: tokenCost,
      description: `AI ${tool} generation: ${input.substring(0, 50)}`,
      metadata: { tool, input: input.substring(0, 100), platform, niche },
    });

    // Handle token deduction errors
    if (!deductionResult.success) {
      const errorMessages: Record<string, string> = {
        INSUFFICIENT_TOKENS: `Not enough tokens. Required: ${tokenCost}, Available: ${balance.balance}`,
        DAILY_LIMIT_EXCEEDED: deductionResult.error || 'Daily token limit exceeded',
        USER_NOT_FOUND: 'User token account not found',
        INVALID_OPERATION: 'Invalid token operation',
      };

      return NextResponse.json(
        {
          error: errorMessages[deductionResult.errorCode || 'INVALID_OPERATION'],
          errorCode: deductionResult.errorCode,
          tokenCost,
          balance: balance.balance,
          dailyRemaining: dailyInfo.dailyRemaining,
          dailyLimit: dailyInfo.dailyLimit,
        },
        { status: 403 }
      );
    }

    // Generate AI content based on tool type
    const openai = getOpenAIClient();
    const prompt = buildPrompt(tool, input, platform, niche, audience, tone);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media content creator and marketer. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: tool === 'calendar' ? 2000 : 800,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // Extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    return NextResponse.json({
      success: true,
      tool,
      result,
      tokensUsed: tokenCost,
      newBalance: deductionResult.newBalance,
      usage: {
        openaiTokens: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error(`AI ${tool} generation error:`, err);

    // Refund tokens if generation failed
    if (deductionResult && deductionResult.success && deductionResult.transaction) {
      await tokenService.refundTokens(
        user.id,
        deductionResult.transaction.id,
        `AI ${tool} generation failed: ${err.message}`
      );
    }

    return NextResponse.json(
      {
        error: `Failed to generate ${tool}`,
        details: err.message,
        tokensRefunded: deductionResult?.success ? tokenCost : 0,
      },
      { status: 500 }
    );
  }
}

function buildPrompt(
  tool: AIToolType,
  input: string,
  platform?: string,
  niche?: string,
  audience?: string,
  tone?: string
): string {
  const platformText = platform || 'social media';
  const nicheText = niche || 'general audience';
  const audienceText = audience || 'general audience';
  const toneText = tone || 'engaging and authentic';

  switch (tool) {
    case 'caption':
      return `Generate 5 high-converting social media captions for ${platformText} about: "${input}"

Platform: ${platformText}
Niche: ${nicheText}
Audience: ${audienceText}
Tone: ${toneText}

Format as JSON:
{
  "captions": [
    {
      "text": "Caption text here",
      "style": "conversational" | "professional" | "humorous" | "inspirational" | "storytelling",
      "length": number (character count),
      "cta": "Call to action phrase"
    }
  ]
}

Make them ${toneText}, include emojis strategically, and optimize for ${platformText} best practices.`;

    case 'hashtag':
      return `Generate 30 relevant hashtags for ${platformText} content about: "${input}"

Niche: ${nicheText}
Platform: ${platformText}

Format as JSON:
{
  "hashtags": {
    "trending": ["5-7 trending hashtags"],
    "niche": ["8-10 niche-specific hashtags"],
    "community": ["7-8 community hashtags"],
    "branded": ["3-5 potential branded hashtags"]
  },
  "recommended_mix": "Best combination of 10-15 hashtags to use"
}

Include mix of popular (100K+ posts), medium (10K-100K), and niche (<10K) hashtags.`;

    case 'hook':
      return `Generate 7 viral video hooks for content about: "${input}"

Platform: ${platformText}
Niche: ${nicheText}
Audience: ${audienceText}

Format as JSON:
{
  "hooks": [
    {
      "text": "Hook text (first 3-5 seconds)",
      "type": "question" | "bold_statement" | "pattern_interrupt" | "story_tease" | "emotional" | "curiosity" | "shock",
      "effectiveness_score": 1-10,
      "best_for": "Description of what content this works best for"
    }
  ]
}

Make them attention-grabbing, designed to stop scrolling, and optimized for ${platformText}.`;

    case 'calendar':
      return `Create a 30-day content calendar for: "${input}"

Niche: ${nicheText}
Platform: ${platformText}
Audience: ${audienceText}

Format as JSON:
{
  "calendar": [
    {
      "day": 1-30,
      "theme": "Content theme",
      "topic": "Specific topic to cover",
      "content_type": "video" | "carousel" | "story" | "reel" | "post",
      "goal": "educate" | "entertain" | "inspire" | "sell" | "engage",
      "caption_idea": "Brief caption suggestion",
      "cta": "Call to action"
    }
  ],
  "content_pillars": ["4-5 main content themes"],
  "posting_schedule": "Recommended posting frequency"
}

Balance educational, entertaining, and promotional content. Include variety of content types.`;

    case 'thumbnail':
      return `Generate 5 catchy thumbnail text options for: "${input}"

Platform: ${platformText}
Niche: ${nicheText}

Format as JSON:
{
  "options": [
    {
      "text": "Thumbnail text (3-5 words max)",
      "style": "bold" | "question" | "number" | "emotional" | "curiosity",
      "color_suggestion": "Recommended text color",
      "layout": "How to arrange text on thumbnail"
    }
  ]
}

Keep text SHORT (3-5 words), make it curiosity-inducing, and readable from mobile.`;

    default:
      throw new Error('Invalid tool type');
  }
}
