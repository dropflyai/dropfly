import {
  VideoEngine,
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoEngineAdapter,
} from '@/types/video-engine';
import { VIDEO_ENGINES, ENGINE_BY_TIER, hasEngineAccess } from './config';
import { falClient } from './fal-client';

// Real adapters using fal.ai
class HailuoAdapter implements VideoEngineAdapter {
  async generate(
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    // Use fal.ai client for real video generation
    return await falClient.generateVideo('hailuo-02', request);
  }

  estimateCost(duration: number): number {
    return duration * 0.028;
  }

  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string } {
    if (request.duration > 10) {
      return { valid: false, error: 'Hailuo 02 supports max 10 seconds' };
    }
    return { valid: true };
  }
}

class RunwayAdapter implements VideoEngineAdapter {
  constructor(private model: 'gen4-turbo' | 'gen4-aleph' = 'gen4-turbo') {}

  async generate(
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const engine = this.model === 'gen4-turbo' ? 'runway-gen4-turbo' : 'runway-gen4-aleph';

    return {
      success: true,
      videoUrl: `https://example.com/videos/runway-${Date.now()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/runway-${Date.now()}.jpg`,
      duration: request.duration,
      engine,
      engineName: this.model === 'gen4-turbo' ? 'Runway Gen-4 Turbo' : 'Runway Gen-4 Aleph',
      cost: this.estimateCost(request.duration),
      creditsUsed: 1,
      metadata: {
        resolution: request.resolution,
        aspectRatio: request.aspectRatio,
        hasAudio: false,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
    };
  }

  estimateCost(duration: number): number {
    return duration * (this.model === 'gen4-turbo' ? 0.05 : 0.15);
  }

  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string } {
    if (request.duration > 120) {
      return { valid: false, error: 'Runway supports max 120 seconds' };
    }
    return { valid: true };
  }
}

class KlingAdapter implements VideoEngineAdapter {
  async generate(
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500));

    return {
      success: true,
      videoUrl: `https://example.com/videos/kling-${Date.now()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/kling-${Date.now()}.jpg`,
      duration: request.duration,
      engine: 'kling-2.1',
      engineName: 'Kling 2.1',
      cost: this.estimateCost(request.duration),
      creditsUsed: 1,
      metadata: {
        resolution: request.resolution,
        aspectRatio: request.aspectRatio,
        hasAudio: false,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
    };
  }

  estimateCost(duration: number): number {
    return duration * 0.10;
  }

  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string } {
    if (request.duration > 10) {
      return { valid: false, error: 'Kling 2.1 supports max 10 seconds' };
    }
    return { valid: true };
  }
}

class VeoAdapter implements VideoEngineAdapter {
  constructor(private variant: 'standard' | 'fast' = 'standard') {}

  async generate(
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const engine = this.variant === 'fast' ? 'veo-3.1-fast' : 'veo-3.1';

    return {
      success: true,
      videoUrl: `https://example.com/videos/veo-${Date.now()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/veo-${Date.now()}.jpg`,
      duration: request.duration,
      engine,
      engineName: this.variant === 'fast' ? 'Google Veo 3.1 Fast' : 'Google Veo 3.1',
      cost: this.estimateCost(request.duration),
      creditsUsed: 1,
      metadata: {
        resolution: request.resolution,
        aspectRatio: request.aspectRatio,
        hasAudio: true,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
    };
  }

  estimateCost(duration: number): number {
    return duration * (this.variant === 'fast' ? 0.15 : 0.40);
  }

  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string } {
    if (request.duration > 148) {
      return { valid: false, error: 'Veo 3.1 supports max 148 seconds with extensions' };
    }
    return { valid: true };
  }
}

class SoraAdapter implements VideoEngineAdapter {
  constructor(private variant: 'standard' | 'pro' = 'standard') {}

  async generate(
    request: Omit<VideoGenerationRequest, 'engine'>
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const engine = this.variant === 'pro' ? 'sora-2-pro' : 'sora-2';

    return {
      success: true,
      videoUrl: `https://example.com/videos/sora-${Date.now()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/sora-${Date.now()}.jpg`,
      duration: request.duration,
      engine,
      engineName: this.variant === 'pro' ? 'OpenAI Sora 2 Pro' : 'OpenAI Sora 2',
      cost: this.estimateCost(request.duration),
      creditsUsed: 1,
      metadata: {
        resolution: request.resolution,
        aspectRatio: request.aspectRatio,
        hasAudio: true,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      },
    };
  }

  estimateCost(duration: number): number {
    return duration * (this.variant === 'pro' ? 0.50 : 0.30);
  }

  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string } {
    if (request.duration > 20) {
      return { valid: false, error: 'Sora 2 supports max 20 seconds' };
    }
    return { valid: true };
  }
}

