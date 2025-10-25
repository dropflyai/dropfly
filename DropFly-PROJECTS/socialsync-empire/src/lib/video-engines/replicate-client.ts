import { VideoEngine, VideoGenerationRequest, VideoGenerationResponse } from '@/types/video-engine';

/**
 * Replicate Client for Open Source Video Generation
 * Supports CogVideoX and other open source models
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

// Map our engine IDs to Replicate model versions
const REPLICATE_MODEL_MAP: Record<string, string> = {
  'cogvideox-5b': 'zai-org/cogvideox-5b',
  'cogvideox-i2v': 'thudm/cogvideox-i2v',
};

export interface ReplicateVideoRequest {
  prompt: string;
  num_frames?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface ReplicateVideoResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string | string[];
  error?: string;
}

export class ReplicateClient {
  private apiToken: string;

  constructor(apiToken?: string) {
    this.apiToken = apiToken || REPLICATE_API_TOKEN || '';

    if (!this.apiToken) {
      console.warn('REPLICATE_API_TOKEN not set - CogVideoX generation will use mock responses');
    }
  }

  async generateVideo(
    engine: VideoEngine,
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const modelId = REPLICATE_MODEL_MAP[engine];

    if (!modelId) {
      return {
        success: false,
        error: `Engine ${engine} not supported by Replicate`,
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

    // If no API token, return mock response for development
    if (!this.apiToken) {
      return this.getMockResponse(engine, request);
    }

    try {
      const startTime = Date.now();

      // Create prediction
      const createResponse = await fetch(`${REPLICATE_API_URL}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: await this.getModelVersion(modelId),
          input: {
            prompt: request.prompt,
            num_frames: Math.floor((request.duration || 5) * 8), // CogVideoX runs at 8fps
            guidance_scale: 7.5,
            num_inference_steps: 50,
          },
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Replicate API error: ${error}`);
      }

      const prediction = (await createResponse.json()) as ReplicateVideoResponse;

      // Poll for completion
      const result = await this.pollPrediction(prediction.id);

      if (result.status !== 'succeeded' || !result.output) {
        throw new Error(result.error || 'Video generation failed');
      }

      const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        videoUrl,
        thumbnailUrl: `${videoUrl}?frame=0`,
        duration: request.duration || 5,
        engine,
        engineName: this.getEngineName(engine),
        cost: this.estimateCost(engine, request.duration || 5),
        creditsUsed: 1,
        metadata: {
          resolution: '720x480',
          aspectRatio: request.aspectRatio || '16:9',
          hasAudio: false, // CogVideoX doesn't generate audio
          generatedAt: new Date().toISOString(),
          processingTime,
          provider: 'replicate',
          predictionId: result.id,
        },
      };
    } catch (error) {
      const err = error as Error;
      console.error(`Replicate error for ${engine}:`, err);

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

  private async getModelVersion(modelId: string): Promise<string> {
    // Get the latest version of the model
    const response = await fetch(`${REPLICATE_API_URL}/models/${modelId}`, {
      headers: {
        'Authorization': `Token ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get model version');
    }

    const data = await response.json();
    return data.latest_version.id;
  }

  private async pollPrediction(id: string, maxAttempts = 60): Promise<ReplicateVideoResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${REPLICATE_API_URL}/predictions/${id}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      const prediction = (await response.json()) as ReplicateVideoResponse;

      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }

      // Wait 2 seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Prediction timed out');
  }

  private getMockResponse(
    engine: VideoEngine,
    request: Omit<VideoGenerationRequest, 'engine'>
  ): VideoGenerationResponse {
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
        resolution: '720x480',
        aspectRatio: request.aspectRatio || '16:9',
        hasAudio: false,
        generatedAt: new Date().toISOString(),
        processingTime: 5000,
        mock: true,
      },
    };
  }

  private getEngineName(engine: VideoEngine): string {
    const names: Record<string, string> = {
      'cogvideox-5b': 'CogVideoX 5B',
      'cogvideox-i2v': 'CogVideoX Image-to-Video',
    };
    return names[engine] || engine;
  }

  private estimateCost(engine: VideoEngine, duration: number): number {
    // CogVideoX is open source, costs are compute-based
    const costs: Record<string, number> = {
      'cogvideox-5b': 0.02, // Very cheap on Replicate
      'cogvideox-i2v': 0.025,
    };

    const pricePerSecond = costs[engine] || 0.02;
    return pricePerSecond * duration;
  }

  async checkAvailability(): Promise<boolean> {
    if (!this.apiToken) {
      return false;
    }

    try {
      const response = await fetch(`${REPLICATE_API_URL}/models`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Replicate health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const replicateClient = new ReplicateClient();
