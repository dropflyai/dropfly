'use client';

import { useState, useMemo } from 'react';
import { Play, Sparkles, ChevronDown, Zap, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoEngine {
  id: string;
  name: string;
  description: string;
  icon: string;
  speed: string;
  quality: string;
  pricePerSecond: number; // Actual API cost per second
}

const VIDEO_ENGINES: VideoEngine[] = [
  {
    id: 'hailuo-02',
    name: 'Minimax Hailuo 02',
    description: 'High-dynamic, VFX-ready, fastest and most affordable',
    icon: '🚀',
    speed: 'Ultra Fast',
    quality: 'High',
    pricePerSecond: 0.028,
  },
  {
    id: 'runway-gen4-turbo',
    name: 'Runway Gen-4 Turbo',
    description: 'Fastest high-dynamic video',
    icon: '⚡',
    speed: 'Fast',
    quality: 'Very High',
    pricePerSecond: 0.05,
  },
  {
    id: 'kling-2.1',
    name: 'Kling 2.1',
    description: 'Motion-rich with advanced video control',
    icon: '🎭',
    speed: 'Fast',
    quality: 'High',
    pricePerSecond: 0.10,
  },
  {
    id: 'runway-gen4-aleph',
    name: 'Runway Gen-4 Aleph',
    description: 'Highest fidelity, professional grade',
    icon: '🎬',
    speed: 'Standard',
    quality: 'Ultra High',
    pricePerSecond: 0.15,
  },
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    description: 'Precision video with sound',
    icon: '🎨',
    speed: 'Medium',
    quality: 'Very High',
    pricePerSecond: 0.12,
  },
  {
    id: 'luma-ray-2',
    name: 'Luma Dream Machine',
    description: 'Cinematic quality with realistic motion',
    icon: '✨',
    speed: 'Medium',
    quality: 'Very High',
    pricePerSecond: 0.08,
  },
  {
    id: 'sora-2',
    name: 'OpenAI Sora 2',
    description: 'Photorealistic quality with synchronized dialogue',
    icon: '🤖',
    speed: 'Standard',
    quality: 'Ultra High',
    pricePerSecond: 0.30,
  },
  {
    id: 'sora-2-pro',
    name: 'OpenAI Sora 2 Pro',
    description: 'Best quality, HD 1080p, advanced controls',
    icon: '💎',
    speed: 'Standard',
    quality: 'Maximum',
    pricePerSecond: 0.50,
  },
];

