'use client';

import { useState } from 'react';
import { Play, Sparkles, Download, Share2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface VideoEngine {
  id: string;
  name: string;
  description: string;
  icon: string;
  speed: string;
  quality: string;
}

const VIDEO_ENGINES: VideoEngine[] = [
  {
    id: 'minimax-video',
    name: 'Minimax Video',
    description: 'Fast, high-quality AI video generation',
    icon: '🚀',
    speed: 'Fast',
    quality: 'High',
  },
  {
    id: 'runway-gen4-turbo',
    name: 'Runway Gen-4 Turbo',
    description: 'Ultra-fast professional video',
    icon: '⚡',
    speed: 'Ultra Fast',
    quality: 'Very High',
  },
  {
    id: 'kling-2.1',
    name: 'Kling 2.1',
    description: 'Motion-rich with advanced control',
    icon: '🎭',
    speed: 'Fast',
    quality: 'High',
  },
  {
    id: 'luma-dream',
    name: 'Luma Dream Machine',
    description: 'Cinematic quality with realistic motion',
    icon: '✨',
    speed: 'Medium',
    quality: 'Very High',
  },
  {
    id: 'sora-2',
    name: 'OpenAI Sora 2',
    description: 'Photorealistic video generation',
    icon: '🤖',
    speed: 'Standard',
    quality: 'Ultra High',
  },
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    description: 'Precision video with sound',
    icon: '🎨',
    speed: 'Medium',
    quality: 'Very High',
  },
];

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<VideoEngine>(VIDEO_ENGINES[0]);
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [generating, setGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fixed token cost for video generation
  const tokenCost = 75;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/video/generate-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setGeneratedVideoUrl(data.videoUrl);
    } catch (err) {
      console.error('Video generation failed:', err);
      alert('Video generation failed. Please try again.');
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
              What do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video... (e.g., 'A chef cooking pasta in a modern kitchen')"
              className="w-full h-24 px-2.5 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-tertiary)] rounded-md text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] resize-none"
            />
          </div>

          {/* Engine Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              AI Engine
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
                    <p className="text-[10px] text-gray-500 truncate">{selectedEngine.description}</p>
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
                          <p className="text-[10px] text-gray-500 truncate mb-0.5">
                            {engine.description}
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

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Video Length
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setDuration(5)}
                className={`px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  duration === 5
                    ? 'bg-[var(--primary-500)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)]'
                }`}
              >
                5 seconds
              </button>
              <button
                onClick={() => setDuration(10)}
                className={`px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  duration === 10
                    ? 'bg-[var(--primary-500)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)]'
                }`}
              >
                10 seconds
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-300 mb-1">Quick Tips</p>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• Be specific about what you want</li>
                  <li>• Describe the scene and action</li>
                  <li>• Keep it simple and clear</li>
                </ul>
              </div>
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
            {selectedEngine.name} • {duration}s
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
                  <span>AI-powered video</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>30-60 second generation</span>
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
                  <p className="text-xs text-gray-400">{duration} seconds • 75 tokens used</p>
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
