import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const PUBLISH_WEBHOOK_URL = process.env.PUBLISH_WEBHOOK_URL;

  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (!PUBLISH_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'Publish webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('Publishing post:', postId, 'to webhook:', PUBLISH_WEBHOOK_URL);

    // Trigger the n8n publish workflow via webhook
    const response = await fetch(PUBLISH_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      throw new Error(`Failed to trigger publish workflow: ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Post published successfully!',
      data
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    return NextResponse.json(
      { error: 'Failed to publish post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
