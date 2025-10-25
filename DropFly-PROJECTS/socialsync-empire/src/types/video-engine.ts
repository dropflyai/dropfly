// Video Engine Types for Multi-Engine AI Video Generation

export type VideoEngine =
  // OpenAI Sora
  | 'sora-2'
  | 'sora-2-pro'
  // Google Veo
  | 'veo-3.1'
  | 'veo-3.1-fast'
  // Runway
  | 'runway-gen3-alpha'
  | 'runway-gen4-turbo'
  | 'runway-gen4-aleph'
  // Kling AI
  | 'kling-2.1'
  | 'kling-2.5-turbo'
  | 'kling-2.5-turbo-pro'
  // Chinese Models
  | 'hunyuan-video'
  | 'vidu-q2'
  | 'seedance-1.0-pro'
  | 'pixverse-v4.5'
  // Other Premium
  | 'ltx-2-pro'
  | 'hailuo-02'
  | 'wan-2.2'
  | 'wan-2.5'
  | 'pika-2.2'
  | 'luma-ray3'
  | 'nova-reel'
  | 'mochi-1'
  | 'fabric-1.0'
  // Open Source
  | 'cogvideox-5b'
  | 'cogvideox-i2v';

export interface VideoEngineConfig {
  id: VideoEngine;
  name: string;
  displayName: string;
  version: string;
  provider: string;
  pricePerSecond: number;
  maxLength: number;
  resolution: string[];
  hasNativeAudio: boolean;
  apiStatus: 'available' | 'preview' | 'waitlist' | 'beta';
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency' | 'enterprise';
  badge?: string;
  rank?: string;
  speed: 'ultra-fast' | 'fast' | 'standard' | 'slow';
  features: string[];
  apiProvider?: 'direct' | 'eden-ai' | 'replicate' | 'fal-ai';
}

export interface VideoGenerationRequest {
  engine: VideoEngine | 'auto';
  prompt: string;
  duration: number;
  resolution: '480p' | '720p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1';
  includeAudio: boolean;
  voiceoverScript?: string;
  startFrame?: string; // Base64 image
  endFrame?: string; // Base64 image
  referenceImages?: string[]; // Base64 images
  style?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  engine: VideoEngine;
  engineName: string;
  cost: number;
  creditsUsed: number;
  metadata: {
    resolution: string;
    aspectRatio: string;
    hasAudio: boolean;
    generatedAt: string;
    processingTime?: number;
  };
  error?: string;
  errorCode?: string;
}

export interface VideoEngineAdapter {
  generate(request: Omit<VideoGenerationRequest, 'engine'>): Promise<VideoGenerationResponse>;
  estimateCost(duration: number): number;
  validateRequest(request: Omit<VideoGenerationRequest, 'engine'>): { valid: boolean; error?: string };
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  videoCredits: number;
  engines: VideoEngine[];
  features: string[];
  popular?: boolean;
}
