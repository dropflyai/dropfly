'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Paintbrush,
  CheckCircle,
  Loader2,
  Square,
  Trash2,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import { MobileCard, MobileButton, MobileSlider, MobileInput } from '../MobileLayout';

interface WatermarkRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessingOptions {
  method: 'blur' | 'pixelate' | 'fill';
  quality: 'high' | 'medium' | 'low';
  intensity: number;
}

export default function WatermarkRemoverWorkspace() {
  const { workspace, hasVideo, addProcessingStep, loadVideo } = useVideoWorkspace();
  const [localVideo, setLocalVideo] = useState<{ file: File; url: string } | null>(null);
  const [watermarkRegions, setWatermarkRegions] = useState<WatermarkRegion[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Partial<WatermarkRegion> | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    method: 'blur',
    quality: 'medium',
    intensity: 10
  });
  const [dragOver, setDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use workspace video if available, otherwise use local video
  const currentVideo = hasVideo() ? {
    url: workspace.previewUrl || workspace.currentVideo?.url || '',
    name: workspace.currentVideo?.name || ''
  } : localVideo ? {
    url: localVideo.url,
    name: localVideo.file.name
  } : null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      loadLocalVideo(videoFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      loadLocalVideo(file);
    }
  };

  const loadLocalVideo = (file: File) => {
    const url = URL.createObjectURL(file);

    if (!hasVideo()) {
      // If no workspace video, use as local video
      setLocalVideo({ file, url });
    } else {
      // If workspace video exists, ask user what to do
      if (confirm('Replace workspace video with uploaded file?')) {
        loadVideo({
          file,
          url,
          name: file.name,
          size: file.size
        });
        setLocalVideo(null);
      }
    }

    // Clear existing watermark regions
    setWatermarkRegions([]);
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

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setCurrentRegion({
      id: crypto.randomUUID(),
      x,
      y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentRegion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentRegion({
      ...currentRegion,
      width: Math.abs(currentX - (currentRegion.x || 0)),
      height: Math.abs(currentY - (currentRegion.y || 0)),
      x: Math.min(currentX, currentRegion.x || 0),
      y: Math.min(currentY, currentRegion.y || 0)
    });
  };

  const handleMouseUp = () => {
    if (currentRegion && currentRegion.width && currentRegion.height) {
      setWatermarkRegions(prev => [...prev, currentRegion as WatermarkRegion]);
    }
    setIsDrawing(false);
    setCurrentRegion(null);
  };

  const removeRegion = (id: string) => {
    setWatermarkRegions(prev => prev.filter(region => region.id !== id));
  };

  const handleApplyWatermarkRemoval = () => {
    if (watermarkRegions.length === 0) {
      alert('Please select watermark regions first');
      return;
    }

    const stepId = addProcessingStep({
      type: 'watermark',
      name: `Remove ${watermarkRegions.length} watermark${watermarkRegions.length > 1 ? 's' : ''} (${processingOptions.method})`,
      parameters: {
        regions: watermarkRegions,
        options: processingOptions
      },
      applied: true
    });

    // Clear regions after applying
    setWatermarkRegions([]);
  };

  if (!currentVideo) {
    return (
      <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
        {/* Upload Area */}
        <MobileCard
          className={`
            border-2 border-dashed text-center transition-colors
            ${dragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
            }
          `}
          padding={isMobile ? 'p-6' : 'p-12'}
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleDrop}
          >
            <Paintbrush className={`mx-auto mb-4 text-gray-400 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`} />
            <h3 className={`font-semibold mb-2 text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>Upload Video for Watermark Removal</h3>
            <p className={`text-gray-400 mb-6 ${isMobile ? 'text-sm' : ''}`}>
              {hasVideo()
                ? 'Use workspace video or upload a different one'
                : 'Drag and drop your video file here, or click to browse'
              }
            </p>

            <div className="space-y-3">
              {hasVideo() && (
                <MobileButton
                  onClick={() => {
                    // Switch to workspace video mode
                    setLocalVideo(null);
                  }}
                  variant="primary"
                  fullWidth
                  size={isMobile ? 'lg' : 'md'}
                >
                  Use Workspace Video
                </MobileButton>
              )}

              <MobileButton
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                fullWidth={isMobile}
                size={isMobile ? 'lg' : 'md'}
              >
                Upload Different Video
              </MobileButton>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </MobileCard>

        {/* Info */}
        <MobileCard>
          <h4 className="font-medium text-sm text-gray-300 mb-3 flex items-center gap-2">
            <Zap size={16} />
            Watermark Removal Tips
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Draw rectangles around watermarks you want to remove</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span>Use blur method for semi-transparent watermarks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Use fill method for solid color watermarks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">•</span>
              <span>Higher quality settings take longer but produce better results</span>
            </li>
          </ul>
        </MobileCard>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
      {/* Video Info */}
      {hasVideo() && (
        <MobileCard>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-medium text-white">Using Workspace Video</div>
              <div className="text-sm text-gray-400">{currentVideo.name}</div>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Video Player with Watermark Selection */}
      <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <video
            ref={videoRef}
            src={currentVideo.url}
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Existing Watermark Regions */}
          {watermarkRegions.map((region) => (
            <div
              key={region.id}
              className="absolute border-2 border-red-500 bg-red-500/20"
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
            >
              <button
                onClick={() => removeRegion(region.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Current Drawing Region */}
          {currentRegion && currentRegion.width && currentRegion.height && (
            <div
              className="absolute border-2 border-dashed border-red-400 bg-red-400/10"
              style={{
                left: `${currentRegion.x}%`,
                top: `${currentRegion.y}%`,
                width: `${currentRegion.width}%`,
                height: `${currentRegion.height}%`,
              }}
            />
          )}
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={resetVideo}
                className="bg-gray-600 hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            <div className="text-sm text-gray-300">
              Draw rectangles around watermarks
            </div>
          </div>
        </div>
      </div>

      {/* Watermark Regions List */}
      {watermarkRegions.length > 0 && (
        <MobileCard>
          <h4 className="font-medium text-gray-300 mb-3">
            Selected Watermarks ({watermarkRegions.length})
          </h4>
          <div className="space-y-2">
            {watermarkRegions.map((region, index) => (
              <div
                key={region.id}
                className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg"
              >
                <span className="text-sm text-gray-300">
                  Region {index + 1} ({Math.round(region.width)}% × {Math.round(region.height)}%)
                </span>
                <button
                  onClick={() => removeRegion(region.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </MobileCard>
      )}

      {/* Processing Options */}
      <MobileCard>
        <h4 className="font-medium text-gray-300 mb-4">Removal Options</h4>

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Method</label>
            <select
              value={processingOptions.method}
              onChange={(e) => setProcessingOptions({
                ...processingOptions,
                method: e.target.value as 'blur' | 'pixelate' | 'fill'
              })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
            >
              <option value="blur">Blur</option>
              <option value="pixelate">Pixelate</option>
              <option value="fill">Color Fill</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Quality</label>
            <select
              value={processingOptions.quality}
              onChange={(e) => setProcessingOptions({
                ...processingOptions,
                quality: e.target.value as 'high' | 'medium' | 'low'
              })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
            >
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Fast Processing</option>
            </select>
          </div>

          <div>
            <MobileSlider
              label="Intensity"
              value={processingOptions.intensity}
              onChange={(value) => setProcessingOptions({
                ...processingOptions,
                intensity: value
              })}
              min={1}
              max={20}
              step={1}
              showValue
            />
          </div>
        </div>
      </MobileCard>

      {/* Action Buttons */}
      <div className="space-y-3">
        <MobileButton
          onClick={handleApplyWatermarkRemoval}
          disabled={watermarkRegions.length === 0}
          variant="primary"
          fullWidth
          size={isMobile ? 'lg' : 'md'}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700"
        >
          <Paintbrush size={18} className="mr-2" />
          Remove {watermarkRegions.length} Watermark{watermarkRegions.length !== 1 ? 's' : ''}
        </MobileButton>

        {!hasVideo() && localVideo && (
          <MobileButton
            onClick={() => setLocalVideo(null)}
            variant="secondary"
            fullWidth
            size={isMobile ? 'lg' : 'md'}
          >
            Clear Video
          </MobileButton>
        )}
      </div>

      {/* Instructions */}
      <MobileCard className="bg-gray-800/30">
        <h4 className="font-medium text-sm text-gray-300 mb-3">💡 Instructions</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Click and drag to draw rectangles around watermarks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">2.</span>
            <span>Adjust removal method and quality settings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">3.</span>
            <span>Click "Remove Watermarks" to add to processing pipeline</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-bold">4.</span>
            <span>Use Preview in workspace to see results before final export</span>
          </li>
        </ul>
      </MobileCard>
    </div>
  );
}