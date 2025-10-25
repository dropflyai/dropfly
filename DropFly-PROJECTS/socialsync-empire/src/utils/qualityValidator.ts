// Quality Validation System for Pre-Export Verification
// Comprehensive quality checks and platform compliance validation

import { platformSpecs, type PlatformSpec } from '@/data/platformSpecs';
import { compressionPresets, type CompressionPreset } from '@/data/compressionPresets';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: string[];
  platformCompliance: PlatformCompliance[];
}

export interface ValidationIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'resolution' | 'duration' | 'fileSize' | 'bitrate' | 'audio' | 'format' | 'quality';
  message: string;
  fix?: string;
  autoFixable: boolean;
}

export interface ValidationWarning {
  category: 'optimization' | 'compatibility' | 'performance' | 'quality';
  message: string;
  suggestion?: string;
}

export interface PlatformCompliance {
  platform: string;
  isCompliant: boolean;
  compliance: number; // 0-100 percentage
  violations: string[];
  recommendations: string[];
}

export interface VideoQualityMetrics {
  // Basic properties
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  bitrate: number;
  audioBitrate?: number;
  fileSize: number;
  format: string;
  videoCodec: string;
  audioCodec?: string;

  // Quality metrics
  averageQuality?: number; // SSIM or similar metric (0-1)
  noiseLevel?: number; // 0-1
  motionBlur?: number; // 0-1
  colorAccuracy?: number; // 0-1
  audioQuality?: number; // 0-1
  stabilityScore?: number; // 0-1

  // Technical metrics
  keyframeInterval?: number;
  bFrames?: number;
  refFrames?: number;
  colorSpace?: string;
  pixelFormat?: string;
}

export class QualityValidator {

  /**
   * Perform comprehensive quality validation
   */
  static validateVideo(
    metrics: VideoQualityMetrics,
    targetPlatforms: string[] = [],
    compressionSettings?: Partial<CompressionPreset>
  ): ValidationResult {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Basic validation
    const basicValidation = this.validateBasicRequirements(metrics);
    issues.push(...basicValidation.issues);
    warnings.push(...basicValidation.warnings);

    // Quality validation
    const qualityValidation = this.validateQualityMetrics(metrics);
    issues.push(...qualityValidation.issues);
    warnings.push(...qualityValidation.warnings);

    // Platform compliance
    const platformCompliance = targetPlatforms.map(platform =>
      this.validatePlatformCompliance(metrics, platform)
    );

    // Compression settings validation
    if (compressionSettings) {
      const compressionValidation = this.validateCompressionSettings(metrics, compressionSettings);
      issues.push(...compressionValidation.issues);
      warnings.push(...compressionValidation.warnings);
    }

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(metrics, issues, warnings));

    // Calculate overall score
    const score = this.calculateQualityScore(metrics, issues, warnings);

    // Determine if valid (no critical issues)
    const isValid = !issues.some(issue => issue.severity === 'critical');

