// Intelligent Compression Engine for Platform Optimization
// Advanced algorithms for automatic quality and preset selection

import { CompressionPreset, getOptimalPreset, getPresetById } from '@/data/compressionPresets';
import { PlatformSpec, getPlatformById } from '@/data/platformSpecs';

export interface VideoAnalysis {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  bitrate?: number;
  fileSize: number;
  aspectRatio: number;
  hasAudio: boolean;
  colorSpace?: string;
  pixelFormat?: string;
}

export interface ContentAnalysis {
  motionLevel: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'medium' | 'complex';
  contentType: 'talking' | 'gaming' | 'animation' | 'sports' | 'general';
  hasText: boolean;
  hasFaces: boolean;
  stabilityNeeded: boolean;
  noiseLevel: 'low' | 'medium' | 'high';
}

export interface CompressionRecommendation {
  preset: CompressionPreset;
  confidence: number; // 0-100
  reasoning: string[];
  estimatedFileSize: number; // MB
  estimatedProcessingTime: number; // minutes
  qualityScore: number; // 0-100
  platformCompatibility: number; // 0-100
  alternatives: CompressionPreset[];
}

export interface OptimizationRequest {
  targetPlatform: string;
  videoAnalysis: VideoAnalysis;
  contentAnalysis?: Partial<ContentAnalysis>;
  userPreferences: {
    priority: 'speed' | 'quality' | 'size' | 'compatibility';
    maxFileSize?: number; // MB
    maxProcessingTime?: number; // minutes
    targetQuality: 'fast' | 'balanced' | 'premium';
  };
  deviceCapabilities?: {
    cpuCores: number;
    memory: number; // GB
    gpu: boolean;
  };
}

export class CompressionEngine {
  private static analyzeContent(video: VideoAnalysis): ContentAnalysis {
    // AI-powered content analysis (simplified heuristics for now)
    const aspectRatio = video.width / video.height;
    const isVertical = aspectRatio < 1;
    const isSquare = Math.abs(aspectRatio - 1) < 0.1;
    const isWidescreen = aspectRatio > 1.7;

    // Estimate motion level based on duration and frame rate
    const motionLevel: ContentAnalysis['motionLevel'] =
      video.frameRate >= 60 ? 'high' :
      video.frameRate >= 30 ? 'medium' : 'low';

    // Estimate complexity based on resolution and bitrate
    const pixelCount = video.width * video.height;
    const complexity: ContentAnalysis['complexity'] =
      pixelCount > 3000000 ? 'complex' : // 4K+
      pixelCount > 1000000 ? 'medium' :   // 1080p+
      'simple';

    // Infer content type from aspect ratio and characteristics
    let contentType: ContentAnalysis['contentType'] = 'general';
    if (isVertical && video.duration < 180) {
      contentType = 'talking'; // Likely social media talking head
    } else if (video.frameRate >= 60) {
      contentType = 'gaming'; // High fps suggests gaming
    } else if (isSquare || isVertical) {
      contentType = 'general'; // Social media content
    }

    return {
      motionLevel,
      complexity,
      contentType,
      hasText: false, // Would need AI analysis
      hasFaces: false, // Would need AI analysis
      stabilityNeeded: motionLevel === 'high',
      noiseLevel: video.bitrate && video.bitrate < 2000 ? 'high' : 'low'
    };
  }

