import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { tokenService } from '@/lib/tokens/token-service';

// Helper to convert seconds to SRT timestamp format (00:00:00,000)
function toSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// Helper to convert seconds to VTT timestamp format (00:00:00.000)
function toVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Convert Whisper response to SRT format
function toSRT(segments: any[]): string {
  return segments
    .map((segment, index) => {
      const start = toSRTTime(segment.start);
      const end = toSRTTime(segment.end);
      return `${index + 1}\n${start} --> ${end}\n${segment.text.trim()}\n`;
    })
    .join('\n');
}

// Convert Whisper response to VTT format
function toVTT(segments: any[]): string {
  const header = 'WEBVTT\n\n';
  const cues = segments
    .map((segment) => {
      const start = toVTTTime(segment.start);
      const end = toVTTTime(segment.end);
      return `${start} --> ${end}\n${segment.text.trim()}\n`;
    })
    .join('\n');
  return header + cues;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { videoUrl, duration, language = 'en' } = body;

    if (!videoUrl || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: videoUrl and duration' },
        { status: 400 }
      );
    }

    // 3. Calculate token cost (based on video duration)
    // Whisper API: $0.006 per minute
    // Token cost: ~2 tokens per minute with 70% margin
    const durationMinutes = duration / 60;
    const tokenCost = tokenService.calculateCost('video_transcription', { duration });

    console.log(`[Transcribe] Video duration: ${durationMinutes.toFixed(2)} min, Token cost: ${tokenCost}`);

    // 4. Deduct tokens BEFORE calling OpenAI
    const deductionResult = await tokenService.deductTokens({
      userId: user.id,
      operation: 'video_transcription',
      cost: tokenCost,
      description: `Video transcription: ${durationMinutes.toFixed(1)} minutes`,
      metadata: { videoUrl, duration }
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

    // 5. Download video/audio file to transcribe
    // NOTE: In production, you'd want to:
    // - Download the file from videoUrl
    // - Extract audio if it's a video
    // - Handle large files properly
    // For now, we'll use a placeholder approach

    try {
      // Fetch the video file
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video');
      }

      const videoBlob = await videoResponse.blob();

      // Create a File object for Whisper API
      const audioFile = new File([videoBlob], 'audio.mp3', { type: 'audio/mpeg' });

      // 6. Call OpenAI Whisper API for transcription
      const openai = getOpenAIClient();

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json', // Get timestamps
        timestamp_granularities: ['segment']
      });

      // 7. Format response with multiple output formats
      const segments = transcription.segments || [];
      const plainText = transcription.text;
      const srt = toSRT(segments);
      const vtt = toVTT(segments);

      // 8. Return success response
      return NextResponse.json({
        success: true,
        result: {
          text: plainText,
          srt,
          vtt,
          segments: segments.map((seg: any) => ({
            start: seg.start,
            end: seg.end,
            text: seg.text.trim()
          })),
          language: transcription.language,
          duration: transcription.duration
        },
        tokensUsed: tokenCost,
        newBalance: deductionResult.newBalance,
        durationMinutes: durationMinutes.toFixed(2)
      });

    } catch (apiError: any) {
      console.error('[Transcribe] OpenAI API Error:', apiError);

      // Refund tokens on API failure
      await tokenService.refundTokens({
        userId: user.id,
        amount: tokenCost,
        reason: 'Transcription API failure',
        originalOperation: 'video_transcription'
      });

      return NextResponse.json(
        {
          error: 'Failed to transcribe video. Your tokens have been refunded.',
          details: apiError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[Transcribe] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
