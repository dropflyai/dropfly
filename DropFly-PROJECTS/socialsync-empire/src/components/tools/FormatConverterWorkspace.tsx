'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileVideo,
  Settings,
  CheckCircle,
  Upload,
  Zap,
  Target,
  Sparkles,
  Brain,
  Gauge,
  Clock,
  HardDrive
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import { platformSpecs, getRecommendedPreset, detectOptimalPreset, type PlatformSpec } from '@/data/platformSpecs';
import { compressionPresets, getPresetsByPlatform, getOptimalPreset, type CompressionPreset } from '@/data/compressionPresets';
import { CompressionEngine, type OptimizationRequest, type CompressionRecommendation } from '@/utils/compressionEngine';
import { MobileCard, MobileButton, MobileSlider } from '../MobileLayout';

export default function FormatConverterWorkspace() {
  const { workspace, hasVideo, addProcessingStep } = useVideoWorkspace();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSpec | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedCompressionPreset, setSelectedCompressionPreset] = useState<CompressionPreset | null>(null);
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'premium'>('balanced');
  const [priority, setPriority] = useState<'speed' | 'quality' | 'size' | 'compatibility'>('quality');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<CompressionRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get intelligent preset recommendations based on current video
  const getIntelligentRecommendations = () => {
    if (!workspace.currentVideo) return [];

    const recommendations = [];
    for (const platform of platformSpecs) {
      const recommendedPreset = getRecommendedPreset(platform.id);
      if (recommendedPreset) {
        recommendations.push({
          platform,
          preset: recommendedPreset,
          score: platform.id === 'instagram' ? 95 : platform.id === 'youtube' ? 90 : 85
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score);
  };

  // Generate AI-powered compression recommendation
  const generateAIRecommendation = async () => {
    if (!workspace.currentVideo || !selectedPlatform) return;

    setIsAnalyzing(true);
    try {
      // Simulate video analysis (in real implementation, this would analyze the actual video)
      const mockVideoAnalysis = {
        width: 1920,
        height: 1080,
        duration: 60,
        frameRate: 30,
        fileSize: 100,
        aspectRatio: 16/9,
        hasAudio: true
      };

      const request: OptimizationRequest = {
        targetPlatform: selectedPlatform.id,
        videoAnalysis: mockVideoAnalysis,
        userPreferences: {
          priority,
          targetQuality: quality,
          maxFileSize: selectedPlatform.id === 'twitter' ? 512 : 4000
        },
        deviceCapabilities: {
          cpuCores: navigator.hardwareConcurrency || 4,
          memory: 8,
          gpu: true
        }
      };

      const recommendation = CompressionEngine.generateRecommendation(request);
      setAiRecommendation(recommendation);
      setSelectedCompressionPreset(recommendation.preset);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-generate recommendation when platform or preferences change
  useEffect(() => {
    if (selectedPlatform && workspace.currentVideo) {
      generateAIRecommendation();
    }
  }, [selectedPlatform, quality, priority]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const { loadVideo } = useVideoWorkspace();

      loadVideo({
        file,
        url,
        name: file.name,
        size: file.size
      });
    }
  };

  const handleApplyConversion = () => {
    if (!selectedPlatform || !selectedCompressionPreset) return;

    const stepId = addProcessingStep({
      type: 'convert',
      name: `AI-Optimized for ${selectedPlatform.displayName}`,
      parameters: {
        platform: selectedPlatform.id,
        compressionPreset: selectedCompressionPreset.id,
        width: selectedPreset?.width || selectedCompressionPreset.constraints.maxResolution.width,
        height: selectedPreset?.height || selectedCompressionPreset.constraints.maxResolution.height,
        videoCodec: selectedCompressionPreset.videoCodec,
        audioCodec: selectedCompressionPreset.audioCodec,
        bitrate: selectedCompressionPreset.bitrate.video.target,
        frameRate: selectedCompressionPreset.frameRate.target,
        quality: quality,
        encodingMethod: selectedCompressionPreset.bitrate.video.mode,
        preset: selectedCompressionPreset.encoding.preset,
        crf: selectedCompressionPreset.encoding.crf
      },
      applied: true
    });

    // Reset selection
    setSelectedPlatform(null);
    setSelectedPreset(null);
    setSelectedCompressionPreset(null);
    setAiRecommendation(null);
  };

  if (!hasVideo()) {
    return (
      <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
        {/* Upload Area */}
        <MobileCard
          className="border-2 border-dashed border-gray-600 text-center"
          padding={isMobile ? 'p-6' : 'p-12'}
        >
          <Upload className={`mx-auto mb-4 text-gray-400 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
          <h3 className={`font-semibold mb-2 text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>No Video in Workspace</h3>
          <p className={`text-gray-400 mb-6 ${isMobile ? 'text-sm' : ''}`}>
            Use the Video Downloader or upload a file to get started
          </p>
          <MobileButton
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            fullWidth={isMobile}
            size={isMobile ? 'lg' : 'md'}
          >
            Upload Video File
          </MobileButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </MobileCard>

        {/* Platform Preview */}
        <div>
          <h3 className={`font-semibold text-white mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Platform Optimization</h3>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {platformSpecs.map((platform) => {
              const recommendedPreset = getRecommendedPreset(platform.id);
              return (
                <MobileCard
                  key={platform.id}
                  className="border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{platform.displayName}</div>
                      <div className="text-sm text-gray-400">
                        {recommendedPreset ? `${recommendedPreset.width}x${recommendedPreset.height}` : 'Multiple formats'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {platform.presets.length} preset{platform.presets.length > 1 ? 's' : ''} available
                      </div>
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
      {/* Video Info */}
      <MobileCard>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium text-white">Video Ready for Conversion</div>
            <div className="text-sm text-gray-400">{workspace.currentVideo?.name}</div>
          </div>
        </div>
      </MobileCard>

      {/* Intelligent Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Intelligent Platform Optimization</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {getIntelligentRecommendations().slice(0, 4).map(({ platform, preset, score }) => (
            <button
              key={platform.id}
              onClick={() => {
                setSelectedPlatform(platform);
                setSelectedPreset(preset);
              }}
              className={`
                p-4 rounded-xl border transition-all text-left relative overflow-hidden active:scale-[0.98]
                ${selectedPlatform?.id === platform.id
                  ? `border-purple-500 bg-gradient-to-br ${platform.color} bg-opacity-10`
                  : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{platform.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{platform.displayName}</span>
                    {preset.isRecommended && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                      {score}% match
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mb-1">{preset.name}</div>
                  <div className="text-xs text-gray-400">
                    {preset.width}×{preset.height} • {preset.aspectRatio} • {preset.videoCodec}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {preset.bitrate.recommended.toLocaleString()} kbps • {preset.frameRate}fps
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* All Platforms */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-400 hover:text-purple-300 mb-4"
        >
          {showAdvanced ? 'Hide' : 'Show'} All Platforms & Presets
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            {platformSpecs.map((platform) => (
              <div key={platform.id} className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xl">{platform.icon}</div>
                  <h4 className="font-medium text-white">{platform.displayName}</h4>
                  <span className="text-xs text-gray-400">
                    {platform.presets.length} preset{platform.presets.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {platform.presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setSelectedPreset(preset);
                      }}
                      className={`
                        p-3 rounded border transition-all text-left text-sm
                        ${selectedPreset?.id === preset.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{preset.name}</span>
                        {preset.isRecommended && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            ★
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {preset.width}×{preset.height} • {preset.aspectRatio}
                      </div>
                      <div className="text-xs text-gray-500">
                        {preset.bitrate.recommended.toLocaleString()} kbps • {preset.encodingMethod}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimization Settings */}
      {selectedPlatform && selectedPreset && (
        <MobileCard className="space-y-4">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Optimization Settings
          </h4>

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quality Level</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as 'fast' | 'balanced' | 'premium')}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="fast">Fast (Quick Processing)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="premium">Premium (Maximum Quality)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'speed' | 'quality' | 'size' | 'compatibility')}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="quality">Best Quality</option>
                <option value="size">Smallest File</option>
                <option value="speed">Fastest Processing</option>
                <option value="compatibility">Maximum Compatibility</option>
              </select>
            </div>
          </div>

          {/* AI Analysis Button */}
          <MobileButton
            onClick={generateAIRecommendation}
            disabled={isAnalyzing || !selectedPlatform}
            variant="primary"
            fullWidth
            size={isMobile ? 'lg' : 'md'}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Video...
              </>
            ) : (
              <>
                <Brain size={16} className="mr-2" />
                Generate AI Recommendation
              </>
            )}
          </MobileButton>

          {/* AI Recommendation Display */}
          {aiRecommendation && selectedCompressionPreset && (
            <div className={`bg-gradient-to-r ${selectedPlatform.color} bg-opacity-10 border border-purple-500/30 rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{selectedPlatform.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-white mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    AI-Optimized: {selectedCompressionPreset.name}
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                      {aiRecommendation.confidence}% confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-gray-400">Resolution</div>
                      <div className="text-white">{selectedCompressionPreset.constraints.maxResolution.width}×{selectedCompressionPreset.constraints.maxResolution.height}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Bitrate</div>
                      <div className="text-white">{selectedCompressionPreset.bitrate.video.target.toLocaleString()} kbps</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Quality Score</div>
                      <div className="text-white flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        {aiRecommendation.qualityScore}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Est. Processing</div>
                      <div className="text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {aiRecommendation.estimatedProcessingTime.toFixed(1)}min
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Est. File Size</div>
                      <div className="text-white flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {aiRecommendation.estimatedFileSize.toFixed(1)}MB
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Encoding</div>
                      <div className="text-white">{selectedCompressionPreset.bitrate.video.mode}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-2">
                    {selectedCompressionPreset.description}
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                    <div className="text-xs font-medium text-blue-300 mb-1">AI Analysis:</div>
                    <ul className="text-xs text-blue-200 space-y-0.5">
                      {aiRecommendation.reasoning.slice(0, 3).map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback: Basic Configuration */}
          {selectedPreset && !aiRecommendation && (
            <div className={`bg-gradient-to-r ${selectedPlatform.color} bg-opacity-10 border border-purple-500/30 rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{selectedPlatform.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-white mb-2 flex items-center gap-2">
                    {selectedPlatform.displayName} - {selectedPreset.name}
                    {selectedPreset.isRecommended && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Resolution</div>
                      <div className="text-white">{selectedPreset.width}×{selectedPreset.height}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Aspect Ratio</div>
                      <div className="text-white">{selectedPreset.aspectRatio}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Bitrate</div>
                      <div className="text-white">{selectedPreset.bitrate.recommended.toLocaleString()} kbps</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Frame Rate</div>
                      <div className="text-white">{selectedPreset.frameRate} fps</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Codec</div>
                      <div className="text-white">{selectedPreset.videoCodec} / {selectedPreset.audioCodec}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Encoding</div>
                      <div className="text-white">{selectedPreset.encodingMethod}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    {selectedPreset.description}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Max file size: {selectedPreset.maxFileSize} • Max duration: {selectedPreset.maxDuration}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Tips */}
          {selectedPlatform.optimizations && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-sm">
                <div className="font-medium text-blue-300 mb-2">Platform Optimization Tips</div>
                <ul className="space-y-1 text-blue-200 text-xs">
                  {selectedPlatform.optimizations.compressionTips.slice(0, 2).map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Apply Button */}
          <MobileButton
            onClick={handleApplyConversion}
            disabled={!selectedCompressionPreset && !selectedPreset}
            variant="primary"
            fullWidth
            size={isMobile ? 'lg' : 'md'}
            className={`bg-gradient-to-r ${selectedPlatform.color} hover:opacity-90 disabled:from-gray-600 disabled:to-gray-700`}
          >
            <FileVideo size={18} className="mr-2" />
            {aiRecommendation ? 'Apply AI-Optimized Settings' : `Optimize for ${selectedPlatform.displayName}`}
          </MobileButton>
        </MobileCard>
      )}

      {/* Pro Tips */}
      <MobileCard className="bg-gray-800/30">
        <h4 className="font-medium text-sm text-gray-300 mb-3 flex items-center gap-2">
          <Zap size={16} />
          💡 Professional Optimization Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Each platform has unique algorithms - use platform-specific presets for best results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>Upload at recommended resolution to avoid platform re-compression</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>2-pass encoding provides better quality at the same file size</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-bold">•</span>
            <span>Vertical formats (9:16, 4:5) get higher engagement on mobile platforms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 font-bold">•</span>
            <span>Always test uploads during off-peak hours for better processing quality</span>
          </li>
        </ul>
      </MobileCard>
    </div>
  );
}