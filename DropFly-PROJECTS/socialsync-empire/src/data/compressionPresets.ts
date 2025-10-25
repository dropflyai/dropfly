// Advanced Compression Presets for Platform Optimization (2025)
// Based on extensive research and platform-specific algorithms

export interface CompressionPreset {
  id: string;
  name: string;
  platform: string;
  description: string;

  // Video encoding settings
  videoCodec: string;
  audioCodec: string;
  container: string;

  // Quality settings
  bitrate: {
    video: {
      target: number;
      min: number;
      max: number;
      mode: 'CBR' | 'VBR' | '2-pass';
    };
    audio: {
      target: number;
      quality: 'low' | 'medium' | 'high' | 'lossless';
    };
  };

  // Frame settings
  frameRate: {
    target: number;
    adaptive: boolean;
    maxDropFrames: number;
  };

  // Advanced encoding
  encoding: {
    profile: string;
    level: string;
    preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
    tune: 'film' | 'animation' | 'grain' | 'stillimage' | 'fastdecode' | 'zerolatency' | null;
    crf: number; // Constant Rate Factor for quality
    keyframeInterval: number;
    bFrames: number;
    refFrames: number;
  };

  // Color and format
  colorSpace: string;
  pixelFormat: string;
  colorRange: 'tv' | 'pc';

  // Platform-specific optimizations
  optimizations: {
    fastStart: boolean; // Move metadata to beginning for streaming
    optimizeFor: 'quality' | 'size' | 'speed' | 'compatibility';
    deinterlace: boolean;
    denoise: boolean;
    sharpen: boolean;
    stabilization: boolean;
  };

  // File size and limits
  constraints: {
    maxFileSize: number; // MB
    maxDuration: number; // seconds
    maxBitrate: number; // kbps
    minResolution: { width: number; height: number };
    maxResolution: { width: number; height: number };
  };

  // Performance hints
  performance: {
    complexity: 'low' | 'medium' | 'high';
    estimatedSpeed: string;
    recommendedCores: number;
    memoryUsage: 'low' | 'medium' | 'high';
  };
}

