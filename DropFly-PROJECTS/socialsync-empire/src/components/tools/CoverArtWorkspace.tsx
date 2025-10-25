'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Image,
  Play,
  Pause,
  RotateCcw,
  Download,
  Palette,
  Type,
  CheckCircle,
  Upload,
  Zap,
  Settings,
  Square,
  Target,
  Sparkles
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import { platformSpecs, getRecommendedPreset } from '@/data/platformSpecs';

interface CoverTemplate {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
  width: number;
  height: number;
  description: string;
  aspectRatio: string;
  color: string;
  isRecommended?: boolean;
  engagementScore?: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
}

export default function CoverArtWorkspace() {
  const { workspace, hasVideo, addProcessingStep } = useVideoWorkspace();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate cover templates from platform specs
  const generateCoverTemplates = (): CoverTemplate[] => {
    const templates: CoverTemplate[] = [];

    for (const platform of platformSpecs) {
      for (const preset of platform.presets) {
        templates.push({
          id: preset.id,
          name: preset.name,
          platform: platform.displayName,
          platformIcon: platform.icon,
          width: preset.width,
          height: preset.height,
          description: preset.description,
          aspectRatio: preset.aspectRatio,
          color: platform.color,
          isRecommended: preset.isRecommended,
          engagementScore: platform.id === 'instagram' ? 95 :
                          platform.id === 'youtube' ? 90 :
                          platform.id === 'tiktok' ? 88 :
                          platform.id === 'facebook' ? 85 : 80
        });
      }
    }

    return templates.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  };

  const coverTemplates = generateCoverTemplates();
  const topRecommendations = coverTemplates.filter(t => t.isRecommended).slice(0, 6);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedTemplate) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to template size
    canvas.width = selectedTemplate.width;
    canvas.height = selectedTemplate.height;

    // Calculate video scaling to fit template while maintaining aspect ratio
    const videoAspect = video.videoWidth / video.videoHeight;
    const templateAspect = selectedTemplate.width / selectedTemplate.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (videoAspect > templateAspect) {
      // Video is wider than template
      drawHeight = selectedTemplate.height;
      drawWidth = drawHeight * videoAspect;
      drawX = (selectedTemplate.width - drawWidth) / 2;
      drawY = 0;
    } else {
      // Video is taller than template or same aspect
      drawWidth = selectedTemplate.width;
      drawHeight = drawWidth / videoAspect;
      drawX = 0;
      drawY = (selectedTemplate.height - drawHeight) / 2;
    }

    // Draw video frame
    ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

    // Add text overlays
    textOverlays.forEach(overlay => {
      ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const x = (overlay.x / 100) * selectedTemplate.width;
      const y = (overlay.y / 100) * selectedTemplate.height;

      ctx.fillText(overlay.text, x, y);
    });

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    setSelectedFrame(dataUrl);
    setIsCapturing(false);
  };

  const downloadCoverArt = () => {
    if (!selectedFrame || !selectedTemplate) return;

    const link = document.createElement('a');
    link.href = selectedFrame;
    link.download = `cover-art-${selectedTemplate.id}-${Date.now()}.png`;
    link.click();
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: 'Your Text Here',
      x: 20,
      y: 20,
      fontSize: 48,
      color: '#ffffff',
      fontWeight: 'bold',
      fontFamily: 'Arial'
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
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
          <Image className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-white">Create Cover Art from Video</h3>
          <p className="text-gray-400 mb-6">
            Upload a video or use one from the workspace to create custom cover art
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
            <Target className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Smart Cover Art Formats</h3>
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
            <div className="font-medium text-white">Video Ready for Cover Art Creation</div>
            <div className="text-sm text-gray-400">{currentVideo.name}</div>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Platform-Optimized Cover Art</h3>
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

        {/* All Templates - Collapsible */}
        <div className="space-y-3">
          {coverTemplates.filter(t => !topRecommendations.some(r => r.id === t.id)).slice(0, 6).map((template) => {
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
                  <div className={`p-2 bg-gradient-to-br ${template.color} rounded-lg`}>
                    <span className="text-lg">{template.platformIcon}</span>
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

      {/* Video Player & Frame Capture */}
      {selectedTemplate && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-300">Frame Selection</h4>

          <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="w-full h-full object-contain"
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <span className="text-sm text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <button
                  onClick={captureFrame}
                  disabled={isCapturing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Image size={16} />
                  {isCapturing ? 'Capturing...' : 'Capture Frame'}
                </button>
              </div>

              {/* Timeline */}
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Text Overlays */}
      {selectedTemplate && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-300">Text Overlays</h4>
            <button
              onClick={addTextOverlay}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Type size={16} />
              Add Text
            </button>
          </div>

          {textOverlays.map((overlay) => (
            <div key={overlay.id} className="bg-gray-700 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Text Layer</span>
                <button
                  onClick={() => removeTextOverlay(overlay.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Text</label>
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                    className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                  <input
                    type="number"
                    value={overlay.fontSize}
                    onChange={(e) => updateTextOverlay(overlay.id, { fontSize: Number(e.target.value) })}
                    className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
                    min="12"
                    max="200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={overlay.color}
                    onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                    className="w-full bg-gray-600 rounded px-2 py-1 h-8"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
                  <select
                    value={overlay.fontWeight}
                    onChange={(e) => updateTextOverlay(overlay.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
                    className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Position X (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlay.x}
                    onChange={(e) => updateTextOverlay(overlay.id, { x: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{overlay.x}%</span>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Position Y (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlay.y}
                    onChange={(e) => updateTextOverlay(overlay.id, { y: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{overlay.y}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview & Download */}
      {selectedFrame && selectedTemplate && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-300">Cover Art Preview</h4>

          <div className="bg-black rounded-lg p-4">
            <img
              src={selectedFrame}
              alt="Cover art preview"
              className="max-w-full h-auto rounded-lg mx-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>

          <button
            onClick={downloadCoverArt}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Cover Art ({selectedTemplate.width}×{selectedTemplate.height})
          </button>
        </div>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Pro Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-gray-300 mb-2 flex items-center gap-2">
          <Zap size={16} />
          Professional Cover Art Tips
        </h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• ⭐ Recommended formats have proven higher engagement rates</li>
          <li>• Use platform-specific dimensions to avoid automatic cropping</li>
          <li>• Choose high-contrast frames with clear focal points</li>
          <li>• Keep text bold and readable at thumbnail sizes</li>
          <li>• Consider each platform's viewing context and audience</li>
          <li>• Use engagement scores to prioritize which covers to create first</li>
        </ul>
      </div>
    </div>
  );
}