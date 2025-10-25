'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Play, Download, Coins, Zap, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import VideoEngineSelector from '@/components/VideoEngineSelector';
import { BuyTokensButton } from '@/components/billing/BuyTokensButton';
import { VIDEO_ENGINES } from '@/lib/video-engines/config';
import type { VideoEngine } from '@/types/video-engine';

interface TokenInfo {
  balance: number;
  dailySpent: number;
  dailyLimit: number;
  dailyRemaining: number;
}

interface VideoResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  engine: string;
  engineName: string;
  cost: number;
  metadata?: Record<string, unknown>;
}

export default function GenerateVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<string>('auto');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);

  const [userTier, setUserTier] = useState('free');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    balance: 0,
    dailySpent: 0,
    dailyLimit: 0,
    dailyRemaining: 0,
  });
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Fetch user data and token balance
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.subscription_tier || 'free');

          if (data.tokenBalance) {
            setTokenInfo(data.tokenBalance);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, []);

  // Calculate estimated cost whenever params change
  useEffect(() => {
    const calculateCost = async () => {
      try {
        const response = await fetch('/api/video/estimate-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engine: selectedEngine,
            duration,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEstimatedCost(data.cost || 0);
        }
      } catch (err) {
        console.error('Failed to estimate cost:', err);
      }
    };

    if (selectedEngine && duration) {
      calculateCost();
    }
  }, [selectedEngine, duration]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video prompt');
      return;
    }

    setLoading(true);
    setError('');
    setVideoResult(null);

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          engine: selectedEngine,
          duration,
          aspectRatio,
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.errorCode === 'INSUFFICIENT_TOKENS') {
          setError(`${data.error} You need ${estimatedCost} tokens but only have ${tokenInfo.balance}.`);
        } else if (data.errorCode === 'DAILY_LIMIT_EXCEEDED') {
          setError(data.error);
        } else {
          setError(data.error || 'Failed to generate video');
        }
        return;
      }

      // Update token info after successful generation
      if (data.tokens) {
        setTokenInfo({
          balance: data.tokens.balance,
          dailySpent: data.tokens.dailySpent,
          dailyLimit: data.tokens.dailyLimit,
          dailyRemaining: data.tokens.dailyRemaining,
        });
      }

      setVideoResult(data.video);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = prompt.trim().length > 0 && tokenInfo.balance >= estimatedCost && tokenInfo.dailyRemaining >= estimatedCost;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <Film className="w-8 h-8 text-[var(--primary-500)]" />
            AI Video Generation
          </h1>
          <p className="text-[var(--text-secondary)]">
            Transform your ideas into professional videos with AI
          </p>
        </div>

        {/* Token Balance */}
        <Card variant="glass" padding="sm" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[var(--secondary-500)]" />
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Balance</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {tokenInfo.balance.toLocaleString()}
              </p>
            </div>
          </div>
          <BuyTokensButton variant="primary" size="sm" currentBalance={tokenInfo.balance} />
        </Card>
      </div>

      {/* Daily Limit Warning */}
      {tokenInfo.dailyRemaining < estimatedCost && tokenInfo.balance >= estimatedCost && (
        <Card variant="bordered" padding="md" className="border-[var(--warning)] bg-[var(--warning)]/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
            <p className="text-sm text-[var(--warning)]">
              Daily limit reached. You've used {tokenInfo.dailySpent}/{tokenInfo.dailyLimit} tokens today. Resets at midnight.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt */}
          <Card variant="glass" padding="lg">
            <label className="block mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary-500)]" />
                Video Prompt
              </span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video in detail... (e.g., 'A serene sunset over ocean waves, golden hour lighting, cinematic, 4k quality')"
              className="w-full h-32 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              Be specific and descriptive for best results. Include details about style, mood, camera angles, and lighting.
            </p>
          </Card>

          {/* Engine Selector */}
          <Card variant="glass" padding="lg">
            <VideoEngineSelector
              engines={VIDEO_ENGINES}
              selectedEngine={selectedEngine}
              onSelectEngine={setSelectedEngine}
              userTier={userTier}
            />
          </Card>

          {/* Settings */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Video Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16' | '1:1')}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as '720p' | '1080p' | '4k')}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4k">4K (Ultra HD)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Cost & Generate */}
        <div className="space-y-6">
          {/* Cost Estimate */}
          <Card variant="glass" padding="lg" className="bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--secondary-500)]/5">
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-3">Cost Estimate</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Engine</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedEngine === 'auto' ? 'Auto-Select' : VIDEO_ENGINES[selectedEngine as VideoEngine]?.displayName || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">Duration</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{duration}s</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text-primary)]">Estimated Cost</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[var(--secondary-500)]" />
                  <span className="text-lg font-bold text-[var(--primary-500)]">
                    {estimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-tertiary)]">Balance after</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {(tokenInfo.balance - estimatedCost).toLocaleString()} tokens
                </span>
              </div>
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Video ({estimatedCost} tokens)
              </>
            )}
          </Button>

          {!canGenerate && !loading && (
            <p className="text-xs text-center text-[var(--text-tertiary)]">
              {tokenInfo.balance < estimatedCost
                ? 'Insufficient tokens. Please buy more tokens.'
                : tokenInfo.dailyRemaining < estimatedCost
                ? 'Daily limit reached. Try again tomorrow.'
                : 'Enter a prompt to generate a video.'}
            </p>
          )}

          {/* Error Display */}
          {error && (
            <Card variant="bordered" padding="md" className="border-red-500 bg-red-500/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </Card>
          )}

          {/* Success Display */}
          {videoResult && (
            <Card variant="glass" padding="lg" className="border-2 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Video Generated!</h3>
              </div>

              {/* Video Preview */}
              <video
                src={videoResult.videoUrl}
                controls
                className="w-full rounded-lg mb-4"
                poster={videoResult.thumbnailUrl}
              />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Engine</span>
                  <span className="text-[var(--text-primary)] font-medium">{videoResult.engineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Duration</span>
                  <span className="text-[var(--text-primary)] font-medium">{videoResult.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Tokens Used</span>
                  <span className="text-[var(--text-primary)] font-medium">{videoResult.cost}</span>
                </div>
              </div>

              <a
                href={videoResult.videoUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="md" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