export const compressionPresets: CompressionPreset[] = [
  // Instagram Optimized Presets
  {
    id: 'instagram_reels_ultra',
    name: 'Instagram Reels (Ultra Quality)',
    platform: 'Instagram',
    description: 'Maximum quality for Instagram Reels with algorithm-friendly encoding',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 8000, min: 5000, max: 15000, mode: 'VBR' },
      audio: { target: 128, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'medium',
      tune: 'film',
      crf: 18,
      keyframeInterval: 2,
      bFrames: 3,
      refFrames: 3
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'quality',
      deinterlace: true,
      denoise: false,
      sharpen: true,
      stabilization: false
    },

    constraints: {
      maxFileSize: 4000,
      maxDuration: 90,
      maxBitrate: 15000,
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    },

    performance: {
      complexity: 'medium',
      estimatedSpeed: '1.5x realtime',
      recommendedCores: 4,
      memoryUsage: 'medium'
    }
  },

  {
    id: 'instagram_feed_optimized',
    name: 'Instagram Feed (Optimized)',
    platform: 'Instagram',
    description: 'Balanced quality for Instagram feed posts with fast upload',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 6000, min: 3500, max: 10000, mode: 'VBR' },
      audio: { target: 128, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'fast',
      tune: 'film',
      crf: 20,
      keyframeInterval: 2,
      bFrames: 2,
      refFrames: 2
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'size',
      deinterlace: true,
      denoise: true,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 4000,
      maxDuration: 60,
      maxBitrate: 10000,
      minResolution: { width: 720, height: 720 },
      maxResolution: { width: 1080, height: 1350 }
    },

    performance: {
      complexity: 'low',
      estimatedSpeed: '2.5x realtime',
      recommendedCores: 2,
      memoryUsage: 'low'
    }
  },

  // YouTube Optimized Presets
  {
    id: 'youtube_4k_premium',
    name: 'YouTube 4K (Premium Quality)',
    platform: 'YouTube',
    description: 'Maximum quality 4K upload to trigger VP9 encoding',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 45000, min: 35000, max: 68000, mode: '2-pass' },
      audio: { target: 320, quality: 'lossless' }
    },

    frameRate: { target: 30, adaptive: false, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '5.1',
      preset: 'slow',
      tune: 'film',
      crf: 16,
      keyframeInterval: 2,
      bFrames: 4,
      refFrames: 5
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'quality',
      deinterlace: true,
      denoise: false,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 256000,
      maxDuration: 43200,
      maxBitrate: 68000,
      minResolution: { width: 1920, height: 1080 },
      maxResolution: { width: 3840, height: 2160 }
    },

    performance: {
      complexity: 'high',
      estimatedSpeed: '0.3x realtime',
      recommendedCores: 8,
      memoryUsage: 'high'
    }
  },

  {
    id: 'youtube_1080p_balanced',
    name: 'YouTube 1080p (Balanced)',
    platform: 'YouTube',
    description: 'High quality 1080p with excellent compression efficiency',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 12000, min: 8000, max: 20000, mode: '2-pass' },
      audio: { target: 192, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.1',
      preset: 'medium',
      tune: 'film',
      crf: 18,
      keyframeInterval: 2,
      bFrames: 3,
      refFrames: 3
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'quality',
      deinterlace: true,
      denoise: true,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 256000,
      maxDuration: 43200,
      maxBitrate: 20000,
      minResolution: { width: 1280, height: 720 },
      maxResolution: { width: 1920, height: 1080 }
    },

    performance: {
      complexity: 'medium',
      estimatedSpeed: '1.0x realtime',
      recommendedCores: 4,
      memoryUsage: 'medium'
    }
  },

  {
    id: 'youtube_shorts_viral',
    name: 'YouTube Shorts (Viral Optimized)',
    platform: 'YouTube',
    description: 'Optimized for YouTube Shorts algorithm and mobile viewing',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 12000, min: 8000, max: 20000, mode: 'VBR' },
      audio: { target: 192, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'fast',
      tune: 'film',
      crf: 19,
      keyframeInterval: 2,
      bFrames: 2,
      refFrames: 2
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'compatibility',
      deinterlace: true,
      denoise: true,
      sharpen: true,
      stabilization: true
    },

    constraints: {
      maxFileSize: 256000,
      maxDuration: 60,
      maxBitrate: 20000,
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    },

    performance: {
      complexity: 'low',
      estimatedSpeed: '2.0x realtime',
      recommendedCores: 2,
      memoryUsage: 'low'
    }
  },

  // TikTok Optimized Presets
  {
    id: 'tiktok_ultra_engagement',
    name: 'TikTok (Ultra Engagement)',
    platform: 'TikTok',
    description: 'Maximum quality for TikTok algorithm optimization',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 8000, min: 6000, max: 12000, mode: 'VBR' },
      audio: { target: 128, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'fast',
      tune: 'zerolatency',
      crf: 19,
      keyframeInterval: 2.5,
      bFrames: 2,
      refFrames: 2
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'compatibility',
      deinterlace: true,
      denoise: true,
      sharpen: true,
      stabilization: true
    },

    constraints: {
      maxFileSize: 287,
      maxDuration: 180,
      maxBitrate: 12000,
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    },

    performance: {
      complexity: 'low',
      estimatedSpeed: '2.5x realtime',
      recommendedCores: 2,
      memoryUsage: 'low'
    }
  },

  {
    id: 'tiktok_60fps_premium',
    name: 'TikTok 60fps (Premium)',
    platform: 'TikTok',
    description: 'High frame rate for gaming and fast-paced content',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 12000, min: 8000, max: 15000, mode: 'VBR' },
      audio: { target: 192, quality: 'high' }
    },

    frameRate: { target: 60, adaptive: false, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.1',
      preset: 'fast',
      tune: 'zerolatency',
      crf: 18,
      keyframeInterval: 2,
      bFrames: 1,
      refFrames: 1
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'speed',
      deinterlace: true,
      denoise: false,
      sharpen: true,
      stabilization: false
    },

    constraints: {
      maxFileSize: 287,
      maxDuration: 60,
      maxBitrate: 15000,
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 }
    },

    performance: {
      complexity: 'medium',
      estimatedSpeed: '1.2x realtime',
      recommendedCores: 4,
      memoryUsage: 'medium'
    }
  },

  // Twitter/X Optimized Presets
  {
    id: 'twitter_optimized',
    name: 'Twitter/X (Optimized)',
    platform: 'Twitter',
    description: 'Lightweight encoding for Twitter compression algorithms',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 6000, min: 4000, max: 10000, mode: 'VBR' },
      audio: { target: 128, quality: 'medium' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 1 },

    encoding: {
      profile: 'main',
      level: '3.1',
      preset: 'fast',
      tune: 'zerolatency',
      crf: 21,
      keyframeInterval: 2,
      bFrames: 1,
      refFrames: 1
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'size',
      deinterlace: true,
      denoise: true,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 512,
      maxDuration: 140,
      maxBitrate: 25000,
      minResolution: { width: 640, height: 360 },
      maxResolution: { width: 1920, height: 1200 }
    },

    performance: {
      complexity: 'low',
      estimatedSpeed: '3.0x realtime',
      recommendedCores: 2,
      memoryUsage: 'low'
    }
  },

  // Facebook Optimized Presets
  {
    id: 'facebook_premium',
    name: 'Facebook (Premium Quality)',
    platform: 'Facebook',
    description: 'High quality for Facebook feed and video content',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 12000, min: 8000, max: 20000, mode: '2-pass' },
      audio: { target: 128, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'medium',
      tune: 'film',
      crf: 18,
      keyframeInterval: 2,
      bFrames: 3,
      refFrames: 3
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'quality',
      deinterlace: true,
      denoise: true,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 4000,
      maxDuration: 14400,
      maxBitrate: 20000,
      minResolution: { width: 720, height: 720 },
      maxResolution: { width: 1920, height: 1080 }
    },

    performance: {
      complexity: 'medium',
      estimatedSpeed: '1.5x realtime',
      recommendedCores: 4,
      memoryUsage: 'medium'
    }
  },

  // LinkedIn Optimized Presets
  {
    id: 'linkedin_professional',
    name: 'LinkedIn (Professional)',
    platform: 'LinkedIn',
    description: 'Professional quality for LinkedIn business content',

    videoCodec: 'libx264',
    audioCodec: 'aac',
    container: 'mp4',

    bitrate: {
      video: { target: 15000, min: 10000, max: 20000, mode: 'VBR' },
      audio: { target: 192, quality: 'high' }
    },

    frameRate: { target: 30, adaptive: true, maxDropFrames: 0 },

    encoding: {
      profile: 'high',
      level: '4.0',
      preset: 'medium',
      tune: 'film',
      crf: 17,
      keyframeInterval: 2,
      bFrames: 3,
      refFrames: 3
    },

    colorSpace: 'bt709',
    pixelFormat: 'yuv420p',
    colorRange: 'tv',

    optimizations: {
      fastStart: true,
      optimizeFor: 'quality',
      deinterlace: true,
      denoise: false,
      sharpen: false,
      stabilization: false
    },

    constraints: {
      maxFileSize: 5000,
      maxDuration: 900,
      maxBitrate: 20000,
      minResolution: { width: 720, height: 720 },
      maxResolution: { width: 1920, height: 1080 }
    },

    performance: {
      complexity: 'medium',
      estimatedSpeed: '1.0x realtime',
      recommendedCores: 4,
      memoryUsage: 'medium'
    }
  }
];

