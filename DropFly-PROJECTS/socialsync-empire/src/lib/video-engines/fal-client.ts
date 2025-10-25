import { VideoEngine, VideoGenerationRequest, VideoGenerationResponse } from '@/types/video-engine';

/**
 * fal.ai Client for AI Video Generation
 * Unified gateway to multiple video generation engines
 *
 * Supported engines:
 * - Hailuo 02 (Minimax)
 * - Runway Gen-4
 * - Kling AI
 * - Luma Ray
 * - Pika
 */

const FAL_AI_KEY = process.env.FAL_AI_KEY;
const FAL_AI_BASE_URL = 'https://fal.run';

// Map our engine IDs to fal.ai model IDs
const FAL_MODEL_MAP: Record<string, string> = {
  'hailuo-02': 'fal-ai/minimax-video',
  'runway-gen4-turbo': 'fal-ai/runway-gen3',
  'kling-2.1': 'fal-ai/kling-video',
  'luma-ray3': 'fal-ai/luma-ray',
  'pika-2.2': 'fal-ai/pika',
};

export interface FalVideoRequest {
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
  num_inference_steps?: number;
}

export interface FalVideoResponse {
  video: {
    url: string;
    content_type: string;
    file_size: number;
    width: number;
    height: number;
  };
  timings: {
    inference: number;
  };
}

export class FalAIClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || FAL_AI_KEY || '';

    if (!this.apiKey) {
      console.warn('FAL_AI_KEY not set - video generation will use mock responses');
    }
  }

  async generateVideo(
    engine: VideoEngine,
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const modelId = FAL_MODEL_MAP[engine];

    if (!modelId) {
      return {
        success: false,
        error: `Engine ${engine} not supported by fal.ai`,
        errorCode: 'ENGINE_NOT_SUPPORTED',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0,
        engine,
        engineName: engine,
        cost: 0,
        creditsUsed: 0,
        metadata: {},
      };
    }

    // If no API key, return mock response for development
    if (!this.apiKey) {
      return this.getMockResponse(engine, request);
    }

    try {
      const startTime = Date.now();

      // Call fal.ai API
      const response = await fetch(`${FAL_AI_BASE_URL}/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          num_frames: (request.duration || 5) * 24, // Convert seconds to frames (24fps)
          aspect_ratio: request.aspectRatio || '16:9',
          num_inference_steps: 30,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`fal.ai API error: ${error}`);
      }

      const data = (await response.json()) as FalVideoResponse;
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        videoUrl: data.video.url,
        thumbnailUrl: `${data.video.url}?frame=0`, // Extract first frame as thumbnail
        duration: request.duration || 5,
        engine,
        engineName: this.getEngineName(engine),
        cost: this.estimateCost(engine, request.duration || 5),
        creditsUsed: 1,
        metadata: {
          resolution: `${data.video.width}x${data.video.height}`,
          aspectRatio: request.aspectRatio,
          hasAudio: false,
          generatedAt: new Date().toISOString(),
          processingTime,
          fileSize: data.video.fileSize,
          provider: 'fal.ai',
        },
      };
    } catch (error) {
      const err = error as Error;
      console.error(`fal.ai error for ${engine}:`, err);

      return {
        success: false,
        error: err.message || 'Video generation failed',
        errorCode: 'GENERATION_ERROR',
        videoUrl: '',
        thumbnailUrl: '',
        duration: 0,
        engine,
        engineName: this.getEngineName(engine),
        cost: 0,
        creditsUsed: 0,
        metadata: {
          error: err.message,
        },
      };
    }
  }

  private getMockResponse(
    engine: VideoEngine,
    request: Omit<VideoGenerationRequest, 'engine'>
  ): VideoGenerationResponse {
    // Return mock response for development/testing
    return {
      success: true,
      videoUrl: `https://storage.googleapis.com/socialsync-mock/videos/${engine}-${Date.now()}.mp4`,
      thumbnailUrl: `https://storage.googleapis.com/socialsync-mock/thumbnails/${engine}-${Date.now()}.jpg`,
      duration: request.duration || 5,
      engine,
      engineName: this.getEngineName(engine),
      cost: this.estimateCost(engine, request.duration || 5),
      creditsUsed: 1,
      metadata: {
        resolution: request.resolution || '1080p',
        aspectRatio: request.aspectRatio || '16:9',
        hasAudio: false,
        generatedAt: new Date().toISOString(),
        processingTime: 2000,
        mock: true,
      },
    };
  }

  private getEngineName(engine: VideoEngine): string {
    const names: Record<string, string> = {
      'hailuo-02': 'Hailuo 02',
      'runway-gen4-turbo': 'Runway Gen-4 Turbo',
      'kling-2.1': 'Kling 2.1',
      'luma-ray3': 'Luma Ray 3',
      'pika-2.2': 'Pika 2.2',
    };
    return names[engine] || engine;
  }

  private estimateCost(engine: VideoEngine, duration: number): number {
    // Cost per second for each engine
    const costs: Record<string, number> = {
      'hailuo-02': 0.028,
      'runway-gen4-turbo': 0.05,
      'kling-2.1': 0.19,
      'luma-ray3': 0.12,
      'pika-2.2': 0.08,
    };

    const pricePerSecond = costs[engine] || 0.05;
    return pricePerSecond * duration;
  }

  // Health check
  async checkAvailability(): Promise<boolean> {
    if (!this.apiKey) {
      return false; // API key not configured
    }

    try {
      const response = await fetch(`${FAL_AI_BASE_URL}/health`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('fal.ai health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const falClient = new FalAIClient();
