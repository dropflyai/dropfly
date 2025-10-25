'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Eye, EyeOff, MousePointer } from 'lucide-react';

interface WatermarkRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WatermarkRemoverProps {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onProcess: (regions: WatermarkRegion[], options: ProcessingOptions) => void;
}

interface ProcessingOptions {
  method: 'inpaint' | 'blur' | 'advanced';
  quality: 'medium' | 'high' | 'lossless';
}

export default function WatermarkRemover({ videoUrl, videoRef, onProcess }: WatermarkRemoverProps) {
  const [regions, setRegions] = useState<WatermarkRegion[]>([]);
  const [showRegions, setShowRegions] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    method: 'inpaint',
    quality: 'high'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Draw regions on canvas
  const drawRegions = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showRegions) return;

    // Draw existing regions
    regions.forEach((region, index) => {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 2;
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeRect(region.x, region.y, region.width, region.height);

      // Label
      ctx.fillStyle = '#ef4444';
      ctx.font = '14px Arial';
      ctx.fillText(`Region ${index + 1}`, region.x, region.y - 5);
    });

    // Draw current selection
    if (currentSelection && isSelecting) {
      const { startX, startY, endX, endY } = currentSelection;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    }
  }, [regions, showRegions, currentSelection, isSelecting, videoRef]);

  // Update canvas when video or regions change
  useEffect(() => {
    drawRegions();
  }, [drawRegions]);

  // Handle mouse events for region selection
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    setCurrentSelection({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !currentSelection) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentSelection(prev => prev ? { ...prev, endX: x, endY: y } : null);
  }, [isSelecting, currentSelection]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !currentSelection) return;

    const { startX, startY, endX, endY } = currentSelection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width > 10 && height > 10) {
      const newRegion: WatermarkRegion = {
        id: Date.now().toString(),
        x,
        y,
        width,
        height
      };
      setRegions(prev => [...prev, newRegion]);
    }

    setIsSelecting(false);
    setCurrentSelection(null);
  }, [isSelecting, currentSelection]);

  const removeRegion = (id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  const clearAllRegions = () => {
    setRegions([]);
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <MousePointer size={16} />
          How to Select Watermarks
        </h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Click and drag on the video to select watermark areas</li>
          <li>• Select multiple regions if needed</li>
          <li>• Use the video controls to find the best frame</li>
        </ul>
      </div>

      {/* Region Selection Overlay */}
      <div className="relative">
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowRegions(!showRegions)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
        >
          {showRegions ? <EyeOff size={16} /> : <Eye size={16} />}
          {showRegions ? 'Hide' : 'Show'} Regions
        </button>
        <button
          onClick={clearAllRegions}
          className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition text-sm"
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* Selected Regions List */}
      <div>
        <h4 className="font-medium mb-2">Selected Regions ({regions.length})</h4>
        {regions.length === 0 ? (
          <p className="text-sm text-gray-400">No regions selected</p>
        ) : (
          <div className="space-y-1">
            {regions.map((region, index) => (
              <div key={region.id} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm">
                <span>Region {index + 1}</span>
                <button
                  onClick={() => removeRegion(region.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processing Options */}
      <div className="space-y-3">
        <h4 className="font-medium">Processing Options</h4>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Method</label>
          <select
            value={processingOptions.method}
            onChange={(e) => setProcessingOptions(prev => ({
              ...prev,
              method: e.target.value as ProcessingOptions['method']
            }))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="inpaint">Inpainting (Best)</option>
            <option value="blur">Blur (Fast)</option>
            <option value="advanced">Advanced (Slow)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Quality</label>
          <select
            value={processingOptions.quality}
            onChange={(e) => setProcessingOptions(prev => ({
              ...prev,
              quality: e.target.value as ProcessingOptions['quality']
            }))}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="lossless">Lossless</option>
          </select>
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={() => onProcess(regions, processingOptions)}
        disabled={regions.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition"
      >
        Remove Watermarks
      </button>
    </div>
  );
}