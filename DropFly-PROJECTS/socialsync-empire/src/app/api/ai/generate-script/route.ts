import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';
import { getAnthropicClient } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();

    // Try to get the session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[Script Generation] Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message
    });

    // Then get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[Script Generation] Auth check:', {
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    });

    if (!user) {
      console.error('[Script Generation] No user found', {
        sessionError: sessionError?.message,
        authError: authError?.message
      });
      return NextResponse.json({
        error: 'Unauthorized - Please log in again',
        details: authError?.message || sessionError?.message
      }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { topic, creatorMode, platform, duration } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 2a. Fetch brand package if provided
    let brandContext = '';
    const { brand_package_id } = body;

    if (brand_package_id) {
      const { data: brandPackage } = await supabase
        .from('brand_packages')
        .select('*')
        .eq('id', brand_package_id)
        .eq('user_id', user.id)
        .single();

      if (brandPackage) {
        brandContext = `

BRAND IDENTITY - IMPORTANT: Use this brand's voice and personality in your response:
- Brand: ${brandPackage.name}
${brandPackage.mission_statement ? `- Mission: ${brandPackage.mission_statement}` : ''}
- Voice: ${brandPackage.brand_voice || 'professional'}
- Personality: ${brandPackage.brand_personality || 'professional and trustworthy'}
- Target Audience: ${brandPackage.target_audience || 'general audience'}
${brandPackage.key_values?.length ? `- Key Values: ${brandPackage.key_values.join(', ')}` : ''}

Align all messaging with this brand's mission and values. Speak directly to their target audience using their brand voice.
`;
      }
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
      const finalPrompt = brandContext + selectedPrompt;

      // 6. Call Claude API
      const anthropic = getAnthropicClient();
      const completion = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500,
        temperature: 0.8,
        system: 'You are an expert content creator who generates viral video scripts. Always respond with valid JSON only, no additional text.',
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
      });

      const content = completion.content[0]?.type === 'text' ? completion.content[0].text : null;

      if (!content) {
        throw new Error('No content generated');
      }

      // 7. Parse JSON response
      let scriptData;
      try {
        scriptData = JSON.parse(content);
      } catch (e) {
        // If Claude didn't return valid JSON, extract it
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
          inputTokens: completion.usage?.input_tokens || 0,
          outputTokens: completion.usage?.output_tokens || 0,
          model: completion.model,
        },
      });

    } catch (apiError: any) {
      console.error('[Script Generation] Claude API Error:', apiError);

      // Refund tokens on API failure
      if (deductionResult.transaction?.id) {
        const refundResult = await tokenService.refundTokens(
          user.id,
          deductionResult.transaction.id,
          'Script generation API failure'
        );
        console.log('[Script Generation] Refund result:', refundResult);
      }

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
