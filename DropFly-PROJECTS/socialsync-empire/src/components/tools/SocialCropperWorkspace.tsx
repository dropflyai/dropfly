'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Square,
  Crop,
  CheckCircle,
  Upload,
  Zap,
  Target,
  Sparkles,
  Grid3x3
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import { platformSpecs, getRecommendedPreset, detectOptimalPreset } from '@/data/platformSpecs';
import { MobileCard, MobileButton, MobileSlider } from '../MobileLayout';

interface CropPreset {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isRecommended?: boolean;
  engagementScore?: number;
}

export default function SocialCropperWorkspace() {
  const { workspace, hasVideo, addProcessingStep } = useVideoWorkspace();
  const [selectedPreset, setSelectedPreset] = useState<CropPreset | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [showAllFormats, setShowAllFormats] = useState(false);
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

  // Generate comprehensive crop presets from platform specs
  const generateCropPresets = (): CropPreset[] => {
    const presets: CropPreset[] = [];

    for (const platform of platformSpecs) {
      for (const preset of platform.presets) {
        presets.push({
          id: preset.id,
          name: preset.name,
          platform: platform.displayName,
          platformIcon: platform.icon,
          ratio: preset.aspectRatio,
          width: preset.width,
          height: preset.height,
          description: preset.description,
          icon: preset.aspectRatio === '9:16' ? Smartphone :
                preset.aspectRatio === '1:1' ? Square :
                preset.aspectRatio === '4:5' ? Grid3x3 : Monitor,
          color: platform.color,
          isRecommended: preset.isRecommended,
          engagementScore: platform.id === 'instagram' ? 95 :
                          platform.id === 'tiktok' ? 90 :
                          platform.id === 'youtube' ? 85 :
                          platform.id === 'facebook' ? 80 : 75
        });
      }
    }

    return presets.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  };

  const cropPresets = generateCropPresets();
  const topRecommendations = cropPresets.filter(p => p.isRecommended).slice(0, 6);

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

  const handleApplyCrop = () => {
    if (!selectedPreset) return;

    const stepId = addProcessingStep({
      type: 'crop',
      name: `Crop for ${selectedPreset.platform} - ${selectedPreset.name}`,
      parameters: {
        platform: selectedPreset.platform,
        preset: selectedPreset.id,
        width: selectedPreset.width,
        height: selectedPreset.height,
        x: cropPosition.x,
        y: cropPosition.y,
        aspectRatio: selectedPreset.ratio
      },
      applied: true
    });

    // Reset selection
    setSelectedPreset(null);
    setCropPosition({ x: 0, y: 0 });
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
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Smart Crop Recommendations</h3>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>

          <div className={`grid gap-3 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {topRecommendations.map((preset) => {
              const Icon = preset.icon;
              return (
                <MobileCard
                  key={preset.id}
                  className="border border-gray-700 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${preset.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{preset.platformIcon}</span>
                        <div>
                          <div className="font-medium text-white text-sm">{preset.platform}</div>
                          <div className="text-xs text-gray-400">{preset.ratio} • {preset.width}×{preset.height}</div>
                        </div>
                      </div>
                      {preset.isRecommended && (
                        <span className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          ⭐ Top Pick
                        </span>
                      )}
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>

          <button
            onClick={() => setShowAllFormats(!showAllFormats)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {showAllFormats ? 'Hide' : 'Show'} All Platform Formats ({cropPresets.length} total)
          </button>
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
            <div className="font-medium text-white">Video Ready for Cropping</div>
            <div className="text-sm text-gray-400">{workspace.currentVideo?.name}</div>
          </div>
        </div>
      </MobileCard>

      {/* Smart Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Intelligent Crop Selection</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        {/* Top Recommendations */}
        <div className={`grid gap-3 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {topRecommendations.slice(0, 4).map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset?.id === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`
                  p-4 rounded-xl border transition-all text-left relative overflow-hidden active:scale-[0.98]
                  ${isSelected
                    ? `border-purple-500 bg-gradient-to-br ${preset.color} bg-opacity-10`
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${preset.color} rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-lg">{preset.platformIcon}</span>
                      <span className="font-medium text-white text-sm">{preset.platform}</span>
                      {preset.isRecommended && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          ⭐
                        </span>
                      )}
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                        {preset.engagementScore}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">{preset.name}</div>
                    <div className="text-xs text-gray-400">
                      {preset.ratio} • {preset.width}×{preset.height}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* All Formats */}
        {showAllFormats && (
          <div className="space-y-4">
            {platformSpecs.map((platform) => (
              <div key={platform.id} className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{platform.icon}</span>
                  <h4 className="font-medium text-white">{platform.displayName}</h4>
                  <span className="text-xs text-gray-400">
                    {platform.presets.length} format{platform.presets.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {platform.presets.map((platformPreset) => {
                    const preset = cropPresets.find(p => p.id === platformPreset.id);
                    if (!preset) return null;

                    const Icon = preset.icon;
                    const isSelected = selectedPreset?.id === preset.id;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset)}
                        className={`
                          p-3 rounded border transition-all text-left text-sm
                          ${isSelected
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-300" />
                          <span className="font-medium text-white">{preset.name}</span>
                          {preset.isRecommended && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                              ⭐
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {preset.ratio} • {preset.width}×{preset.height}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop Controls */}
      {selectedPreset && (
        <MobileCard className="space-y-4">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-purple-400" />
            <h4 className="font-medium text-gray-300">Smart Crop Preview</h4>
          </div>

          {/* Selected Format Info */}
          <div className={`bg-gradient-to-r ${selectedPreset.color} bg-opacity-10 border border-purple-500/30 rounded-lg p-3`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPreset.platformIcon}</span>
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  {selectedPreset.platform} - {selectedPreset.name}
                  {selectedPreset.isRecommended && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-300">
                  {selectedPreset.ratio} • {selectedPreset.width}×{selectedPreset.height}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {selectedPreset.description}
                </div>
              </div>
            </div>
          </div>

          {/* Crop Preview */}
          <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
            <video
              src={workspace.previewUrl || workspace.currentVideo?.url}
              className="w-full h-full object-contain"
              muted
            />

            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-purple-500 bg-purple-500/10"
              style={{
                left: `${cropPosition.x}%`,
                top: `${cropPosition.y}%`,
                width: `${Math.min((selectedPreset.width / 1920) * 100, 80)}%`,
                height: `${Math.min((selectedPreset.height / 1080) * 100, 80)}%`,
              }}
            >
              <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <span>{selectedPreset.platformIcon}</span>
                <span>{selectedPreset.platform}</span>
              </div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-4">
            <MobileSlider
              label="Horizontal Position"
              value={cropPosition.x}
              onChange={(value) => setCropPosition({ ...cropPosition, x: value })}
              min={0}
              max={50}
              step={1}
              showValue
            />
            <MobileSlider
              label="Vertical Position"
              value={cropPosition.y}
              onChange={(value) => setCropPosition({ ...cropPosition, y: value })}
              min={0}
              max={50}
              step={1}
              showValue
            />
          </div>

          {/* Apply Button */}
          <MobileButton
            onClick={handleApplyCrop}
            variant="primary"
            fullWidth
            size={isMobile ? 'lg' : 'md'}
            className={`bg-gradient-to-r ${selectedPreset.color} hover:opacity-90`}
          >
            <Crop size={18} className="mr-2" />
            Crop for {selectedPreset.platform}
          </MobileButton>
        </MobileCard>
      )}

      {/* Pro Tips */}
      <MobileCard className="bg-gray-800/30">
        <h4 className="font-medium text-sm text-gray-300 mb-3 flex items-center gap-2">
          <Zap size={16} />
          💡 Smart Cropping Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">⭐</span>
            <span>Recommended formats have higher engagement rates for each platform</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">📱</span>
            <span>Vertical formats (9:16, 4:5) perform best on mobile-first platforms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">🎯</span>
            <span>Apply multiple crops to create optimized content for different platforms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-bold">🎨</span>
            <span>Position important content in the center for better mobile viewing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 font-bold">📊</span>
            <span>Use engagement scores to prioritize which formats to create first</span>
          </li>
        </ul>
      </MobileCard>
    </div>
  );
}