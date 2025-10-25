import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateContentPrompt } from '@/lib/brand-voice';

export async function POST(request: Request) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  const body = await request.json();
  const { count = 10, focus = 'mixed' } = body;

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Generate content ideas with Claude using brand voice config
    const promptContent = generateContentPrompt(count, focus);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ]
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Extract JSON from response
    let topics;
    try {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      topics = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse topics from Claude response');
    }

    // Add topics to Airtable
    const airtablePromises = topics.map((topic: any) =>
      fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Topic: topic.Topic,
              Content: topic.Content,
              'Post Format': topic['Post Format'],
              Tone: topic.Tone || 'Educational',
              Hashtags: topic.Hashtags,
              Status: 'Ready for Review',
              Platform: ['Instagram'],
            },
          }),
        }
      )
    );

    await Promise.all(airtablePromises);

    return NextResponse.json({
      success: true,
      count: topics.length,
      message: `Successfully generated and added ${topics.length} topics to Airtable`,
      topics,
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      },
      { status: 500 }
    );
  }
}
