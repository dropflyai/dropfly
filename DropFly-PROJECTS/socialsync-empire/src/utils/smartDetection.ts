// Smart Detection System for Intelligent Auto-Optimization
// Advanced algorithms for automatic content analysis and platform matching

import { platformSpecs, type PlatformSpec } from '@/data/platformSpecs';
import { compressionPresets, type CompressionPreset } from '@/data/compressionPresets';
import { CompressionEngine, type VideoAnalysis, type ContentAnalysis } from '@/utils/compressionEngine';

export interface DetectionResult {
  recommendedPlatforms: {
    platform: PlatformSpec;
    confidence: number;
    reasoning: string[];
  }[];
  contentInsights: {
    type: 'talking_head' | 'gaming' | 'tutorial' | 'entertainment' | 'music' | 'sports' | 'animation' | 'general';
    confidence: number;
    characteristics: string[];
  };
  optimalSettings: {
    preset: CompressionPreset;
    confidence: number;
    customizations: Record<string, any>;
  };
  qualityRecommendations: {
    bitrate: { recommended: number; range: [number, number] };
    resolution: { recommended: { width: number; height: number }; alternatives: Array<{ width: number; height: number }> };
    frameRate: { recommended: number; explanation: string };
  };
}

export interface VideoMetrics {
  // Basic properties
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  aspectRatio: number;
  fileSize: number;
  bitrate?: number;

  // Advanced analysis
  motionVectors?: number; // Average motion between frames
  sceneChanges?: number; // Number of scene transitions
  audioLevel?: number; // RMS audio level
  colorComplexity?: number; // Color palette complexity
  textDetected?: boolean; // Presence of text overlays
  faceDetected?: boolean; // Presence of faces
  stabilityScore?: number; // Camera stability (0-1)
  noiseLevel?: number; // Video noise/grain level
}

export class SmartDetectionEngine {

