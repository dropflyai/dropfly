'use client';

import { useState } from 'react';
import { Sparkles, Hash, Zap, Calendar, Type, MessageSquare, FileText, Mic, Video } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type AITool = 'caption' | 'hashtag' | 'hook' | 'calendar' | 'thumbnail' | 'transcribe' | 'auto-captions';

interface ToolConfig {
  id: AITool;
  name: string;
  description: string;
  icon: React.ElementType;
  tokenCost: string;
  color: string;
  placeholder: string;
  inputLabel: string;
  enabled: boolean;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'caption',
    name: 'Caption Generator',
    description: 'Generate 5 engaging social media captions',
    icon: MessageSquare,
    tokenCost: '2 tokens',
    color: 'from-blue-500 to-cyan-500',
    placeholder: 'e.g., "New AI video tool launch"',
    inputLabel: 'What is your post about?',
    enabled: true,
  },
  {
    id: 'hashtag',
    name: 'Hashtag Generator',
    description: 'Get 30 relevant hashtags categorized by type',
    icon: Hash,
    tokenCost: '1 token',
    color: 'from-purple-500 to-pink-500',
    placeholder: 'e.g., "AI video marketing"',
    inputLabel: 'What is your content about?',
    enabled: true,
  },
  {
    id: 'hook',
    name: 'Hook Generator',
    description: 'Create 7 viral video hooks to stop scrolling',
    icon: Zap,
    tokenCost: '2 tokens',
    color: 'from-orange-500 to-red-500',
    placeholder: 'e.g., "AI productivity tips"',
    inputLabel: 'What is your video about?',
    enabled: true,
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail Text',
    description: 'Generate catchy thumbnail text (3-5 words)',
    icon: Type,
    tokenCost: '1 token',
    color: 'from-green-500 to-emerald-500',
    placeholder: 'e.g., "How to grow on TikTok"',
    inputLabel: 'What is your video about?',
    enabled: true,
  },
  {
    id: 'calendar',
    name: 'Content Calendar',
    description: 'Get a 30-day content plan with daily topics',
    icon: Calendar,
    tokenCost: '10 tokens',
    color: 'from-indigo-500 to-purple-500',
    placeholder: 'e.g., "Fitness coaching niche"',
    inputLabel: 'What is your niche/topic?',
    enabled: true,
  },
  {
    id: 'transcribe',
    name: 'Video Transcription',
    description: 'Convert video/audio to text (SRT, VTT)',
    icon: Mic,
    tokenCost: '~2 tokens/min',
    color: 'from-pink-500 to-rose-500',
    placeholder: 'https://example.com/video.mp4',
    inputLabel: 'Video URL',
    enabled: true,
  },
  {
    id: 'auto-captions',
    name: 'Auto Captions',
    description: 'Burn subtitles into your video automatically',
    icon: Video,
    tokenCost: '~3 tokens/min',
    color: 'from-cyan-500 to-blue-500',
    placeholder: 'https://example.com/video.mp4',
    inputLabel: 'Video URL',
    enabled: false, // Coming soon - needs FFmpeg
  },
];