// Calculate token cost with 70% profit over cost (70% markup)
// Formula: (pricePerSecond * duration * 100) * 1.70
// 1 token = $0.01, so multiply by 100 to convert dollars to tokens
// Then multiply by 1.70 to add 70% profit (Price = Cost × 1.70)
function calculateTokenCost(pricePerSecond: number, duration: number): number {
  const dollarCost = pricePerSecond * duration;
  const tokens = Math.ceil(dollarCost * 100);
  const PROFIT_MARGIN_MULTIPLIER = 1.70; // 70% profit over cost
  return Math.ceil(tokens * PROFIT_MARGIN_MULTIPLIER);
}

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<VideoEngine>(VIDEO_ENGINES[0]);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [duration, setDuration] = useState(6);
  const [resolution, setResolution] = useState('1080p');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [generating, setGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Calculate token cost dynamically based on selected engine and duration
  const tokenCost = useMemo(() => {
    return calculateTokenCost(selectedEngine.pricePerSecond, duration);
  }, [selectedEngine, duration]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: {
            hook: prompt.substring(0, 100),
            script: prompt,
            cta: '',
          },
          engine: selectedEngine.id,
          duration,
          resolution,
          aspectRatio,
          tokenCost, // Dynamic cost based on engine and duration
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setGeneratedVideoUrl(data.video_url);
    } catch (err) {
      console.error('Video generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-[280px]'} border-r border-[var(--bg-tertiary)] flex flex-col bg-[var(--bg-secondary)] transition-all duration-300 ease-in-out overflow-hidden`}>
        {/* Header */}
        <div className="p-3 border-b border-[var(--bg-tertiary)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary-500)]" />
            <h1 className="text-sm font-semibold whitespace-nowrap">Video Studio</h1>
          </div>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video..."
              className="w-full h-20 px-2.5 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-tertiary)] rounded-md text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] resize-none"
            />
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Model
            </label>
            <div className="relative">
              <button
                onClick={() => setShowEngineMenu(!showEngineMenu)}
                className="w-full px-2.5 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-tertiary)] rounded-md text-left hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{selectedEngine.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{selectedEngine.name}</p>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${showEngineMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showEngineMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-elevated)] border border-[var(--bg-tertiary)] rounded-md shadow-2xl z-50 max-h-[300px] overflow-y-auto">
                  {VIDEO_ENGINES.map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => {
                        setSelectedEngine(engine);
                        setShowEngineMenu(false);
                      }}
                      className={`w-full px-2.5 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors border-b border-white/5 last:border-b-0 ${
                        selectedEngine.id === engine.id ? 'bg-[var(--bg-tertiary)]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-sm">{engine.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {engine.name}
                          </p>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500">⚡ {engine.speed}</span>
                            <span className="text-[10px] text-gray-500">🎨 {engine.quality}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-400">Duration</label>
              <span className="text-xs text-white font-medium">{duration}s</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${((duration - 3) / 7) * 100}%, var(--bg-elevated) ${((duration - 3) / 7) * 100}%, var(--bg-elevated) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>3s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Resolution
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['720p', '1080p', '2K', '4K'].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    resolution === res
                      ? 'bg-[var(--primary-500)] text-black'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)]'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['16:9', '9:16', '1:1'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    aspectRatio === ratio
                      ? 'bg-[var(--primary-500)] text-black'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)]'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Generate Button - Fixed at bottom */}
        <div className="p-3 border-t border-[var(--bg-tertiary)]">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className={`w-full px-3 py-2.5 rounded-md font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              !prompt.trim() || generating
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'bg-[var(--primary-500)] text-white hover:bg-[var(--primary-400)] active:scale-95'
            }`}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate ({tokenCost} tokens)
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-500 mt-2 truncate">
            {selectedEngine.name} • {duration}s • {resolution}
          </p>
        </div>
      </div>

      {/* Main Content Area - Video Preview */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-[var(--bg-tertiary)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              )}
            </button>
            <span className="text-sm text-[var(--text-tertiary)]">Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg text-xs flex items-center gap-1.5 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg text-xs flex items-center gap-1.5 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          {!generatedVideoUrl && !generating ? (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-[var(--bg-elevated)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Create Your First Video</h2>
              <p className="text-sm text-gray-400 mb-6">
                Enter a prompt and select your preferred AI model to generate stunning videos in seconds
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[var(--primary-500)] rounded-full"></div>
                  <span>8 engines available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Up to 4K resolution</span>
                </div>
              </div>
            </div>
          ) : generating ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[var(--bg-elevated)] border-t-[var(--primary-500)] rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold mb-2">Generating your video...</h3>
              <p className="text-sm text-gray-400">This usually takes 30-60 seconds</p>
              <div className="mt-6 max-w-sm mx-auto">
                <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary-500)] rounded-full transition-all duration-500"
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Processing with {selectedEngine.name}...</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[var(--bg-tertiary)] shadow-2xl">
                <video
                  src={generatedVideoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                  loop
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Generated with {selectedEngine.name}</p>
                  <p className="text-xs text-gray-400">{duration}s • {resolution} • {aspectRatio}</p>
                </div>
                <button
                  onClick={() => {
                    setGeneratedVideoUrl('');
                    setPrompt('');
                  }}
                  className="px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg text-sm transition-colors"
                >
                  Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--primary-500);
          cursor: pointer;
          border: 2px solid var(--bg-primary);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--primary-500);
          cursor: pointer;
          border: 2px solid var(--bg-primary);
        }
      `}</style>
    </div>
  );
}
