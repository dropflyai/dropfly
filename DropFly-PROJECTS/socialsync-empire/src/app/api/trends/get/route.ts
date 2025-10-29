import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Cache trending topics for 12 hours to save API costs
let cachedTrends: {
  topics: TrendingTopic[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface TrendingTopic {
  topic: string;
  mentions: string;
  trend: string;
  level: 'hot' | 'trending' | 'growing';
  category?: string;
}

// Lazy-load OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check if we have cached trends that are still fresh
    if (cachedTrends && (Date.now() - cachedTrends.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        topics: cachedTrends.topics,
        cached: true,
        nextUpdate: new Date(cachedTrends.timestamp + CACHE_DURATION).toISOString(),
      });
    }

    // Get current date for context
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Call OpenAI to get trending topics
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini model for cost efficiency
      messages: [
        {
          role: 'system',
          content: `You are a social media trends analyst. Always respond with valid JSON only, no additional text. Today is ${today}.`,
        },
        {
          role: 'user',
          content: `Generate 5 current trending topics for content creators and marketers as of ${today}. Focus on:
- Social media trends (TikTok, Instagram, YouTube)
- AI and automation trends
- Content creation trends
- Marketing strategies
- Video production trends

Format as JSON array with this structure:
[
  {
    "topic": "Short topic name (5-7 words max)",
    "mentions": "Estimated mention count (e.g., '48.3K', '127K', '2.1M')",
    "trend": "Status (e.g., 'Rising fast', 'Steady growth', 'New', 'Viral')",
    "level": "hot" | "trending" | "growing",
    "category": "AI" | "Social Media" | "Video" | "Marketing"
  }
]

Make mentions realistic based on the topic's popularity. Level definitions:
- "hot": 100K+ mentions, rising fast
- "trending": 20K-100K mentions, steady growth
- "growing": 10K-20K mentions, new or emerging`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse JSON response
    let topics: TrendingTopic[];
    try {
      topics = JSON.parse(content);
    } catch (e) {
      // If OpenAI didn't return valid JSON, extract it
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate and ensure we have 5 topics
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid topics format');
    }

    // Cache the results
    cachedTrends = {
      topics: topics.slice(0, 5), // Limit to 5 topics
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      topics: cachedTrends.topics,
      cached: false,
      nextUpdate: new Date(Date.now() + CACHE_DURATION).toISOString(),
      usage: {
        openaiTokens: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Trending topics error:', err);

    // Return fallback topics if API fails
    const fallbackTopics: TrendingTopic[] = [
      {
        topic: 'AI video generation for social media',
        mentions: '89.2K',
        trend: 'Rising fast',
        level: 'hot',
        category: 'AI',
      },
      {
        topic: 'Short-form video marketing strategies',
        mentions: '64.5K',
        trend: 'Steady growth',
        level: 'trending',
        category: 'Marketing',
      },
      {
        topic: 'Multi-platform content automation',
        mentions: '42.1K',
        trend: 'Growing',
        level: 'trending',
        category: 'Social Media',
      },
      {
        topic: 'UGC content creation tips',
        mentions: '28.7K',
        trend: 'New trend',
        level: 'growing',
        category: 'Video',
      },
      {
        topic: 'AI-powered script writing',
        mentions: '19.4K',
        trend: 'Emerging',
        level: 'growing',
        category: 'AI',
      },
    ];

    return NextResponse.json(
      {
        success: false,
        topics: fallbackTopics,
        error: 'Using fallback topics',
        details: err.message,
      },
      { status: 200 } // Still return 200 so frontend displays fallback
    );
  }
}

// Add a manual refresh endpoint for admins
export async function POST(request: NextRequest) {
  try {
    // Clear cache to force refresh
    cachedTrends = null;

    // Call GET to generate fresh trends
    return GET(request);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh trends',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
