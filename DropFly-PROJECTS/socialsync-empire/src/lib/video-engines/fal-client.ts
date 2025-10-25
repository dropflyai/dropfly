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
  // OpenAI Sora
  'sora-2': 'fal-ai/sora',
  'sora-2-pro': 'fal-ai/sora-pro',
  // Google Veo
  'veo-3.1': 'fal-ai/veo3',
  'veo-3.1-fast': 'fal-ai/veo3-fast',
  // Runway
  'runway-gen3-alpha': 'fal-ai/runway-gen3',
  'runway-gen4-turbo': 'fal-ai/runway-gen3-turbo',
  // Kling AI
  'kling-2.1': 'fal-ai/kling-video/v1',
  'kling-2.5-turbo': 'fal-ai/kling-video/v1.5/standard/text-to-video',
  'kling-2.5-turbo-pro': 'fal-ai/kling-video/v1.5/pro/text-to-video',
  // Chinese Models
  'hunyuan-video': 'fal-ai/hunyuan-video',
  'vidu-q2': 'fal-ai/vidu/video-to-video',
  'seedance-1.0-pro': 'fal-ai/seedance-video',
  'pixverse-v4.5': 'fal-ai/pixverse/v4.5',
  // Other Premium
  'ltx-2-pro': 'fal-ai/ltx-video/pro',
  'hailuo-02': 'fal-ai/minimax-video/hailuo',
  'wan-2.2': 'fal-ai/wan-video',
  'pika-2.2': 'fal-ai/pika',
  'luma-ray3': 'fal-ai/luma-dream-machine',
  'mochi-1': 'fal-ai/mochi-v1',
  'fabric-1.0': 'fal-ai/fabric',
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
  audio?: {
    url: string;
    content_type: string;
    file_size: number;
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
          enable_audio: request.includeAudio !== false, // Enable audio by default
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
          hasAudio: !!data.audio,
          audioUrl: data.audio?.url,
          generatedAt: new Date().toISOString(),
          processingTime,
          fileSize: data.video.file_size,
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
      // OpenAI Sora
      'sora-2': 'Sora 2',
      'sora-2-pro': 'Sora 2 Pro',
      // Google Veo
      'veo-3.1': 'Veo 3.1',
      'veo-3.1-fast': 'Veo 3.1 Fast',
      // Runway
      'runway-gen3-alpha': 'Runway Gen-3 Alpha',
      'runway-gen4-turbo': 'Runway Gen-4 Turbo',
      // Kling AI
      'kling-2.1': 'Kling 2.1',
      'kling-2.5-turbo': 'Kling 2.5 Turbo',
      'kling-2.5-turbo-pro': 'Kling 2.5 Turbo Pro',
      // Chinese Models
      'hunyuan-video': 'Hunyuan Video',
      'vidu-q2': 'Vidu Q2',
      'seedance-1.0-pro': 'Seedance 1.0 Pro',
      'pixverse-v4.5': 'PixVerse v4.5',
      // Other Premium
      'ltx-2-pro': 'LTX-2 Pro',
      'hailuo-02': 'Hailuo 02',
      'wan-2.2': 'WAN 2.2',
      'pika-2.2': 'Pika 2.2',
      'luma-ray3': 'Luma Ray 3',
      'mochi-1': 'Mochi 1',
      'fabric-1.0': 'Fabric 1.0',
    };
    return names[engine] || engine;
  }

  private estimateCost(engine: VideoEngine, duration: number): number {
    // Cost per second for each engine (updated 2025)
    const costs: Record<string, number> = {
      // OpenAI Sora (premium)
      'sora-2': 0.12,
      'sora-2-pro': 0.20,
      // Google Veo (premium)
      'veo-3.1': 0.15,
      'veo-3.1-fast': 0.10,
      // Runway (high quality)
      'runway-gen3-alpha': 0.08,
      'runway-gen4-turbo': 0.05,
      // Kling AI (Chinese, high quality)
      'kling-2.1': 0.19,
      'kling-2.5-turbo': 0.15,
      'kling-2.5-turbo-pro': 0.22,
      // Chinese Models (competitive pricing)
      'hunyuan-video': 0.06, // Open source, low cost
      'vidu-q2': 0.05,
      'seedance-1.0-pro': 0.04, // Budget-friendly
      'pixverse-v4.5': 0.07,
      // Other Premium
      'ltx-2-pro': 0.10,
      'hailuo-02': 0.028,
      'wan-2.2': 0.09,
      'pika-2.2': 0.08,
      'luma-ray3': 0.12,
      'mochi-1': 0.06,
      'fabric-1.0': 0.07,
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