// Main video generation service
export class VideoGenerationService {
  private adapters: Record<string, VideoEngineAdapter> = {
    'hailuo-02': new HailuoAdapter(),
    'runway-gen4-turbo': new RunwayAdapter('gen4-turbo'),
    'runway-gen4-aleph': new RunwayAdapter('gen4-aleph'),
    'kling-2.1': new KlingAdapter(),
    'veo-3.1': new VeoAdapter('standard'),
    'veo-3.1-fast': new VeoAdapter('fast'),
    'sora-2': new SoraAdapter('standard'),
    'sora-2-pro': new SoraAdapter('pro'),
  };

  async generate(
    request: VideoGenerationRequest,
    userTier: string
  ): Promise<VideoGenerationResponse> {
    try {
      // Auto-select engine based on tier
      let engine = request.engine;
      if (engine === 'auto') {
        engine = ENGINE_BY_TIER[userTier] || 'hailuo-02';
      }

      // Validate engine exists
      const engineConfig = VIDEO_ENGINES[engine as VideoEngine];
      if (!engineConfig) {
        return {
          success: false,
          duration: 0,
          engine: engine as VideoEngine,
          engineName: 'Unknown',
          cost: 0,
          creditsUsed: 0,
          metadata: {
            resolution: request.resolution,
            aspectRatio: request.aspectRatio,
            hasAudio: false,
            generatedAt: new Date().toISOString(),
          },
          error: `Unknown engine: ${engine}`,
          errorCode: 'UNKNOWN_ENGINE',
        };
      }

      // Check user has access to this engine
      if (!hasEngineAccess(userTier, engine as VideoEngine)) {
        return {
          success: false,
          duration: 0,
          engine: engine as VideoEngine,
          engineName: engineConfig.displayName,
          cost: 0,
          creditsUsed: 0,
          metadata: {
            resolution: request.resolution,
            aspectRatio: request.aspectRatio,
            hasAudio: false,
            generatedAt: new Date().toISOString(),
          },
          error: `Your ${userTier} plan doesn't include ${engineConfig.displayName}. Upgrade to access this engine.`,
          errorCode: 'ENGINE_NOT_AVAILABLE',
        };
      }

      // Check API status
      if (engineConfig.apiStatus === 'waitlist') {
        return {
          success: false,
          duration: 0,
          engine: engine as VideoEngine,
          engineName: engineConfig.displayName,
          cost: 0,
          creditsUsed: 0,
          metadata: {
            resolution: request.resolution,
            aspectRatio: request.aspectRatio,
            hasAudio: false,
            generatedAt: new Date().toISOString(),
          },
          error: `${engineConfig.displayName} is currently on waitlist`,
          errorCode: 'ENGINE_WAITLIST',
        };
      }

      // Get adapter
      const adapter = this.adapters[engine];
      if (!adapter) {
        return {
          success: false,
          duration: 0,
          engine: engine as VideoEngine,
          engineName: engineConfig.displayName,
          cost: 0,
          creditsUsed: 0,
          metadata: {
            resolution: request.resolution,
            aspectRatio: request.aspectRatio,
            hasAudio: false,
            generatedAt: new Date().toISOString(),
          },
          error: `Adapter not implemented for ${engineConfig.displayName}`,
          errorCode: 'ADAPTER_NOT_FOUND',
        };
      }

      // Validate request
      const validation = adapter.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          duration: 0,
          engine: engine as VideoEngine,
          engineName: engineConfig.displayName,
          cost: 0,
          creditsUsed: 0,
          metadata: {
            resolution: request.resolution,
            aspectRatio: request.aspectRatio,
            hasAudio: false,
            generatedAt: new Date().toISOString(),
          },
          error: validation.error,
          errorCode: 'VALIDATION_ERROR',
        };
      }

      // Generate video
      const result = await adapter.generate(request);
      return result;
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        duration: 0,
        engine: request.engine as VideoEngine,
        engineName: 'Unknown',
        cost: 0,
        creditsUsed: 0,
        metadata: {
          resolution: request.resolution,
          aspectRatio: request.aspectRatio,
          hasAudio: false,
          generatedAt: new Date().toISOString(),
        },
        error: err.message || 'Video generation failed',
        errorCode: 'GENERATION_ERROR',
      };
    }
  }

  // Get available engines for user's tier
  getAvailableEngines(userTier: string): typeof VIDEO_ENGINES {
    const tierEngineIds = Object.entries(VIDEO_ENGINES)
      .filter(([, config]) => {
        return hasEngineAccess(userTier, config.id as VideoEngine) && config.apiStatus === 'available';
      })
      .reduce((acc, [id, config]) => {
        acc[id as VideoEngine] = config;
        return acc;
      }, {} as typeof VIDEO_ENGINES);

    return tierEngineIds;
  }

  // Get auto-selected engine for user's tier
  getAutoEngine(userTier: string): VideoEngine {
    return ENGINE_BY_TIER[userTier] || 'hailuo-02';
  }

  // Estimate cost for a video
  estimateCost(engine: VideoEngine, duration: number): number {
    const config = VIDEO_ENGINES[engine];
    return duration * config.pricePerSecond;
  }
}

// Singleton instance
export const videoService = new VideoGenerationService();
