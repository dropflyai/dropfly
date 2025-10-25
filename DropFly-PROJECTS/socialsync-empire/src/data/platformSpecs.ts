// Advanced Platform Specifications for Optimal Quality (2025)
// Based on comprehensive research of platform requirements

export interface PlatformSpec {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;

  // Video specifications
  videoFormats: string[];
  audioFormats: string[];

  // Optimal presets (multiple options per platform)
  presets: {
    id: string;
    name: string;
    description: string;
    isRecommended?: boolean;

    // Dimensions & aspect ratio
    width: number;
    height: number;
    aspectRatio: string;

    // Quality settings
    videoCodec: string;
    audioCodec: string;
    bitrate: {
      min: number;
      recommended: number;
      max: number;
    };
    frameRate: number;

    // Advanced settings
    keyframeInterval: number;
    colorSpace: string;
    pixelFormat: string;
    encodingMethod: 'CBR' | 'VBR' | '2-pass';

    // Platform limits
    maxFileSize: string;
    maxDuration: string;
  }[];

  // Platform-specific optimizations
  optimizations: {
    uploadHD?: boolean;
    compressionTips: string[];
    qualityTips: string[];
  };
}

export const platformSpecs: PlatformSpec[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    displayName: 'Instagram',
    icon: '📷',
    color: 'from-purple-500 to-pink-500',
    videoFormats: ['MP4', 'MOV'],
    audioFormats: ['AAC'],
    presets: [
      {
        id: 'instagram_reels',
        name: 'Instagram Reels (Recommended)',
        description: 'Optimized for Reels and Stories - maximum engagement',
        isRecommended: true,
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 3500, recommended: 8000, max: 15000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '4GB',
        maxDuration: '90 seconds'
      },
      {
        id: 'instagram_feed_vertical',
        name: 'Instagram Feed (Vertical)',
        description: 'Vertical format for feed posts',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 3500, recommended: 6000, max: 10000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '4GB',
        maxDuration: '60 seconds'
      },
      {
        id: 'instagram_feed_square',
        name: 'Instagram Feed (Square)',
        description: 'Square format for classic Instagram posts',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 3500, recommended: 5000, max: 8000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '4GB',
        maxDuration: '60 seconds'
      }
    ],
    optimizations: {
      uploadHD: true,
      compressionTips: [
        'Use 2-pass encoding for better quality-to-size ratio',
        'Upload during non-peak hours for better processing',
        'Enable "Upload HD" in Instagram settings before posting'
      ],
      qualityTips: [
        'Upload at exact 1080x1920 to avoid additional compression',
        'Use consistent frame rate throughout video',
        'Avoid interlaced footage - use progressive scan only'
      ]
    }
  },

  {
    id: 'youtube',
    name: 'YouTube',
    displayName: 'YouTube',
    icon: '🎬',
    color: 'from-red-500 to-red-600',
    videoFormats: ['MP4', 'MOV', 'AVI', 'WMV', 'FLV', 'WebM'],
    audioFormats: ['AAC', 'MP3'],
    presets: [
      {
        id: 'youtube_landscape',
        name: 'YouTube Standard (Recommended)',
        description: 'Standard landscape format - upload in 4K for best codec',
        isRecommended: true,
        width: 3840,
        height: 2160,
        aspectRatio: '16:9',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 35000, recommended: 45000, max: 60000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: '2-pass',
        maxFileSize: '256GB',
        maxDuration: '12 hours'
      },
      {
        id: 'youtube_1080p',
        name: 'YouTube 1080p',
        description: 'High quality 1080p for standard content',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: '2-pass',
        maxFileSize: '256GB',
        maxDuration: '12 hours'
      },
      {
        id: 'youtube_shorts',
        name: 'YouTube Shorts',
        description: 'Vertical format for YouTube Shorts',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '256GB',
        maxDuration: '60 seconds'
      }
    ],
    optimizations: {
      compressionTips: [
        'Upload in 4K even for 1080p content to get VP9 codec',
        'Use 2-pass encoding for optimal quality',
        'Upload higher bitrate than final - YouTube will optimize'
      ],
      qualityTips: [
        'Use Rec.709 color space for SDR content',
        'Maintain consistent keyframe interval of 2 seconds',
        'Avoid interlaced footage for best quality'
      ]
    }
  },

  {
    id: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok',
    icon: '🎵',
    color: 'from-black to-gray-800',
    videoFormats: ['MP4', 'MOV'],
    audioFormats: ['AAC'],
    presets: [
      {
        id: 'tiktok_standard',
        name: 'TikTok Standard (Recommended)',
        description: 'Optimized for TikTok algorithm and quality',
        isRecommended: true,
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 6000, recommended: 8000, max: 10000 },
        frameRate: 30,
        keyframeInterval: 2.5,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '287.6MB',
        maxDuration: '60 seconds'
      },
      {
        id: 'tiktok_high_fps',
        name: 'TikTok High Frame Rate',
        description: 'For fast-paced content and gaming',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 15000 },
        frameRate: 60,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '287.6MB',
        maxDuration: '60 seconds'
      }
    ],
    optimizations: {
      uploadHD: true,
      compressionTips: [
        'Enable "Upload HD" in TikTok settings before posting',
        'Use fast, stable internet connection to avoid heavy compression',
        'Export with high bitrate - TikTok will compress optimally'
      ],
      qualityTips: [
        'Use 8-bit color depth (YUV420p) for best compatibility',
        'Keep keyframe interval at 2-3 seconds for smooth playback',
        'Optimize audio at 128 kbps AAC for best quality'
      ]
    }
  },

  {
    id: 'twitter',
    name: 'Twitter/X',
    displayName: 'Twitter/X',
    icon: '𝕏',
    color: 'from-gray-800 to-black',
    videoFormats: ['MP4', 'MOV'],
    audioFormats: ['AAC'],
    presets: [
      {
        id: 'twitter_landscape',
        name: 'Twitter Landscape (Recommended)',
        description: 'Optimized for Twitter feed and engagement',
        isRecommended: true,
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 5000, recommended: 8000, max: 25000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '512MB',
        maxDuration: '140 seconds'
      },
      {
        id: 'twitter_square',
        name: 'Twitter Square',
        description: 'Square format for mobile optimization',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 5000, recommended: 7000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '512MB',
        maxDuration: '140 seconds'
      },
      {
        id: 'twitter_vertical',
        name: 'Twitter Vertical',
        description: 'Vertical format for mobile engagement',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 5000, recommended: 8000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '512MB',
        maxDuration: '140 seconds'
      }
    ],
    optimizations: {
      compressionTips: [
        'Keep files under 30MB for optimal performance',
        'Use variable bitrate for better quality-to-size ratio',
        'Optimize for mobile viewing (93% of views are mobile)'
      ],
      qualityTips: [
        'Pre-compress video to avoid Twitter re-compression',
        'Use consistent frame rate throughout video',
        'Target 15 seconds or less for maximum engagement'
      ]
    }
  },

  {
    id: 'facebook',
    name: 'Facebook',
    displayName: 'Facebook',
    icon: '👥',
    color: 'from-blue-600 to-blue-700',
    videoFormats: ['MP4', 'MOV'],
    audioFormats: ['AAC'],
    presets: [
      {
        id: 'facebook_square',
        name: 'Facebook Square (Recommended)',
        description: 'Square format for maximum mobile engagement',
        isRecommended: true,
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: '2-pass',
        maxFileSize: '4GB',
        maxDuration: '240 minutes'
      },
      {
        id: 'facebook_vertical',
        name: 'Facebook Vertical',
        description: 'Vertical format optimized for mobile feeds',
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 15000, max: 25000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: '2-pass',
        maxFileSize: '4GB',
        maxDuration: '240 minutes'
      },
      {
        id: 'facebook_landscape',
        name: 'Facebook Landscape',
        description: 'Traditional landscape format for desktop',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: '2-pass',
        maxFileSize: '4GB',
        maxDuration: '240 minutes'
      }
    ],
    optimizations: {
      compressionTips: [
        'Upload in 4K for best quality preservation',
        'Use 2-pass encoding for optimal compression',
        'Prioritize mobile-optimized formats for better reach'
      ],
      qualityTips: [
        'Use VBR for better quality at lower file sizes',
        'Keep audio at 128 kbps AAC for optimal balance',
        'Upload crisp 1080p to avoid additional compression'
      ]
    }
  },

  {
    id: 'linkedin',
    name: 'LinkedIn',
    displayName: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    videoFormats: ['MP4', 'MOV'],
    audioFormats: ['AAC', 'MPEG4'],
    presets: [
      {
        id: 'linkedin_vertical',
        name: 'LinkedIn Vertical (Recommended)',
        description: 'Vertical format for maximum professional engagement',
        isRecommended: true,
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 10000, recommended: 15000, max: 20000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '5GB',
        maxDuration: '15 minutes'
      },
      {
        id: 'linkedin_square',
        name: 'LinkedIn Square',
        description: 'Square format for professional content',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 18000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '5GB',
        maxDuration: '15 minutes'
      },
      {
        id: 'linkedin_landscape',
        name: 'LinkedIn Landscape',
        description: 'Landscape format for presentations and demos',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        bitrate: { min: 8000, recommended: 12000, max: 18000 },
        frameRate: 30,
        keyframeInterval: 2,
        colorSpace: 'Rec.709',
        pixelFormat: 'YUV420p',
        encodingMethod: 'VBR',
        maxFileSize: '5GB',
        maxDuration: '15 minutes'
      }
    ],
    optimizations: {
      compressionTips: [
        'Use well-compressed 1080p for best quality-to-size ratio',
        'Optimize for mobile viewing with vertical/square formats',
        'Maintain professional quality with higher bitrates'
      ],
      qualityTips: [
        'Upload crisp 1080p to avoid LinkedIn re-compression',
        'Use VBR encoding for better quality consistency',
        'Keep frame rate at 30fps for professional appearance'
      ]
    }
  }
];

// Helper functions for intelligent preset selection
export function getRecommendedPreset(platformId: string) {
  const platform = platformSpecs.find(p => p.id === platformId);
  return platform?.presets.find(preset => preset.isRecommended) || platform?.presets[0];
}

export function getAllPlatforms() {
  return platformSpecs;
}

export function getPlatformById(id: string) {
  return platformSpecs.find(p => p.id === id);
}

export function getPresetsForPlatform(platformId: string) {
  return platformSpecs.find(p => p.id === platformId)?.presets || [];
}

// Intelligent aspect ratio detection
export function detectOptimalPreset(sourceWidth: number, sourceHeight: number, targetPlatform: string) {
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const platform = getPlatformById(targetPlatform);

  if (!platform) return null;

  // Find preset with closest aspect ratio match
  let bestMatch = platform.presets[0];
  let smallestDifference = Infinity;

  for (const preset of platform.presets) {
    const presetAspectRatio = preset.width / preset.height;
    const difference = Math.abs(sourceAspectRatio - presetAspectRatio);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestMatch = preset;
    }
  }

  return bestMatch;
}