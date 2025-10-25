'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Image,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Palette,
  Type,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  Sun,
  Moon,
  Contrast,
  Droplets,
  Eye,
  Square,
  Circle,
  Triangle,
  Minus,
  Plus,
  Undo,
  Redo,
  Target,
  Filter,
  Scissors,
  Copy,
  Save
} from 'lucide-react';
import { platformSpecs } from '@/data/platformSpecs';

interface PhotoFilter {
  id: string;
  name: string;
  category: 'basic' | 'artistic' | 'vintage' | 'dramatic' | 'social';
  preview: string;
  intensity: number;
  popular?: boolean;
}

interface EditHistory {
  id: string;
  action: string;
  timestamp: number;
  imageData: string;
}

interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  highlights: number;
  shadows: number;
  warmth: number;
  tint: number;
  exposure: number;
  clarity: number;
  dehaze: number;
  vignette: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  rotation: number;
  opacity: number;
}

export default function PhotoEditorWorkspace() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<'adjust' | 'filters' | 'crop' | 'text' | 'resize'>('adjust');
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    highlights: 0,
    shadows: 0,
    warmth: 0,
    tint: 0,
    exposure: 0,
    clarity: 0,
    dehaze: 0,
    vignette: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cropMode, setCropMode] = useState(false);
  const [cropAspectRatio, setCropAspectRatio] = useState<string>('free');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Photo filters for social media
  const photoFilters: PhotoFilter[] = [
    // Basic Filters
    { id: 'none', name: 'Original', category: 'basic', preview: '🔳', intensity: 0 },
    { id: 'brighten', name: 'Brighten', category: 'basic', preview: '☀️', intensity: 50, popular: true },
    { id: 'contrast', name: 'Contrast', category: 'basic', preview: '⚫', intensity: 40 },
    { id: 'saturate', name: 'Vibrant', category: 'basic', preview: '🌈', intensity: 60, popular: true },

    // Social Media Favorites
    { id: 'instagram', name: 'Instagram', category: 'social', preview: '📷', intensity: 45, popular: true },
    { id: 'tiktok', name: 'TikTok', category: 'social', preview: '🎵', intensity: 55, popular: true },
    { id: 'vsco', name: 'VSCO', category: 'social', preview: '✨', intensity: 35 },
    { id: 'influencer', name: 'Influencer', category: 'social', preview: '💎', intensity: 50, popular: true },

    // Vintage Filters
    { id: 'vintage', name: 'Vintage', category: 'vintage', preview: '📽️', intensity: 65 },
    { id: 'retro', name: 'Retro', category: 'vintage', preview: '🕹️', intensity: 55 },
    { id: 'film', name: 'Film', category: 'vintage', preview: '🎞️', intensity: 45 },
    { id: 'sepia', name: 'Sepia', category: 'vintage', preview: '🟤', intensity: 70 },

    // Artistic Filters
    { id: 'dramatic', name: 'Dramatic', category: 'dramatic', preview: '🎭', intensity: 75 },
    { id: 'moody', name: 'Moody', category: 'dramatic', preview: '🌙', intensity: 60 },
    { id: 'noir', name: 'Noir', category: 'dramatic', preview: '⚫', intensity: 80 },
    { id: 'cinematic', name: 'Cinematic', category: 'dramatic', preview: '🎬', intensity: 55 },

    // Artistic
    { id: 'pastel', name: 'Pastel', category: 'artistic', preview: '🌸', intensity: 40 },
    { id: 'dreamy', name: 'Dreamy', category: 'artistic', preview: '☁️', intensity: 35 },
    { id: 'soft', name: 'Soft', category: 'artistic', preview: '🌫️', intensity: 30 },
    { id: 'glow', name: 'Glow', category: 'artistic', preview: '✨', intensity: 45 }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Reset adjustments and add to history
      const newHistory: EditHistory = {
        id: crypto.randomUUID(),
        action: 'Load Image',
        timestamp: Date.now(),
        imageData: url
      };
      setHistory([newHistory]);
      setHistoryIndex(0);
    }
  };

  const addToHistory = (action: string, imageData: string) => {
    const newHistory: EditHistory = {
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
      imageData
    };

    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newHistory);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Apply previous state
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Apply next state
    }
  };

  const applyFilter = (filter: PhotoFilter) => {
    setSelectedFilter(filter);
    setIsProcessing(true);

    // Simulate filter processing
    setTimeout(() => {
      setIsProcessing(false);
      addToHistory(`Apply ${filter.name} Filter`, imageUrl);
    }, 800);
  };

  const updateAdjustment = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      fontWeight: 'bold',
      rotation: 0,
      opacity: 100
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `edited-photo-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      vibrance: 0,
      highlights: 0,
      shadows: 0,
      warmth: 0,
      tint: 0,
      exposure: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0
    });
    setSelectedFilter(null);
    setTextOverlays([]);
  };

  const cropPresets = [
    { id: 'free', name: 'Free', ratio: 'free' },
    { id: 'square', name: 'Square (1:1)', ratio: '1:1' },
    { id: 'instagram', name: 'Instagram Post (1:1)', ratio: '1:1' },
    { id: 'instagram_story', name: 'Instagram Story (9:16)', ratio: '9:16' },
    { id: 'facebook', name: 'Facebook Cover (16:9)', ratio: '16:9' },
    { id: 'twitter', name: 'Twitter Header (3:1)', ratio: '3:1' },
    { id: 'linkedin', name: 'LinkedIn Banner (4:1)', ratio: '4:1' },
    { id: 'youtube', name: 'YouTube Thumbnail (16:9)', ratio: '16:9' },
    { id: 'tiktok', name: 'TikTok (9:16)', ratio: '9:16' }
  ];

  if (!selectedImage) {
    return (
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
          <Image className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-2xl font-semibold mb-2 text-white">Professional Photo Editor</h3>
          <p className="text-gray-400 mb-6">
            Upload a photo to start editing with professional tools and social media optimizations
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-8 py-4 rounded-lg font-medium transition-all text-lg"
          >
            Choose Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Sliders className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <h4 className="font-medium text-white mb-1">Pro Adjustments</h4>
            <p className="text-xs text-gray-400">Brightness, contrast, saturation & more</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Filter className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <h4 className="font-medium text-white mb-1">Social Filters</h4>
            <p className="text-xs text-gray-400">Instagram, TikTok & trending filters</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Type className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h4 className="font-medium text-white mb-1">Text Overlays</h4>
            <p className="text-xs text-gray-400">Custom text with fonts & animations</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <h4 className="font-medium text-white mb-1">Smart Crop</h4>
            <p className="text-xs text-gray-400">Platform-specific aspect ratios</p>
          </div>
        </div>

        {/* Popular Filters Preview */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Popular Filters
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photoFilters.filter(f => f.popular).map((filter) => (
              <div key={filter.id} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-2">{filter.preview}</div>
                <div className="text-sm font-medium text-white">{filter.name}</div>
                <div className="text-xs text-gray-400 capitalize">{filter.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Sidebar - Tools & Settings */}
      <div className="w-80 bg-gray-900/50 rounded-lg p-4 overflow-y-auto">
        {/* Tool Navigation */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setCurrentTool('adjust')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentTool === 'adjust'
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5" />
              <span className="font-medium">Adjustments</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTool('filters')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentTool === 'filters'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTool('crop')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentTool === 'crop'
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Crop className="w-5 h-5" />
              <span className="font-medium">Crop & Resize</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTool('text')}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              currentTool === 'text'
                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5" />
              <span className="font-medium">Text & Graphics</span>
            </div>
          </button>
        </div>

        {/* Tool Content */}
        <div className="space-y-4">
          {/* Adjustments Panel */}
          {currentTool === 'adjust' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Photo Adjustments
              </h3>

              {/* Basic Adjustments */}
              <div className="space-y-3">
                {Object.entries(adjustments).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-400 capitalize">{key}</label>
                      <span className="text-xs text-gray-500">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={value}
                      onChange={(e) => updateAdjustment(key as keyof PhotoAdjustments, parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={resetAdjustments}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Reset All Adjustments
              </button>
            </div>
          )}

          {/* Filters Panel */}
          {currentTool === 'filters' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Photo Filters
              </h3>

              {/* Filter Categories */}
              {['social', 'basic', 'vintage', 'dramatic', 'artistic'].map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 capitalize">{category} Filters</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {photoFilters.filter(f => f.category === category).map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => applyFilter(filter)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          selectedFilter?.id === filter.id
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-gray-800/50 hover:bg-gray-800'
                        }`}
                      >
                        <div className="text-lg mb-1">{filter.preview}</div>
                        <div className="text-xs text-gray-300">{filter.name}</div>
                        {filter.popular && (
                          <div className="text-xs text-yellow-400">⭐</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Crop Panel */}
          {currentTool === 'crop' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Crop className="w-4 h-4" />
                Crop & Resize
              </h3>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Social Media Presets</h4>
                <div className="space-y-1">
                  {cropPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setCropAspectRatio(preset.ratio)}
                      className={`w-full p-2 rounded text-left text-sm transition-all ${
                        cropAspectRatio === preset.ratio
                          ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                          : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCropMode(!cropMode)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  cropMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {cropMode ? 'Apply Crop' : 'Enable Crop Mode'}
              </button>
            </div>
          )}

          {/* Text Panel */}
          {currentTool === 'text' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text & Graphics
              </h3>

              <button
                onClick={addTextOverlay}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Text
              </button>

              {/* Text Overlays */}
              <div className="space-y-2">
                {textOverlays.map((overlay) => (
                  <div key={overlay.id} className="bg-gray-800/50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Text Layer</span>
                      <button
                        onClick={() => removeTextOverlay(overlay.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={overlay.text}
                      onChange={(e) => {
                        setTextOverlays(textOverlays.map(t =>
                          t.id === overlay.id ? { ...t, text: e.target.value } : t
                        ));
                      }}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={overlay.fontSize}
                        onChange={(e) => {
                          setTextOverlays(textOverlays.map(t =>
                            t.id === overlay.id ? { ...t, fontSize: parseInt(e.target.value) } : t
                          ));
                        }}
                        className="col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-gray-900/30 rounded-lg overflow-hidden relative">
        {/* Top Toolbar */}
        <div className="bg-gray-800/50 border-b border-gray-700/50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
            >
              <Redo className="w-4 h-4" />
            </button>
            <div className="text-sm text-gray-400 ml-2">
              {history.length > 0 && `${historyIndex + 1}/${history.length}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAdjustments}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              Reset
            </button>
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Image Canvas */}
        <div className="h-[calc(100%-60px)] flex items-center justify-center p-4 bg-gray-900/20">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-white">Processing...</p>
              </div>
            </div>
          )}

          <div className="relative max-w-full max-h-full">
            <img
              src={imageUrl}
              alt="Editing"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                filter: `
                  brightness(${100 + adjustments.brightness}%)
                  contrast(${100 + adjustments.contrast}%)
                  saturate(${100 + adjustments.saturation}%)
                  sepia(${selectedFilter?.name === 'sepia' ? '100%' : '0%'})
                `
              }}
            />

            {/* Text Overlays */}
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className="absolute text-white font-bold cursor-move"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  fontSize: `${overlay.fontSize}px`,
                  fontFamily: overlay.fontFamily,
                  color: overlay.color,
                  fontWeight: overlay.fontWeight,
                  transform: `rotate(${overlay.rotation}deg)`,
                  opacity: overlay.opacity / 100
                }}
              >
                {overlay.text}
              </div>
            ))}

            {/* Crop Overlay */}
            {cropMode && (
              <div className="absolute inset-0 border-2 border-dashed border-cyan-500 bg-black/20">
                <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                  Crop Mode: {cropAspectRatio}
                </div>
              </div>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}