// Helper functions for intelligent preset selection
export function getPresetsByPlatform(platform: string): CompressionPreset[] {
  return compressionPresets.filter(preset =>
    preset.platform.toLowerCase() === platform.toLowerCase()
  );
}

export function getOptimalPreset(
  platform: string,
  quality: 'fast' | 'balanced' | 'quality' = 'balanced',
  content: 'general' | 'gaming' | 'animation' | 'talking' = 'general'
): CompressionPreset | null {
  const platformPresets = getPresetsByPlatform(platform);

  if (platformPresets.length === 0) return null;

  // Smart selection based on requirements
  let filtered = platformPresets;

  // Filter by quality preference
  if (quality === 'fast') {
    filtered = filtered.filter(p =>
      p.performance.complexity === 'low' ||
      p.encoding.preset === 'fast' ||
      p.encoding.preset === 'veryfast'
    );
  } else if (quality === 'quality') {
    filtered = filtered.filter(p =>
      p.encoding.preset === 'slow' ||
      p.encoding.preset === 'medium' ||
      p.bitrate.video.mode === '2-pass'
    );
  }

  // Filter by content type
  if (content === 'gaming' && platform.toLowerCase() === 'tiktok') {
    filtered = filtered.filter(p => p.frameRate.target >= 60);
  }

  // Return the best match or first available
  return filtered[0] || platformPresets[0];
}

export function getPresetById(id: string): CompressionPreset | null {
  return compressionPresets.find(preset => preset.id === id) || null;
}

export function getAllPlatforms(): string[] {
  return [...new Set(compressionPresets.map(preset => preset.platform))];
}

// Preset validation
export function validatePreset(preset: CompressionPreset): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check bitrate ranges
  if (preset.bitrate.video.target > preset.bitrate.video.max) {
    errors.push('Target bitrate exceeds maximum bitrate');
  }

  if (preset.bitrate.video.target < preset.bitrate.video.min) {
    errors.push('Target bitrate below minimum bitrate');
  }

  // Check resolution constraints
  if (preset.constraints.maxResolution.width < preset.constraints.minResolution.width) {
    errors.push('Maximum resolution width is less than minimum');
  }

  // Performance warnings
  if (preset.performance.complexity === 'high' && preset.performance.recommendedCores < 4) {
    warnings.push('High complexity preset may need more CPU cores');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}