    return {
      isValid,
      score,
      issues,
      warnings,
      recommendations,
      platformCompliance
    };
  }

  /**
   * Validate basic technical requirements
   */
  private static validateBasicRequirements(metrics: VideoQualityMetrics): {
    issues: ValidationIssue[];
    warnings: ValidationWarning[];
  } {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];

    // Resolution validation
    if (metrics.width < 480 || metrics.height < 480) {
      issues.push({
        severity: 'major',
        category: 'resolution',
        message: `Resolution ${metrics.width}x${metrics.height} is below recommended minimum (480p)`,
        fix: 'Consider upscaling or using higher quality source material',
        autoFixable: false
      });
    }

    if (metrics.width > 7680 || metrics.height > 4320) {
      warnings.push({
        category: 'performance',
        message: 'Very high resolution (8K+) may cause compatibility issues',
        suggestion: 'Consider downscaling to 4K for better compatibility'
      });
    }

    // Duration validation
    if (metrics.duration < 1) {
      issues.push({
        severity: 'critical',
        category: 'duration',
        message: 'Video duration is too short (less than 1 second)',
        autoFixable: false
      });
    }

    if (metrics.duration > 3600) {
      warnings.push({
        category: 'compatibility',
        message: 'Very long video (>1 hour) may not be suitable for all platforms',
        suggestion: 'Consider splitting into shorter segments'
      });
    }

    // Bitrate validation
    const pixelCount = metrics.width * metrics.height;
    const bitratePerPixel = metrics.bitrate / pixelCount;

    if (bitratePerPixel < 0.001) {
      issues.push({
        severity: 'major',
        category: 'bitrate',
        message: 'Bitrate is too low for the resolution, quality will be poor',
        fix: 'Increase bitrate to at least ' + Math.round(pixelCount * 0.002) + ' kbps',
        autoFixable: true
      });
    }

    if (bitratePerPixel > 0.1) {
      warnings.push({
        category: 'optimization',
        message: 'Bitrate is very high, file size may be unnecessarily large',
        suggestion: 'Consider reducing bitrate for better compression efficiency'
      });
    }

    // Frame rate validation
    if (metrics.frameRate < 15) {
      issues.push({
        severity: 'minor',
        category: 'quality',
        message: 'Frame rate is very low, motion may appear choppy',
        fix: 'Increase frame rate to at least 24 fps',
        autoFixable: true
      });
    }

    if (metrics.frameRate > 120) {
      warnings.push({
        category: 'compatibility',
        message: 'Very high frame rate may not be supported on all devices',
        suggestion: 'Consider limiting to 60 fps for better compatibility'
      });
    }

    // Audio validation
    if (metrics.audioBitrate && metrics.audioBitrate < 64) {
      issues.push({
        severity: 'minor',
        category: 'audio',
        message: 'Audio bitrate is very low, audio quality may be poor',
        fix: 'Increase audio bitrate to at least 128 kbps',
        autoFixable: true
      });
    }

    return { issues, warnings };
  }

  /**
   * Validate quality metrics
   */
  private static validateQualityMetrics(metrics: VideoQualityMetrics): {
    issues: ValidationIssue[];
    warnings: ValidationWarning[];
  } {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];

    // Average quality (SSIM or similar)
    if (metrics.averageQuality !== undefined) {
      if (metrics.averageQuality < 0.7) {
        issues.push({
          severity: 'major',
          category: 'quality',
          message: 'Video quality is below acceptable threshold',
          fix: 'Increase bitrate or improve source material quality',
          autoFixable: true
        });
      } else if (metrics.averageQuality < 0.85) {
        warnings.push({
          category: 'quality',
          message: 'Video quality could be improved',
          suggestion: 'Consider increasing bitrate or using better compression settings'
        });
      }
    }

    // Noise level
    if (metrics.noiseLevel !== undefined && metrics.noiseLevel > 0.3) {
      warnings.push({
        category: 'quality',
        message: 'High noise level detected in video',
        suggestion: 'Apply denoising filter to improve visual quality'
      });
    }

    // Motion blur
    if (metrics.motionBlur !== undefined && metrics.motionBlur > 0.4) {
      warnings.push({
        category: 'quality',
        message: 'Significant motion blur detected',
        suggestion: 'Increase frame rate or improve stabilization'
      });
    }

    // Color accuracy
    if (metrics.colorAccuracy !== undefined && metrics.colorAccuracy < 0.8) {
      warnings.push({
        category: 'quality',
        message: 'Color accuracy could be improved',
        suggestion: 'Check color space settings and calibration'
      });
    }

    // Audio quality
    if (metrics.audioQuality !== undefined && metrics.audioQuality < 0.7) {
      issues.push({
        severity: 'minor',
        category: 'audio',
        message: 'Audio quality is below recommended level',
        fix: 'Increase audio bitrate or improve audio processing',
        autoFixable: true
      });
    }

    // Stability
    if (metrics.stabilityScore !== undefined && metrics.stabilityScore < 0.6) {
      warnings.push({
        category: 'quality',
        message: 'Video appears unstable or shaky',
        suggestion: 'Apply video stabilization to improve viewing experience'
      });
    }

    return { issues, warnings };
  }

  /**
   * Validate platform compliance
   */
  static validatePlatformCompliance(
    metrics: VideoQualityMetrics,
    platformId: string
  ): PlatformCompliance {
    const platform = platformSpecs.find(p => p.id === platformId);
    if (!platform) {
      return {
        platform: platformId,
        isCompliant: false,
        compliance: 0,
        violations: ['Platform not found'],
        recommendations: []
      };
    }

    const violations: string[] = [];
    const recommendations: string[] = [];
    let compliance = 100;

    // Check each preset for compatibility
    const compatiblePresets = platform.presets.filter(preset => {
      const aspectRatio = metrics.width / metrics.height;
      const presetAspectRatio = preset.width / preset.height;
      return Math.abs(aspectRatio - presetAspectRatio) < 0.1;
    });

    if (compatiblePresets.length === 0) {
      violations.push(`Aspect ratio ${(metrics.width / metrics.height).toFixed(2)} not supported`);
      compliance -= 30;
      recommendations.push('Crop or resize video to match platform aspect ratios');
    }

    // Duration check
    const maxDuration = Math.max(...platform.presets.map(p => {
      const dur = p.maxDuration.includes('minute') ?
        parseInt(p.maxDuration) * 60 :
        parseInt(p.maxDuration);
      return dur || 60;
    }));

    if (metrics.duration > maxDuration) {
      violations.push(`Duration ${metrics.duration}s exceeds platform limit ${maxDuration}s`);
      compliance -= 25;
      recommendations.push('Trim video to fit platform duration limits');
    }

    // File size check (estimated)
    const estimatedFileSize = (metrics.bitrate * metrics.duration) / 8 / 1024; // MB
    const maxFileSize = Math.max(...platform.presets.map(p => {
      const size = p.maxFileSize.includes('GB') ?
        parseFloat(p.maxFileSize) * 1024 :
        parseFloat(p.maxFileSize);
      return size || 1000;
    }));

    if (estimatedFileSize > maxFileSize) {
      violations.push(`Estimated file size ${estimatedFileSize.toFixed(1)}MB exceeds limit ${maxFileSize}MB`);
      compliance -= 20;
      recommendations.push('Reduce bitrate or duration to meet file size limits');
    }

    // Bitrate recommendations
    const recommendedPreset = platform.presets.find(p => p.isRecommended) || platform.presets[0];
    if (metrics.bitrate < recommendedPreset.bitrate.min) {
      violations.push(`Bitrate ${metrics.bitrate} kbps below platform minimum ${recommendedPreset.bitrate.min} kbps`);
      compliance -= 15;
      recommendations.push(`Increase bitrate to at least ${recommendedPreset.bitrate.min} kbps`);
    }

    if (metrics.bitrate > recommendedPreset.bitrate.max) {
      violations.push(`Bitrate ${metrics.bitrate} kbps exceeds platform maximum ${recommendedPreset.bitrate.max} kbps`);
      compliance -= 10;
      recommendations.push(`Reduce bitrate to maximum ${recommendedPreset.bitrate.max} kbps`);
    }

    return {
      platform: platform.displayName,
      isCompliant: violations.length === 0,
      compliance: Math.max(0, compliance),
      violations,
      recommendations
    };
  }

  /**
   * Validate compression settings
   */
  private static validateCompressionSettings(
    metrics: VideoQualityMetrics,
    settings: Partial<CompressionPreset>
  ): {
    issues: ValidationIssue[];
    warnings: ValidationWarning[];
  } {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];

    // Codec compatibility
    if (settings.videoCodec) {
      const unsupportedCodecs = ['h265', 'vp9', 'av1'];
      if (unsupportedCodecs.includes(settings.videoCodec.toLowerCase()) &&
          metrics.format !== 'mp4') {
        warnings.push({
          category: 'compatibility',
          message: `Codec ${settings.videoCodec} may have limited compatibility`,
          suggestion: 'Consider using H.264 for maximum compatibility'
        });
      }
    }

    // Encoding settings validation
    if (settings.encoding) {
      if (settings.encoding.crf && (settings.encoding.crf < 15 || settings.encoding.crf > 35)) {
        warnings.push({
          category: 'optimization',
          message: `CRF value ${settings.encoding.crf} is outside recommended range (15-35)`,
          suggestion: 'Use CRF between 18-23 for balanced quality/size'
        });
      }

      if (settings.encoding.preset === 'veryslow' && metrics.duration > 300) {
        warnings.push({
          category: 'performance',
          message: 'Very slow encoding preset will take significant time for long videos',
          suggestion: 'Consider using medium or fast preset for faster processing'
        });
      }
    }

    return { issues, warnings };
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    metrics: VideoQualityMetrics,
    issues: ValidationIssue[],
    warnings: ValidationWarning[]
  ): string[] {
    const recommendations: string[] = [];

    // Quality improvements
    if (metrics.averageQuality !== undefined && metrics.averageQuality < 0.85) {
      recommendations.push('💡 Increase bitrate by 20-30% to improve visual quality');
    }

    // Optimization suggestions
    const pixelCount = metrics.width * metrics.height;
    if (pixelCount > 8000000) { // 4K+
      recommendations.push('🎯 Consider encoding in 2-pass mode for better compression at high resolutions');
    }

    // Platform-specific suggestions
    const aspectRatio = metrics.width / metrics.height;
    if (aspectRatio > 1.5 && aspectRatio < 2) {
      recommendations.push('📱 This aspect ratio is perfect for YouTube and desktop platforms');
    } else if (aspectRatio < 1) {
      recommendations.push('📱 Vertical format is ideal for TikTok, Instagram Reels, and YouTube Shorts');
    }

    // Performance optimizations
    if (issues.some(i => i.category === 'fileSize')) {
      recommendations.push('💾 Use variable bitrate (VBR) encoding to reduce file size while maintaining quality');
    }

    // Technical improvements
    if (metrics.noiseLevel && metrics.noiseLevel > 0.3) {
      recommendations.push('🔧 Apply denoise filter to improve visual clarity');
    }

    if (metrics.stabilityScore && metrics.stabilityScore < 0.7) {
      recommendations.push('📹 Video stabilization can significantly improve viewing experience');
    }

    return recommendations;
  }

  /**
   * Calculate overall quality score
   */
  private static calculateQualityScore(
    metrics: VideoQualityMetrics,
    issues: ValidationIssue[],
    warnings: ValidationWarning[]
  ): number {
    let score = 85; // Base score

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    // Deduct points for warnings
    warnings.forEach(warning => {
      score -= 3;
    });

    // Bonus points for quality metrics
    if (metrics.averageQuality !== undefined) {
      score += (metrics.averageQuality - 0.7) * 30; // Bonus for high quality
    }

    if (metrics.stabilityScore !== undefined && metrics.stabilityScore > 0.8) {
      score += 5; // Bonus for stable video
    }

    if (metrics.colorAccuracy !== undefined && metrics.colorAccuracy > 0.9) {
      score += 5; // Bonus for accurate colors
    }

    // Technical excellence bonuses
    const pixelCount = metrics.width * metrics.height;
    const bitratePerPixel = metrics.bitrate / pixelCount;

    if (bitratePerPixel > 0.005 && bitratePerPixel < 0.02) {
      score += 5; // Optimal bitrate range
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Quick validation for export readiness
   */
  static isExportReady(metrics: VideoQualityMetrics, targetPlatforms: string[] = []): {
    ready: boolean;
    blockers: string[];
    score: number;
  } {
    const validation = this.validateVideo(metrics, targetPlatforms);
    const criticalIssues = validation.issues.filter(i => i.severity === 'critical');

    return {
      ready: criticalIssues.length === 0 && validation.score >= 60,
      blockers: criticalIssues.map(i => i.message),
      score: validation.score
    };
  }
}

// Export utility functions
export { QualityValidator };