  private static calculateConfidence(
    preset: CompressionPreset,
    request: OptimizationRequest
  ): number {
    let confidence = 85; // Base confidence

    const { videoAnalysis, userPreferences, targetPlatform } = request;

    // Platform match bonus
    if (preset.platform.toLowerCase() === targetPlatform.toLowerCase()) {
      confidence += 10;
    }

    // Resolution compatibility
    const videoRes = videoAnalysis.width * videoAnalysis.height;
    const presetMinRes = preset.constraints.minResolution.width * preset.constraints.minResolution.height;
    const presetMaxRes = preset.constraints.maxResolution.width * preset.constraints.maxResolution.height;

    if (videoRes >= presetMinRes && videoRes <= presetMaxRes) {
      confidence += 5;
    } else if (videoRes < presetMinRes) {
      confidence -= 15; // Significant penalty for upscaling
    }

    // Duration compatibility
    if (videoAnalysis.duration <= preset.constraints.maxDuration) {
      confidence += 5;
    } else {
      confidence -= 20; // Major penalty for exceeding duration limits
    }

    // Quality preference alignment
    const presetQuality =
      preset.encoding.preset === 'slow' || preset.encoding.preset === 'veryslow' ? 'premium' :
      preset.encoding.preset === 'fast' || preset.encoding.preset === 'veryfast' ? 'fast' :
      'balanced';

    if (presetQuality === userPreferences.targetQuality) {
      confidence += 8;
    }

    // Priority alignment
    const optimizationMatch =
      (userPreferences.priority === 'speed' && preset.optimizations.optimizeFor === 'speed') ||
      (userPreferences.priority === 'quality' && preset.optimizations.optimizeFor === 'quality') ||
      (userPreferences.priority === 'size' && preset.optimizations.optimizeFor === 'size') ||
      (userPreferences.priority === 'compatibility' && preset.optimizations.optimizeFor === 'compatibility');

    if (optimizationMatch) {
      confidence += 10;
    }

    // File size constraint
    if (userPreferences.maxFileSize) {
      const estimatedSize = this.estimateFileSize(preset, videoAnalysis);
      if (estimatedSize <= userPreferences.maxFileSize) {
        confidence += 5;
      } else {
        confidence -= Math.min(30, (estimatedSize - userPreferences.maxFileSize) * 2);
      }
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private static estimateFileSize(preset: CompressionPreset, video: VideoAnalysis): number {
    // Simplified file size estimation formula
    const videoBitrate = preset.bitrate.video.target; // kbps
    const audioBitrate = preset.bitrate.audio.target; // kbps
    const totalBitrate = videoBitrate + audioBitrate;

    // Convert to MB: (bitrate in kbps * duration in seconds) / 8 / 1024
    const estimatedSize = (totalBitrate * video.duration) / 8 / 1024;

    // Apply compression efficiency factor based on preset
    const efficiencyFactor =
      preset.bitrate.video.mode === '2-pass' ? 0.85 :
      preset.bitrate.video.mode === 'VBR' ? 0.9 :
      1.0;

    return estimatedSize * efficiencyFactor;
  }

  private static estimateProcessingTime(
    preset: CompressionPreset,
    video: VideoAnalysis,
    deviceCaps?: OptimizationRequest['deviceCapabilities']
  ): number {
    // Base processing speed multiplier based on preset complexity
    const speedMultiplier =
      preset.encoding.preset === 'ultrafast' ? 5.0 :
      preset.encoding.preset === 'veryfast' ? 3.0 :
      preset.encoding.preset === 'fast' ? 2.0 :
      preset.encoding.preset === 'medium' ? 1.0 :
      preset.encoding.preset === 'slow' ? 0.5 :
      preset.encoding.preset === 'veryslow' ? 0.25 :
      1.0;

    // 2-pass encoding takes roughly 2x longer
    const passMultiplier = preset.bitrate.video.mode === '2-pass' ? 2.0 : 1.0;

    // Resolution complexity factor
    const pixelCount = video.width * video.height;
    const resolutionFactor = Math.sqrt(pixelCount / 1000000); // Normalized to 1080p

    // CPU core adjustment
    const coreAdjustment = deviceCaps ? Math.sqrt(deviceCaps.cpuCores / 4) : 1.0;

    // Base time: duration * factors
    const estimatedMinutes =
      video.duration *
      resolutionFactor *
      passMultiplier *
      (1 / speedMultiplier) *
      (1 / coreAdjustment) / 60;

    return Math.max(0.1, estimatedMinutes);
  }

  private static calculateQualityScore(preset: CompressionPreset, video: VideoAnalysis): number {
    let score = 70; // Base quality score

    // Higher CRF means lower quality (inverse relationship)
    const crfScore = Math.max(0, 100 - (preset.encoding.crf * 2.5));
    score += (crfScore - 70) * 0.3;

    // Bitrate quality factor
    const pixelCount = video.width * video.height;
    const bitratePerPixel = preset.bitrate.video.target / pixelCount * 1000;

    if (bitratePerPixel > 0.02) score += 15; // High bitrate per pixel
    else if (bitratePerPixel > 0.01) score += 10;
    else if (bitratePerPixel < 0.005) score -= 10;

    // 2-pass encoding bonus
    if (preset.bitrate.video.mode === '2-pass') score += 10;

    // Advanced encoding features
    if (preset.encoding.bFrames >= 3) score += 5;
    if (preset.encoding.refFrames >= 3) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  public static generateRecommendation(request: OptimizationRequest): CompressionRecommendation {
    const contentAnalysis = request.contentAnalysis || this.analyzeContent(request.videoAnalysis);

    // Get optimal preset using existing logic
    const optimalPreset = getOptimalPreset(
      request.targetPlatform,
      request.userPreferences.targetQuality,
      contentAnalysis.contentType
    );

    if (!optimalPreset) {
      throw new Error(`No compression presets available for platform: ${request.targetPlatform}`);
    }

    // Calculate metrics
    const confidence = this.calculateConfidence(optimalPreset, request);
    const estimatedFileSize = this.estimateFileSize(optimalPreset, request.videoAnalysis);
    const estimatedProcessingTime = this.estimateProcessingTime(
      optimalPreset,
      request.videoAnalysis,
      request.deviceCapabilities
    );
    const qualityScore = this.calculateQualityScore(optimalPreset, request.videoAnalysis);

    // Generate reasoning
    const reasoning: string[] = [];

    reasoning.push(`Selected ${optimalPreset.name} for ${request.targetPlatform} optimization`);

    if (optimalPreset.bitrate.video.mode === '2-pass') {
      reasoning.push('2-pass encoding for maximum quality efficiency');
    }

    if (request.userPreferences.priority === 'quality' && optimalPreset.encoding.crf <= 18) {
      reasoning.push('High quality settings with low compression artifacts');
    }

    if (request.userPreferences.priority === 'speed' && optimalPreset.performance.complexity === 'low') {
      reasoning.push('Fast encoding preset for quick processing');
    }

    if (estimatedFileSize <= (request.userPreferences.maxFileSize || Infinity)) {
      reasoning.push(`Estimated file size (${estimatedFileSize.toFixed(1)}MB) meets constraints`);
    }

    // Platform compatibility score (simplified)
    const platformCompatibility = confidence; // Using confidence as proxy for now

    // Generate alternatives (other presets for same platform)
    const alternatives = getOptimalPreset(request.targetPlatform, 'balanced') ?
      [getOptimalPreset(request.targetPlatform, 'balanced')!].filter(p => p.id !== optimalPreset.id) :
      [];

    return {
      preset: optimalPreset,
      confidence,
      reasoning,
      estimatedFileSize,
      estimatedProcessingTime,
      qualityScore,
      platformCompatibility,
      alternatives
    };
  }

  public static validateConfiguration(
    preset: CompressionPreset,
    video: VideoAnalysis
  ): { isValid: boolean; issues: string[]; warnings: string[] } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check resolution constraints
    if (video.width < preset.constraints.minResolution.width ||
        video.height < preset.constraints.minResolution.height) {
      issues.push(`Video resolution (${video.width}x${video.height}) below minimum (${preset.constraints.minResolution.width}x${preset.constraints.minResolution.height})`);
    }

    if (video.width > preset.constraints.maxResolution.width ||
        video.height > preset.constraints.maxResolution.height) {
      warnings.push(`Video resolution exceeds recommended maximum, will be downscaled`);
    }

    // Check duration
    if (video.duration > preset.constraints.maxDuration) {
      issues.push(`Video duration (${video.duration}s) exceeds platform limit (${preset.constraints.maxDuration}s)`);
    }

    // Check file size estimate
    const estimatedSize = this.estimateFileSize(preset, video);
    if (estimatedSize > preset.constraints.maxFileSize) {
      warnings.push(`Estimated file size (${estimatedSize.toFixed(1)}MB) may exceed platform limit (${preset.constraints.maxFileSize}MB)`);
    }

    // Performance warnings
    if (preset.performance.complexity === 'high') {
      warnings.push('High complexity preset may require significant processing time');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }
}

// Export utility functions
export { getOptimalPreset, getPresetById };