  /**
   * Analyze video content and determine optimal platform targeting
   */
  static async detectOptimalPlatforms(metrics: VideoMetrics): Promise<DetectionResult['recommendedPlatforms']> {
    const recommendations: DetectionResult['recommendedPlatforms'] = [];

    for (const platform of platformSpecs) {
      let confidence = 50; // Base confidence
      const reasoning: string[] = [];

      // Aspect ratio analysis
      const platformPresets = platform.presets;
      const aspectRatioMatches = platformPresets.some(preset => {
        const presetRatio = preset.width / preset.height;
        return Math.abs(presetRatio - metrics.aspectRatio) < 0.1;
      });

      if (aspectRatioMatches) {
        confidence += 25;
        reasoning.push(`Aspect ratio (${metrics.aspectRatio.toFixed(2)}) matches platform format`);
      }

      // Duration analysis
      const avgMaxDuration = platformPresets.reduce((sum, p) => {
        const maxDur = parseInt(p.maxDuration.split(' ')[0]) || 60;
        return sum + maxDur;
      }, 0) / platformPresets.length;

      if (metrics.duration <= avgMaxDuration) {
        confidence += 15;
        reasoning.push(`Duration (${metrics.duration}s) fits platform limits`);
      } else {
        confidence -= 10;
        reasoning.push(`Duration exceeds typical platform limits`);
      }

      // Platform-specific optimizations
      switch (platform.id) {
        case 'instagram':
          if (metrics.aspectRatio > 0.8 && metrics.aspectRatio < 1.2) {
            confidence += 15; // Square format bonus
            reasoning.push('Square format ideal for Instagram posts');
          }
          if (metrics.aspectRatio < 0.8) {
            confidence += 20; // Vertical format bonus
            reasoning.push('Vertical format perfect for Instagram Reels/Stories');
          }
          if (metrics.duration <= 90) {
            confidence += 10;
            reasoning.push('Duration optimal for Instagram engagement');
          }
          break;

        case 'youtube':
          if (metrics.aspectRatio > 1.7 && metrics.aspectRatio < 1.8) {
            confidence += 20; // 16:9 bonus
            reasoning.push('16:9 aspect ratio perfect for YouTube');
          }
          if (metrics.duration > 60) {
            confidence += 15; // Longer content bonus
            reasoning.push('Longer duration suitable for YouTube content');
          }
          if (metrics.frameRate >= 60) {
            confidence += 10;
            reasoning.push('High frame rate excellent for YouTube quality');
          }
          break;

        case 'tiktok':
          if (metrics.aspectRatio < 0.8) {
            confidence += 25; // Vertical format essential
            reasoning.push('Vertical format essential for TikTok');
          }
          if (metrics.duration <= 60) {
            confidence += 20;
            reasoning.push('Short duration perfect for TikTok');
          }
          if (metrics.motionVectors && metrics.motionVectors > 0.7) {
            confidence += 10;
            reasoning.push('High motion content performs well on TikTok');
          }
          break;

        case 'twitter':
          if (metrics.duration <= 140) {
            confidence += 15;
            reasoning.push('Duration fits Twitter video limits');
          }
          if (metrics.fileSize <= 512) {
            confidence += 10;
            reasoning.push('File size compatible with Twitter limits');
          }
          break;

        case 'linkedin':
          if (metrics.aspectRatio > 1.2) {
            confidence += 15;
            reasoning.push('Landscape format suitable for LinkedIn');
          }
          if (metrics.duration <= 900) {
            confidence += 10;
            reasoning.push('Professional length content for LinkedIn');
          }
          break;
      }

      // Content type bonuses
      if (metrics.faceDetected) {
        if (platform.id === 'instagram' || platform.id === 'tiktok') {
          confidence += 10;
          reasoning.push('Face detection suggests social media suitability');
        }
      }

      if (metrics.textDetected) {
        if (platform.id === 'youtube' || platform.id === 'linkedin') {
          confidence += 8;
          reasoning.push('Text content suitable for professional platforms');
        }
      }

      recommendations.push({
        platform,
        confidence: Math.min(100, Math.max(0, confidence)),
        reasoning
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze content type and characteristics
   */
  static analyzeContentType(metrics: VideoMetrics): DetectionResult['contentInsights'] {
    let type: DetectionResult['contentInsights']['type'] = 'general';
    let confidence = 60;
    const characteristics: string[] = [];

    // Aspect ratio analysis
    if (metrics.aspectRatio < 0.8) {
      characteristics.push('Vertical format - likely mobile content');
      if (metrics.faceDetected) {
        type = 'talking_head';
        confidence += 20;
        characteristics.push('Face detected in vertical format suggests talking head content');
      }
    } else if (Math.abs(metrics.aspectRatio - 1) < 0.1) {
      characteristics.push('Square format - social media optimized');
    } else if (metrics.aspectRatio > 1.7) {
      characteristics.push('Widescreen format - traditional video content');
    }

    // Duration analysis
    if (metrics.duration <= 30) {
      characteristics.push('Short-form content');
      if (metrics.motionVectors && metrics.motionVectors > 0.8) {
        type = 'entertainment';
        confidence += 15;
        characteristics.push('High motion short content suggests entertainment');
      }
    } else if (metrics.duration <= 180) {
      characteristics.push('Medium-form content');
    } else {
      characteristics.push('Long-form content');
      if (metrics.sceneChanges && metrics.sceneChanges < 0.1) {
        type = 'tutorial';
        confidence += 20;
        characteristics.push('Low scene changes in long content suggests tutorial/educational');
      }
    }

    // Frame rate analysis
    if (metrics.frameRate >= 60) {
      type = 'gaming';
      confidence += 25;
      characteristics.push('High frame rate strongly indicates gaming content');
    } else if (metrics.frameRate <= 24) {
      characteristics.push('Cinematic frame rate');
      if (metrics.colorComplexity && metrics.colorComplexity > 0.8) {
        type = 'animation';
        confidence += 15;
        characteristics.push('Low frame rate with high color complexity suggests animation');
      }
    }

    // Audio analysis
    if (metrics.audioLevel && metrics.audioLevel > 0.8) {
      type = 'music';
      confidence += 20;
      characteristics.push('High audio levels suggest music content');
    }

    // Motion analysis
    if (metrics.motionVectors) {
      if (metrics.motionVectors > 0.9) {
        type = 'sports';
        confidence += 15;
        characteristics.push('Very high motion suggests sports content');
      } else if (metrics.motionVectors < 0.2) {
        type = 'talking_head';
        confidence += 10;
        characteristics.push('Low motion suggests static content like talking head');
      }
    }

    // Stability analysis
    if (metrics.stabilityScore && metrics.stabilityScore < 0.3) {
      characteristics.push('Handheld/mobile recording detected');
      if (type === 'general') {
        type = 'entertainment';
        confidence += 10;
      }
    }

    return {
      type,
      confidence: Math.min(100, confidence),
      characteristics
    };
  }

  /**
   * Generate optimal settings based on analysis
   */
  static generateOptimalSettings(
    metrics: VideoMetrics,
    targetPlatform: string,
    contentType: DetectionResult['contentInsights']['type']
  ): DetectionResult['optimalSettings'] {

    // Get base preset
    const platformPresets = compressionPresets.filter(p =>
      p.platform.toLowerCase() === targetPlatform.toLowerCase()
    );

    if (platformPresets.length === 0) {
      throw new Error(`No presets found for platform: ${targetPlatform}`);
    }

    // Select best preset based on content type
    let selectedPreset = platformPresets[0];
    let confidence = 70;
    const customizations: Record<string, any> = {};

    // Content type specific optimizations
    switch (contentType) {
      case 'gaming':
        // Prefer high frame rate presets
        const highFpsPreset = platformPresets.find(p => p.frameRate.target >= 60);
        if (highFpsPreset) {
          selectedPreset = highFpsPreset;
          confidence += 20;
        }
        customizations.tune = 'zerolatency';
        customizations.bFrames = 1; // Reduce for lower latency
        break;

      case 'talking_head':
        // Optimize for facial detail and low motion
        customizations.tune = 'film';
        customizations.denoise = true;
        customizations.crf = Math.max(16, selectedPreset.encoding.crf - 2); // Higher quality
        confidence += 15;
        break;

      case 'animation':
        // Optimize for animated content
        customizations.tune = 'animation';
        customizations.bFrames = 4; // More B-frames for animation
        confidence += 10;
        break;

      case 'music':
        // Prioritize audio quality
        customizations.audioBitrate = Math.max(192, selectedPreset.bitrate.audio.target);
        customizations.audioQuality = 'high';
        confidence += 10;
        break;

      case 'sports':
        // High motion optimization
        customizations.motionSearch = 'umh'; // Uneven multi-hexagon
        customizations.subpixelMotion = 10; // Maximum subpixel precision
        confidence += 15;
        break;
    }

    // Adjust for video characteristics
    if (metrics.noiseLevel && metrics.noiseLevel > 0.7) {
      customizations.denoise = true;
      customizations.denoiseStrength = 'medium';
    }

    if (metrics.stabilityScore && metrics.stabilityScore < 0.4) {
      customizations.stabilization = true;
    }

    // Resolution optimization
    if (metrics.width > selectedPreset.constraints.maxResolution.width ||
        metrics.height > selectedPreset.constraints.maxResolution.height) {
      customizations.resize = {
        width: selectedPreset.constraints.maxResolution.width,
        height: selectedPreset.constraints.maxResolution.height,
        method: 'lanczos'
      };
    }

    return {
      preset: selectedPreset,
      confidence,
      customizations
    };
  }

  /**
   * Generate quality recommendations
   */
  static generateQualityRecommendations(
    metrics: VideoMetrics,
    targetPlatform: string
  ): DetectionResult['qualityRecommendations'] {

    const platform = platformSpecs.find(p => p.id === targetPlatform);
    if (!platform) {
      throw new Error(`Platform not found: ${targetPlatform}`);
    }

    const recommendedPreset = platform.presets.find(p => p.isRecommended) || platform.presets[0];

    // Calculate optimal bitrate based on content complexity
    const baselineBitrate = recommendedPreset.bitrate.recommended;
    const pixelCount = metrics.width * metrics.height;
    const complexityFactor = (metrics.motionVectors || 0.5) * (metrics.colorComplexity || 0.5);

    let adjustedBitrate = baselineBitrate;

    // Adjust based on complexity
    if (complexityFactor > 0.8) {
      adjustedBitrate = Math.min(recommendedPreset.bitrate.max, baselineBitrate * 1.3);
    } else if (complexityFactor < 0.3) {
      adjustedBitrate = Math.max(recommendedPreset.bitrate.min, baselineBitrate * 0.8);
    }

    // Resolution recommendations
    const recommendedResolution = {
      width: recommendedPreset.width,
      height: recommendedPreset.height
    };

    const alternatives = platform.presets
      .filter(p => p.id !== recommendedPreset.id)
      .map(p => ({ width: p.width, height: p.height }))
      .slice(0, 3);

    // Frame rate recommendation
    let recommendedFrameRate = recommendedPreset.frameRate;
    let frameRateExplanation = 'Standard frame rate for platform';

    if (metrics.frameRate >= 60 && targetPlatform === 'tiktok') {
      recommendedFrameRate = 60;
      frameRateExplanation = 'High frame rate maintained for smooth motion';
    } else if (metrics.frameRate <= 24) {
      recommendedFrameRate = Math.max(24, recommendedPreset.frameRate);
      frameRateExplanation = 'Upscaled from cinematic frame rate';
    }

    return {
      bitrate: {
        recommended: Math.round(adjustedBitrate),
        range: [recommendedPreset.bitrate.min, recommendedPreset.bitrate.max]
      },
      resolution: {
        recommended: recommendedResolution,
        alternatives
      },
      frameRate: {
        recommended: recommendedFrameRate,
        explanation: frameRateExplanation
      }
    };
  }

  /**
   * Complete intelligent detection pipeline
   */
  static async performCompleteAnalysis(metrics: VideoMetrics): Promise<DetectionResult> {
    const recommendedPlatforms = await this.detectOptimalPlatforms(metrics);
    const contentInsights = this.analyzeContentType(metrics);

    // Use top recommended platform for optimal settings
    const topPlatform = recommendedPlatforms[0]?.platform.id || 'youtube';

    const optimalSettings = this.generateOptimalSettings(
      metrics,
      topPlatform,
      contentInsights.type
    );

    const qualityRecommendations = this.generateQualityRecommendations(
      metrics,
      topPlatform
    );

    return {
      recommendedPlatforms,
      contentInsights,
      optimalSettings,
      qualityRecommendations
    };
  }

  /**
   * Mock video analysis for demonstration (would be replaced with actual video analysis)
   */
  static async mockVideoAnalysis(file: File): Promise<VideoMetrics> {
    // In a real implementation, this would use WebCodecs API or similar
    // to analyze the actual video file

    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate realistic mock data based on file properties
        const fileName = file.name.toLowerCase();
        const aspectRatio = fileName.includes('vertical') ? 0.56 :
                           fileName.includes('square') ? 1.0 : 1.78;

        const mockMetrics: VideoMetrics = {
          width: aspectRatio < 1 ? 1080 : 1920,
          height: aspectRatio < 1 ? 1920 : 1080,
          duration: Math.random() * 300 + 30, // 30-330 seconds
          frameRate: Math.random() > 0.8 ? 60 : 30,
          aspectRatio,
          fileSize: file.size / (1024 * 1024), // Convert to MB
          bitrate: Math.random() * 10000 + 2000,
          motionVectors: Math.random(),
          sceneChanges: Math.random(),
          audioLevel: Math.random(),
          colorComplexity: Math.random(),
          textDetected: Math.random() > 0.7,
          faceDetected: Math.random() > 0.6,
          stabilityScore: Math.random(),
          noiseLevel: Math.random()
        };

        resolve(mockMetrics);
      }, 1000); // Simulate analysis time
    });
  }
}

// Export utility functions
export { SmartDetectionEngine };