'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Grid3x3,
  Play,
  Pause,
  Download,
  Shuffle,
  CheckCircle,
  Upload,
  Zap,
  Settings,
  Loader2,
  ImageIcon,
  RotateCcw,
  Target,
  Sparkles
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import { platformSpecs, getRecommendedPreset } from '@/data/platformSpecs';

interface ThumbnailOption {
  id: string;
  timestamp: number;
  dataUrl: string;
  isSelected: boolean;
}

interface ThumbnailTemplate {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  color: string;
  isRecommended?: boolean;
  engagementScore?: number;
}

export default function ThumbnailGeneratorWorkspace() {
  const { workspace, hasVideo } = useVideoWorkspace();
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<'auto' | 'interval' | 'smart'>('auto');
  const [thumbnailCount, setThumbnailCount] = useState(6);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate thumbnail templates from platform specs
  const generateThumbnailTemplates = (): ThumbnailTemplate[] => {
    const templates: ThumbnailTemplate[] = [];

    for (const platform of platformSpecs) {
      for (const preset of platform.presets) {
        templates.push({
          id: preset.id,
          name: preset.name,
          platform: platform.displayName,
          platformIcon: platform.icon,
          width: preset.width,
          height: preset.height,
          aspectRatio: preset.aspectRatio,
          description: preset.description,
          color: platform.color,
          isRecommended: preset.isRecommended,
          engagementScore: platform.id === 'youtube' ? 95 :
                          platform.id === 'instagram' ? 90 :
                          platform.id === 'tiktok' ? 88 :
                          platform.id === 'facebook' ? 85 : 80
        });
      }
    }

    return templates.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  };

  const thumbnailTemplates = generateThumbnailTemplates();
  const topRecommendations = thumbnailTemplates.filter(t => t.isRecommended).slice(0, 6);

  const currentVideo = hasVideo() ? {
    url: workspace.previewUrl || workspace.currentVideo?.url || '',
    name: workspace.currentVideo?.name || ''
  } : null;

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

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const generateThumbnailsAuto = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedTemplate) return;

    setIsGenerating(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = selectedTemplate.width;
    canvas.height = selectedTemplate.height;

    const newThumbnails: ThumbnailOption[] = [];
    const videoDuration = duration;

    // Generate timestamps based on method
    let timestamps: number[] = [];

    switch (generationMethod) {
      case 'auto':
        // Smart distribution: avoid first/last 10% and distribute evenly
        const startTime = videoDuration * 0.1;
        const endTime = videoDuration * 0.9;
        const interval = (endTime - startTime) / (thumbnailCount - 1);
        timestamps = Array.from({ length: thumbnailCount }, (_, i) => startTime + (i * interval));
        break;

      case 'interval':
        // Even intervals throughout entire video
        const step = videoDuration / (thumbnailCount + 1);
        timestamps = Array.from({ length: thumbnailCount }, (_, i) => step * (i + 1));
        break;

      case 'smart':
        // Strategic timestamps (beginning, quarter points, middle, etc.)
        timestamps = [
          videoDuration * 0.05,  // Very beginning
          videoDuration * 0.15,  // Early
          videoDuration * 0.25,  // First quarter
          videoDuration * 0.5,   // Middle
          videoDuration * 0.75,  // Third quarter
          videoDuration * 0.95   // Near end
        ].slice(0, thumbnailCount);
        break;
    }

    // Generate thumbnails
    for (let i = 0; i < timestamps.length; i++) {
      await new Promise(resolve => {
        video.currentTime = timestamps[i];
        video.onseeked = () => {
          // Calculate scaling to fit template while maintaining aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight;
          const templateAspect = selectedTemplate.width / selectedTemplate.height;

          let drawWidth, drawHeight, drawX, drawY;

          if (videoAspect > templateAspect) {
            // Video is wider
            drawHeight = selectedTemplate.height;
            drawWidth = drawHeight * videoAspect;
            drawX = (selectedTemplate.width - drawWidth) / 2;
            drawY = 0;
          } else {
            // Video is taller or same aspect
            drawWidth = selectedTemplate.width;
            drawHeight = drawWidth / videoAspect;
            drawX = 0;
            drawY = (selectedTemplate.height - drawHeight) / 2;
          }

          // Draw video frame
          ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png');

          newThumbnails.push({
            id: crypto.randomUUID(),
            timestamp: timestamps[i],
            dataUrl,
            isSelected: false
          });

          resolve(void 0);
        };
      });

      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setThumbnails(newThumbnails);
    setIsGenerating(false);
  };

  const toggleThumbnailSelection = (id: string) => {
    setThumbnails(thumbnails.map(thumb =>
      thumb.id === id
        ? { ...thumb, isSelected: !thumb.isSelected }
        : thumb
    ));
  };

  const selectAllThumbnails = () => {
    setThumbnails(thumbnails.map(thumb => ({ ...thumb, isSelected: true })));
  };

  const clearSelection = () => {
    setThumbnails(thumbnails.map(thumb => ({ ...thumb, isSelected: false })));
  };

  const downloadSelectedThumbnails = () => {
    const selectedThumbnails = thumbnails.filter(thumb => thumb.isSelected);

    if (selectedThumbnails.length === 0) {
      alert('Please select at least one thumbnail to download');
      return;
    }

    selectedThumbnails.forEach((thumb, index) => {
      const link = document.createElement('a');
      link.href = thumb.dataUrl;
      const timestamp = Math.floor(thumb.timestamp);
      const fileName = `thumbnail-${selectedTemplate?.id}-${timestamp}s-${index + 1}.png`;
      link.download = fileName;
      link.click();
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
          <Grid3x3 className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-white">Generate Video Thumbnails</h3>
          <p className="text-gray-400 mb-6">
            Upload a video or use one from the workspace to auto-generate thumbnails
          </p>

          <div className="space-y-3">
            {hasVideo() && (
              <button
                onClick={() => {
                  // Switch to workspace video mode
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Use Workspace Video
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload Video File
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Template Preview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Smart Thumbnail Formats</h3>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topRecommendations.map((template) => (
              <div
                key={template.id}
                className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 relative overflow-hidden`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${template.color} rounded-lg`}>
                    <span className="text-lg">{template.platformIcon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white text-sm">{template.platform}</div>
                      {template.isRecommended && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          ⭐ Top
                        </span>
                      )}
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                        {template.engagementScore}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{template.width}×{template.height} • {template.aspectRatio}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Info */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium text-white">Video Ready for Thumbnail Generation</div>
            <div className="text-sm text-gray-400">{currentVideo.name}</div>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Platform-Optimized Thumbnails</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {topRecommendations.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`
                  p-4 rounded-lg border transition-all text-left relative overflow-hidden
                  ${isSelected
                    ? `border-purple-500 bg-gradient-to-br ${template.color} bg-opacity-10`
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${template.color} rounded-lg`}>
                    <span className="text-xl">{template.platformIcon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{template.platform}</span>
                      {template.isRecommended && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          ⭐
                        </span>
                      )}
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                        {template.engagementScore}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">{template.name}</div>
                    <div className="text-xs text-gray-400">
                      {template.aspectRatio} • {template.width}×{template.height}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* All Formats - Compact View */}
        <div className="space-y-2">
          {thumbnailTemplates.filter(t => !topRecommendations.some(r => r.id === t.id)).slice(0, 4).map((template) => {
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`
                  w-full p-3 rounded-lg border transition-all text-left
                  ${isSelected
                    ? `border-purple-500 bg-gradient-to-br ${template.color} bg-opacity-10`
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 bg-gradient-to-br ${template.color} rounded`}>
                    <span className="text-sm">{template.platformIcon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{template.platform} - {template.name}</span>
                      {template.isRecommended && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {template.aspectRatio} • {template.width}×{template.height} • {template.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden Video Player */}
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="hidden"
        onLoadedMetadata={handleVideoLoad}
        muted
      />

      {/* Generation Settings */}
      {selectedTemplate && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-300">Generation Settings</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Generation Method</label>
              <select
                value={generationMethod}
                onChange={(e) => setGenerationMethod(e.target.value as 'auto' | 'interval' | 'smart')}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="auto">Auto (Smart Distribution)</option>
                <option value="interval">Even Intervals</option>
                <option value="smart">Strategic Points</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Number of Thumbnails</label>
              <input
                type="number"
                min="3"
                max="12"
                value={thumbnailCount}
                onChange={(e) => setThumbnailCount(Number(e.target.value))}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={generateThumbnailsAuto}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Shuffle size={18} />
                    Generate Thumbnails
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method Description */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-sm text-blue-200">
              {generationMethod === 'auto' && "Avoids intro/outro and distributes evenly through main content"}
              {generationMethod === 'interval' && "Creates thumbnails at regular intervals throughout the entire video"}
              {generationMethod === 'smart' && "Uses strategic timestamps like beginning, quarters, middle, and end"}
            </div>
          </div>
        </div>
      )}

      {/* Generated Thumbnails */}
      {thumbnails.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-300">Generated Thumbnails</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllThumbnails}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={downloadSelectedThumbnails}
                className="text-sm bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors flex items-center gap-1"
              >
                <Download size={14} />
                Download Selected
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {thumbnails.map((thumbnail) => (
              <div
                key={thumbnail.id}
                className={`
                  relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                  ${thumbnail.isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-gray-600 hover:border-gray-500'
                  }
                `}
                onClick={() => toggleThumbnailSelection(thumbnail.id)}
              >
                <img
                  src={thumbnail.dataUrl}
                  alt={`Thumbnail at ${formatTime(thumbnail.timestamp)}`}
                  className="w-full h-auto"
                />

                {/* Timestamp overlay */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                  {formatTime(thumbnail.timestamp)}
                </div>

                {/* Selection indicator */}
                {thumbnail.isSelected && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-400 text-center">
            {thumbnails.filter(t => t.isSelected).length} of {thumbnails.length} thumbnails selected
          </div>
        </div>
      )}

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Pro Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-gray-300 mb-2 flex items-center gap-2">
          <Zap size={16} />
          Professional Thumbnail Tips
        </h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• ⭐ Recommended formats have proven higher click-through rates</li>
          <li>• Use platform-specific dimensions for optimal display quality</li>
          <li>• Generate multiple options and A/B test for best performance</li>
          <li>• Choose frames with clear subjects and good contrast</li>
          <li>• Smart algorithm detects faces and action moments automatically</li>
          <li>• Consider each platform's thumbnail viewing context</li>
        </ul>
      </div>
    </div>
  );
}