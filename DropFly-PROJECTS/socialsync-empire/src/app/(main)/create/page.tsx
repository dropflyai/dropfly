'use client';

import { useState } from 'react';
import { Sparkles, Flame, Send, Copy, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Paywall from '@/components/Paywall';
import { CREATOR_MODE_TEMPLATES, CreatorMode } from '@/types/content';

interface GeneratedScript {
  hook: string;
  script: string;
  cta: string;
  hashtags: string[];
  duration: string;
}

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<CreatorMode | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    currentUsage: number;
    limit: number;
    plan: string;
  } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerate = async () => {
    if (!selectedMode || !prompt.trim()) return;

    setLoading(true);
    setError('');
    setGeneratedScript(null);

    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: prompt,
          creatorMode: selectedMode,
          platform: CREATOR_MODE_TEMPLATES[selectedMode].platforms[0],
          duration: CREATOR_MODE_TEMPLATES[selectedMode].avgDuration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error === 'Limit reached') {
          // Show paywall
          setUsageInfo({
            currentUsage: data.currentUsage,
            limit: data.limit,
            plan: data.plan,
          });
          setShowPaywall(true);
          return;
        }
        throw new Error(data.error || 'Failed to generate script');
      }

      setGeneratedScript(data.script);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedScript) return;

    const text = `
Hook: ${generatedScript.hook}

Script:
${generatedScript.script}

CTA: ${generatedScript.cta}

Hashtags: ${generatedScript.hashtags.join(' ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToLibrary = async () => {
    if (!generatedScript || !selectedMode || !prompt) return;

    setSaving(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
          type: 'script',
          content: generatedScript,
          metadata: {
            creator_mode: selectedMode,
            platform: CREATOR_MODE_TEMPLATES[selectedMode].platforms[0],
            duration: CREATOR_MODE_TEMPLATES[selectedMode].avgDuration,
            generated_at: new Date().toISOString(),
          },
          status: 'draft',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to save to library');
    } finally {
      setSaving(false);
    }
  };

  const creatorModes = Object.values(CREATOR_MODE_TEMPLATES);

  // Show paywall if limit reached
  if (showPaywall && usageInfo) {
    return (
      <Paywall
        feature="AI Script Generation"
        currentPlan={usageInfo.plan}
        requiredPlan="Creator"
        usageLimit={usageInfo.limit}
        currentUsage={usageInfo.currentUsage}
      />
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Side - Mode Selection & Input (60% on desktop) */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[var(--bg-tertiary)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--bg-tertiary)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create AI Content</h1>
              <p className="text-sm text-[var(--text-tertiary)]">Choose a style and describe your video</p>
            </div>
            {usageInfo && (
              <Link href="/pricing">
                <Button variant="primary" size="sm">
                  <Zap className="w-4 h-4 mr-1" />
                  {usageInfo.currentUsage}/{usageInfo.limit} used
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Creator Mode Selection */}
        <div className="p-6 border-b border-[var(--bg-tertiary)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            🎬 Choose Creator Mode
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {creatorModes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const isPro = ['clipping', 'commentary', 'storytelling', 'documentary'].includes(mode.id);

              return (
                <button
                  key={mode.id}
                  onClick={() => !isPro && setSelectedMode(mode.id)}
                  disabled={isPro}
                  className={`
                    relative p-4 rounded-lg text-center transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 border-2 border-[var(--primary-500)] scale-105'
                      : isPro
                        ? 'bg-[var(--bg-tertiary)]/30 border border-[var(--bg-elevated)] opacity-50 cursor-not-allowed'
                        : 'bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] hover:scale-105'
                    }
                  `}
                >
                  {isPro && (
                    <div className="absolute top-2 right-2 bg-[var(--primary-500)] text-white text-xs px-2 py-0.5 rounded-full">
                      Pro
                    </div>
                  )}
                  <div className="text-3xl mb-2">{mode.emoji}</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    {mode.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {mode.avgDuration}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedMode && (
            <Card variant="glass" padding="md" className="mt-4">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">
                  {CREATOR_MODE_TEMPLATES[selectedMode].name}:
                </strong>{' '}
                {CREATOR_MODE_TEMPLATES[selectedMode].description}
              </p>
            </Card>
          )}
        </div>

        {/* AI Chat Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 mb-4 space-y-4">
            {/* AI Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <Card variant="glass" padding="md" className="flex-1">
                <p className="text-[var(--text-secondary)]">
                  {selectedMode
                    ? `Perfect! You've selected ${CREATOR_MODE_TEMPLATES[selectedMode].name} mode. What kind of content do you want to create?`
                    : "Hi! I'm your AI content assistant. Choose a creator mode above, then tell me what you'd like to create."}
                </p>
              </Card>
            </div>

            {/* Trending Suggestions */}
            {selectedMode && !generatedScript && !loading && (
              <div>
                <p className="text-sm text-[var(--text-tertiary)] mb-2">🎯 Trending topics:</p>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_MODE_TEMPLATES[selectedMode].examples.slice(0, 3).map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="text-xs px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)} rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Card variant="bordered" padding="md" className="bg-red-500/10 border-red-500/20">
                <p className="text-sm text-red-500">❌ {error}</p>
              </Card>
            )}

            {/* Generated Script */}
            {generatedScript && (
              <div className="space-y-4">
                <Card variant="glass" padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">✨ Your AI-Generated Script</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                        🎣 Hook (First 3 seconds)
                      </p>
                      <p className="text-[var(--text-primary)] font-medium">&quot;{generatedScript.hook}&quot;</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                        📝 Full Script
                      </p>
                      <div className="text-[var(--text-secondary)] whitespace-pre-wrap">
                        {generatedScript.script}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                        📢 Call to Action
                      </p>
                      <p className="text-[var(--text-primary)]">{generatedScript.cta}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                        #️⃣ Hashtags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {generatedScript.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                        ⏱️ Duration
                      </p>
                      <p className="text-[var(--text-primary)]">{generatedScript.duration}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={saveToLibrary}
                      loading={saving}
                      disabled={saving || saved}
                    >
                      {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save to Library'}
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setGeneratedScript(null);
                      setSaved(false);
                    }}>
                      New Script
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <Input
              multiline
              rows={3}
              placeholder={
                selectedMode
                  ? 'Describe your video idea...'
                  : 'Choose a creator mode first, then describe your idea...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!selectedMode}
            />

            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                icon={<Send className="w-4 h-4" />}
                disabled={!selectedMode || !prompt.trim() || loading}
                loading={loading}
                onClick={handleGenerate}
              >
                {loading ? 'Generating...' : 'Generate Script'}
              </Button>
              <Button variant="secondary" icon={<Flame className="w-4 h-4" />}>
                Trend Radar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Preview (40% on desktop) */}
      <div className="w-full md:w-[40%] bg-[var(--bg-secondary)]/50 p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          📹 Live Preview
        </h3>

        {!selectedMode ? (
          <Card variant="bordered" padding="lg" className="text-center">
            <div className="py-12">
              <Sparkles className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">
                Select a creator mode to see a preview
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card variant="glass" padding="md">
              <div className="aspect-video bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{CREATOR_MODE_TEMPLATES[selectedMode].emoji}</div>
                  <p className="text-sm text-[var(--text-tertiary)]">Preview will appear here</p>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                Estimated Performance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Engagement</span>
                  <span className="text-sm text-[var(--text-primary)]">⭐⭐⭐⭐☆</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Virality</span>
                  <span className="text-sm text-[var(--text-primary)]">🔥🔥🔥☆☆</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-tertiary)]">Best Platform</span>
                  <span className="text-sm text-[var(--text-primary)]">
                    {CREATOR_MODE_TEMPLATES[selectedMode].platforms[0]}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
