import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

// Lazy-load OpenAI client to avoid build-time execution
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { topic, creatorMode, platform, duration } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 3. Calculate token cost (7 tokens for AI script generation)
    const tokenCost = tokenService.calculateCost('script_generation');

    console.log(`[Script Generation] Cost: ${tokenCost} tokens`);

    // 4. Deduct tokens BEFORE calling OpenAI
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'script_generation',
      cost: tokenCost,
      description: `AI script generation: ${topic}`,
      metadata: { topic, creatorMode, platform, duration }
    });

    if (!deductionResult.success) {
      return NextResponse.json(
        {
          error: deductionResult.error || 'Insufficient tokens',
          errorCode: deductionResult.errorCode
        },
        { status: 403 }
      );
    }

    try {
      // 5. Build the prompt based on creator mode
      const prompts: Record<string, string> = {
        ugc: `You are an expert UGC (User Generated Content) creator. Create a viral video script for ${platform || 'TikTok/Instagram'} about: "${topic}"

Format the response as JSON with this structure:
{
  "hook": "The first 3 seconds that grab attention",
  "script": "The full video script with timestamps",
  "cta": "Call to action at the end",
  "hashtags": ["relevant", "hashtags"],
  "duration": "${duration || '30-60 seconds'}"
}

Make it conversational, authentic, and optimized for high engagement. Include pattern interrupts and viral hooks.`,

        educational: `You are an expert educational content creator. Create an educational video script for ${platform || 'YouTube'} about: "${topic}"

Format the response as JSON with this structure:
{
  "hook": "Attention-grabbing intro",
  "script": "Full educational script with clear sections",
  "cta": "Call to action encouraging learning",
  "hashtags": ["educational", "relevant", "tags"],
  "duration": "${duration || '2-5 minutes'}"
}

Make it clear, informative, and engaging. Use storytelling and examples.`,

        entertainment: `You are a viral content creator specializing in entertainment. Create an entertaining video script for ${platform || 'TikTok'} about: "${topic}"

Format the response as JSON with this structure:
{
  "hook": "Explosive opening hook",
  "script": "Entertaining script with humor/drama/surprise",
  "cta": "Engaging call to action",
  "hashtags": ["viral", "trending", "tags"],
  "duration": "${duration || '15-30 seconds'}"
}

Make it funny, surprising, or emotionally engaging. Optimize for shares and comments.`,

        review: `You are a product review expert. Create a review video script for ${platform || 'YouTube'} about: "${topic}"

Format the response as JSON with this structure:
{
  "hook": "Why viewers should watch this review",
  "script": "Honest review with pros, cons, and verdict",
  "cta": "Where to buy or learn more",
  "hashtags": ["review", "product", "tags"],
  "duration": "${duration || '3-8 minutes'}"
}

Be honest, detailed, and helpful. Include specific examples and comparisons.`,

        tutorial: `You are a tutorial content creator. Create a step-by-step tutorial script for ${platform || 'YouTube'} about: "${topic}"

Format the response as JSON with this structure:
{
  "hook": "What viewers will learn",
  "script": "Step-by-step tutorial with clear instructions",
  "cta": "Encourage trying it themselves",
  "hashtags": ["tutorial", "howto", "tags"],
  "duration": "${duration || '5-10 minutes'}"
}

Make it clear, actionable, and beginner-friendly. Number each step.`,
      };

      const selectedPrompt = prompts[creatorMode] || prompts.ugc;

      // 6. Call OpenAI API
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content creator who generates viral video scripts. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: selectedPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content generated');
      }

      // 7. Parse JSON response
      let scriptData;
      try {
        scriptData = JSON.parse(content);
      } catch (e) {
        // If OpenAI didn't return valid JSON, extract it
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scriptData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      // 8. Save to database
      const { data: savedContent, error: dbError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: topic,
          type: 'script',
          content: scriptData,
          metadata: {
            creator_mode: creatorMode,
            platform,
            duration,
            generated_at: new Date().toISOString(),
          },
          status: 'draft',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Don't fail the request if DB save fails, still return the generated content
      }

      // 9. Return success
      return NextResponse.json({
        success: true,
        script: scriptData,
        contentId: savedContent?.id,
        tokensUsed: tokenCost,
        newBalance: deductionResult.newBalance,
        usage: {
          openaiTokens: completion.usage?.total_tokens || 0,
          model: completion.model,
        },
      });

    } catch (apiError: any) {
      console.error('[Script Generation] OpenAI API Error:', apiError);

      // Refund tokens on API failure
      await tokenService.refundTokens({
        userId: user.id,
        amount: tokenCost,
        reason: 'Script generation API failure',
        originalOperation: 'script_generation'
      });

      return NextResponse.json(
        {
          error: 'Failed to generate script. Your tokens have been refunded.',
          details: apiError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Script Generation] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
