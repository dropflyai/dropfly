import {
  VideoEngine,
  VideoGenerationRequest,
  VideoGenerationResponse,
} from '@/types/video-engine';
import { VIDEO_ENGINES, ENGINE_BY_TIER, hasEngineAccess } from './config';
import { falClient } from './fal-client';
import { replicateClient } from './replicate-client';

// Engines available via FAL.ai
const FAL_ENGINES: VideoEngine[] = [
  'sora-2', 'sora-2-pro',
  'veo-3.1', 'veo-3.1-fast',
  'runway-gen3-alpha', 'runway-gen4-turbo', 'runway-gen4-aleph',
  'kling-2.1', 'kling-2.5-turbo', 'kling-2.5-turbo-pro',
  'hunyuan-video', 'vidu-q2', 'seedance-1.0-pro', 'pixverse-v4.5',
  'ltx-2-pro', 'hailuo-02', 'wan-2.2', 'wan-2.5', 'pika-2.2',
  'luma-ray3', 'nova-reel', 'mochi-1', 'fabric-1.0'
];

// Engines available via Replicate (open source)
const REPLICATE_ENGINES: VideoEngine[] = [
  'cogvideox-5b', 'cogvideox-i2v'
];

// Main video generation service
export class VideoGenerationService {

  async generate(
    request: VideoGenerationRequest,
    userTier: string
  ): Promise<VideoGenerationResponse> {
    try {
      // Auto-select engine based on tier
      let engine = request.engine;
      if (engine === 'auto') {
        engine = ENGINE_BY_TIER[userTier] || 'hunyuan-video'; // Default to best value engine
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

      // Route to appropriate client based on engine
      let result: VideoGenerationResponse;

      if (REPLICATE_ENGINES.includes(engine as VideoEngine)) {
        // Use Replicate for open source models
        result = await replicateClient.generateVideo(engine as VideoEngine, request);
      } else if (FAL_ENGINES.includes(engine as VideoEngine)) {
        // Use FAL.ai for everything else
        result = await falClient.generateVideo(engine as VideoEngine, request);
      } else {
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
          error: `No client available for ${engineConfig.displayName}`,
          errorCode: 'CLIENT_NOT_FOUND',
        };
      }

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