export default function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('engaging');
  const [duration, setDuration] = useState<number>(60); // Video duration in seconds
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const selectedToolConfig = TOOLS.find(t => t.id === selectedTool);

  const handleGenerate = async () => {
    if (!input.trim() || !selectedTool) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Handle video transcription separately
      if (selectedTool === 'transcribe') {
        const response = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: input.trim(),
            duration: duration,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to transcribe');
        }

        setResult(data.result);
        setLoading(false);
        return;
      }

      // Handle regular text-based tools
      const response = await fetch('/api/ai/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          input: input.trim(),
          platform,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          🤖 AI Content Tools
        </h1>
        <p className="text-[var(--text-secondary)]">
          Generate captions, hashtags, hooks, and more with AI
        </p>
      </div>

      {/* Tool Selection Grid */}
      {!selectedTool && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                padding="lg"
                className={`cursor-pointer transition-all hover:scale-105 ${
                  !tool.enabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => tool.enabled && setSelectedTool(tool.id)}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {tool.name}
                      </h3>
                      {!tool.enabled && (
                        <span className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {tool.description}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Cost: {tool.tokenCost}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tool Interface */}
      {selectedTool && selectedToolConfig && (
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTool(null);
              setInput('');
              setResult(null);
              setError('');
            }}
          >
            ← Back to Tools
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card padding="lg">
              <div className="space-y-4">
                {/* Tool Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedToolConfig.color} flex items-center justify-center`}>
                    <selectedToolConfig.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                      {selectedToolConfig.name}
                    </h2>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      {selectedToolConfig.tokenCost}
                    </p>
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {selectedToolConfig.inputLabel}
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedToolConfig.placeholder}
                    className="w-full h-32 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                  />
                </div>

                {/* Duration Input (for transcribe tool only) */}
                {selectedTool === 'transcribe' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Video Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min="1"
                      max="7200"
                      className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                      placeholder="e.g., 120 (2 minutes)"
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      ~{Math.ceil((duration / 60) * 2)} tokens ({(duration / 60).toFixed(1)} min)
                    </p>
                  </div>
                )}

                {/* Options (hidden for transcribe tool) */}
                {selectedTool !== 'transcribe' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                      >
                        <option value="engaging">Engaging</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="humorous">Humorous</option>
                        <option value="inspirational">Inspirational</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim() || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate {selectedToolConfig.tokenCost}
                    </>
                  )}
                </Button>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </Card>

            {/* Results Section */}
            <Card padding="lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Generated Results
                </h3>

                {!result && !loading && (
                  <div className="h-full flex items-center justify-center text-center py-12">
                    <div className="space-y-2">
                      <Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto" />
                      <p className="text-[var(--text-secondary)]">
                        Fill in the details and click Generate
                      </p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="space-y-2 text-center">
                      <Sparkles className="w-12 h-12 text-[var(--primary-500)] mx-auto animate-spin" />
                      <p className="text-[var(--text-secondary)]">
                        AI is generating your content...
                      </p>
                    </div>
                  </div>
                )}

                {/* Caption Results */}
                {result && selectedTool === 'caption' && result.captions && (
                  <div className="space-y-3">
                    {result.captions.map((caption: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[var(--text-primary)] flex-1">
                            {caption.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(caption.text)}
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded">
                            {caption.style}
                          </span>
                          <span className="text-[var(--text-tertiary)]">
                            {caption.length} chars
                          </span>
                          {caption.cta && (
                            <span className="text-[var(--text-tertiary)]">
                              CTA: {caption.cta}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hashtag Results */}
                {result && selectedTool === 'hashtag' && result.hashtags && (
                  <div className="space-y-4">
                    {Object.entries(result.hashtags).map(([category, tags]: [string, any]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                            {category} ({tags.length})
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(tags.map((t: string) => `#${t}`).join(' '))}
                          >
                            Copy All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleCopy(`#${tag}`)}
                              className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-full text-sm text-[var(--text-primary)] transition-colors cursor-pointer"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          const allTags = Object.values(result.hashtags)
                            .flat()
                            .map((t: any) => `#${t}`)
                            .join(' ');
                          handleCopy(allTags);
                        }}
                      >
                        Copy All {Object.values(result.hashtags).flat().length} Hashtags
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hook Results */}
                {result && selectedTool === 'hook' && result.hooks && (
                  <div className="space-y-3">
                    {result.hooks.map((hook: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 text-xs font-semibold rounded">
                                Hook #{i + 1}
                              </span>
                              <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs rounded capitalize">
                                {hook.type}
                              </span>
                            </div>
                            <p className="text-[var(--text-primary)] font-medium">
                              {hook.text}
                            </p>
                            {hook.context && (
                              <p className="text-sm text-[var(--text-secondary)] mt-2">
                                💡 {hook.context}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(hook.text)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Thumbnail Text Results */}
                {result && selectedTool === 'thumbnail' && result.thumbnails && (
                  <div className="space-y-3">
                    {result.thumbnails.map((thumb: any, i: number) => (
                      <div
                        key={i}
                        className="group p-6 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-2 border-[var(--bg-tertiary)] hover:border-green-500/50 rounded-xl transition-all cursor-pointer"
                        onClick={() => handleCopy(thumb.text)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                              {thumb.text}
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded capitalize">
                                {thumb.style}
                              </span>
                              <span className="text-[var(--text-tertiary)]">
                                {thumb.wordCount} words
                              </span>
                              {thumb.emoji && (
                                <span className="text-lg">
                                  {thumb.emoji}
                                </span>
                              )}
                            </div>
                            {thumb.variation && (
                              <p className="text-sm text-[var(--text-secondary)] mt-2">
                                Alt: {thumb.variation}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(thumb.text);
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--bg-tertiary)]">
                      <p className="text-sm text-[var(--text-secondary)] text-center">
                        💡 Click any thumbnail text to copy it instantly
                      </p>
                    </div>
                  </div>
                )}

                {/* Content Calendar Results */}
                {result && selectedTool === 'calendar' && result.calendar && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                        30-Day Content Plan
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const calendarText = result.calendar
                            .map((day: any) => `Day ${day.day}: ${day.topic}\n${day.description}\nFormat: ${day.contentType}`)
                            .join('\n\n');
                          handleCopy(calendarText);
                        }}
                      >
                        Copy All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
                      {result.calendar.map((day: any) => (
                        <div
                          key={day.day}
                          className="p-4 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg hover:border-indigo-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 text-xs font-semibold rounded">
                                  Day {day.day}
                                </span>
                                <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs rounded capitalize">
                                  {day.contentType}
                                </span>
                              </div>
                              <h5 className="font-semibold text-[var(--text-primary)] mb-1">
                                {day.topic}
                              </h5>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {day.description}
                              </p>
                              {day.hooks && day.hooks.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {day.hooks.map((hook: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded"
                                    >
                                      💡 {hook}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopy(
                                  `Day ${day.day}: ${day.topic}\n${day.description}\nFormat: ${day.contentType}`
                                )
                              }
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
                      <p className="text-sm text-[var(--text-secondary)] text-center">
                        📅 Your complete 30-day content strategy • Mix of formats for maximum engagement
                      </p>
                    </div>
                  </div>
                )}

                {/* Video Transcription Results */}
                {result && selectedTool === 'transcribe' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                        Transcription Complete
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([result.srt], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'transcript.srt';
                            a.click();
                          }}
                        >
                          Download SRT
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([result.vtt], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'transcript.vtt';
                            a.click();
                          }}
                        >
                          Download VTT
                        </Button>
                      </div>
                    </div>

                    {/* Plain Text Transcript */}
                    <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-[var(--text-primary)] text-sm">
                          Full Transcript
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(result.text)}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-h-[200px] overflow-y-auto">
                        {result.text}
                      </p>
                    </div>

                    {/* Segmented Transcript with Timestamps */}
                    {result.segments && result.segments.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-[var(--text-primary)] text-sm">
                          Timestamped Segments
                        </h5>
                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                          {result.segments.map((segment: any, i: number) => (
                            <div
                              key={i}
                              className="p-3 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg hover:border-pink-500/50 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 text-xs font-mono rounded">
                                      {new Date(segment.start * 1000).toISOString().substr(11, 8)}
                                    </span>
                                    <span className="text-xs text-[var(--text-tertiary)]">→</span>
                                    <span className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs font-mono rounded">
                                      {new Date(segment.end * 1000).toISOString().substr(11, 8)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[var(--text-primary)]">
                                    {segment.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(segment.text)}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-lg">
                      <p className="text-sm text-[var(--text-secondary)] text-center">
                        🎙️ Transcription complete • Download SRT/VTT for video editing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
