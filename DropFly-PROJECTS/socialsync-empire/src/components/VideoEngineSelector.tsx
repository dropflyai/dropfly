'use client';

import { useState } from 'react';
import { VideoEngineConfig } from '@/types/video-engine';
import Card from './ui/Card';
import { Check, Zap, Award, Sparkles, Crown, TrendingUp, Package, Code, ChevronDown, ChevronUp, Coins, Lock } from 'lucide-react';
import { ENGINE_BY_TIER, SUBSCRIPTION_TIERS } from '@/lib/video-engines/config';

interface VideoEngineSelectorProps {
  engines: Record<string, VideoEngineConfig>;
  selectedEngine: string | null;
  onSelectEngine: (engineId: string) => void;
  userTier: string;
  duration?: number;
  tokenBalance?: number;
}

type Category = 'all' | 'premium' | 'value' | 'fast' | 'opensource';

const CATEGORIES = {
  all: { label: 'All Engines', icon: Sparkles, engines: [] as string[] },
  premium: { label: 'Premium', icon: Crown, engines: ['sora-2', 'sora-2-pro', 'veo-3.1', 'veo-3.1-fast', 'ltx-2-pro', 'runway-gen3-alpha', 'kling-2.5-turbo-pro'] },
  value: { label: 'Best Value', icon: TrendingUp, engines: ['hunyuan-video', 'vidu-q2', 'seedance-1.0-pro', 'pixverse-v4.5', 'hailuo-02'] },
  fast: { label: 'High-Speed', icon: Zap, engines: ['runway-gen4-turbo', 'kling-2.5-turbo', 'pika-2.2', 'wan-2.2', 'mochi-1', 'fabric-1.0'] },
  opensource: { label: 'Open Source', icon: Code, engines: ['cogvideox-5b', 'cogvideox-i2v'] },
};

export default function VideoEngineSelector({
  engines,
  selectedEngine,
  onSelectEngine,
  userTier,
  duration = 5,
  tokenBalance = 0,
}: VideoEngineSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const engineList = Object.values(engines);

  // Get auto-selected engine for user's tier
  const autoEngine = ENGINE_BY_TIER[userTier] || 'hunyuan-video';
  const autoEngineConfig = engines[autoEngine];

  // Calculate token cost for an engine
  const calculateCost = (engine: VideoEngineConfig) => {
    return Math.ceil(engine.pricePerSecond * duration * 100); // tokens
  };

  // Get next tier for upgrade prompts
  const tierOrder = ['free', 'starter', 'pro', 'enterprise'];
  const currentTierIndex = tierOrder.indexOf(userTier);
  const nextTier = currentTierIndex < tierOrder.length - 1 ? tierOrder[currentTierIndex + 1] : null;

  // Get locked engines from next tier (for upgrade prompts)
  const lockedEngines = nextTier
    ? SUBSCRIPTION_TIERS.find(t => t.id === nextTier)?.engines
        .slice(0, 2) // Show only 2 locked engines
        .map(id => engines[id])
        .filter(Boolean) || []
    : [];

  // Top engines to show in simple view (5 best value engines for user's tier)
  const topEngines = engineList
    .filter(e => e.tier === userTier || (userTier === 'pro' && ['pro', 'agency'].includes(e.tier)))
    .sort((a, b) => a.pricePerSecond - b.pricePerSecond) // Sort by best value
    .slice(0, 5);

  if (engineList.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <p className="text-[var(--text-secondary)] text-center">
          No video engines available for your tier. Upgrade to access AI video generation!
        </p>
      </Card>
    );
  }

  // Filter engines by category (for advanced view)
  const filteredEngines = activeCategory === 'all'
    ? engineList
    : engineList.filter(engine => CATEGORIES[activeCategory].engines.includes(engine.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Video Engine
        </h3>
        <div className="text-xs px-3 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-full font-medium">
          {userTier.toUpperCase()} TIER
        </div>
      </div>

      {/* LEVEL 1: Simple View - Auto-Select (Default) */}
      {!showAdvanced && (
        <div className="space-y-3">
          {/* Auto-Select Option (Prominent) */}
          <button
            onClick={() => onSelectEngine('auto')}
            className={`
              w-full p-4 rounded-lg text-left transition-all duration-200
              ${
                selectedEngine === 'auto'
                  ? 'bg-gradient-to-r from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 border-2 border-[var(--primary-500)]'
                  : 'bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {selectedEngine === 'auto' && (
                  <div className="w-5 h-5 bg-[var(--primary-500)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[var(--text-primary)]">Auto (Recommended)</p>
                    <Award className="w-4 h-4 text-[var(--primary-500)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    System picks best engine for your tier
                  </p>
                  {autoEngineConfig && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-full font-medium">
                        {autoEngineConfig.displayName}
                      </span>
                      <span className="text-[var(--text-tertiary)]">
                        {calculateCost(autoEngineConfig)} tokens/{duration}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[var(--primary-500)] flex-shrink-0" />
            </div>
          </button>

          {/* Show Advanced Options Button */}
          <button
            onClick={() => setShowAdvanced(true)}
            className="w-full p-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-2"
          >
            <span>Advanced Options</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEVEL 2: Advanced View - with Top Engines */}
      {showAdvanced && (
        <div className="space-y-4">
          {/* Hide Advanced Button */}
          <button
            onClick={() => setShowAdvanced(false)}
            className="w-full p-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-2"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Hide Advanced Options</span>
          </button>

          {/* Auto-Select Option (Compact in Advanced) */}
          <button
            onClick={() => onSelectEngine('auto')}
            className={`
              w-full p-3 rounded-lg text-left transition-all duration-200
              ${
                selectedEngine === 'auto'
                  ? 'bg-gradient-to-r from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 border-2 border-[var(--primary-500)]'
                  : 'bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedEngine === 'auto' && (
                  <div className="w-5 h-5 bg-[var(--primary-500)] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Auto-Select (Recommended)</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {autoEngineConfig?.displayName} • {autoEngineConfig && calculateCost(autoEngineConfig)} tokens
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
            </div>
          </button>

          {/* Top Engines for User's Tier */}
          {topEngines.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                {userTier.toUpperCase()} TIER OPTIONS ({topEngines.length})
              </p>
              <div className="grid grid-cols-1 gap-2">
                {topEngines.map((engine) => {
                  const isSelected = selectedEngine === engine.id;
                  const cost = calculateCost(engine);
                  const speedColors = {
                    'ultra-fast': 'text-green-500',
                    fast: 'text-blue-500',
                    standard: 'text-yellow-500',
                    slow: 'text-orange-500',
                  };

                  return (
                    <button
                      key={engine.id}
                      onClick={() => onSelectEngine(engine.id)}
                      className={`
                        p-3 rounded-lg text-left transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 border-2 border-[var(--primary-500)]'
                            : 'bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {isSelected && (
                            <div className="w-5 h-5 bg-[var(--primary-500)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-[var(--text-primary)]">{engine.displayName}</p>
                              {engine.badge && (
                                <span className="text-xs px-2 py-0.5 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-full">
                                  {engine.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                              <span className={speedColors[engine.speed]}>{engine.speed.toUpperCase()}</span>
                              <span>•</span>
                              <span>{engine.maxLength}s max</span>
                              <span>•</span>
                              <span className="font-medium text-[var(--text-primary)]">{cost} tokens/{duration}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Engines (Upgrade Prompts) */}
          {lockedEngines.length > 0 && nextTier && (
            <div>
              <p className="text-sm font-medium text-[var(--text-tertiary)] mb-2 uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {nextTier.toUpperCase()} TIER (Upgrade to unlock)
              </p>
              <div className="grid grid-cols-1 gap-2">
                {lockedEngines.map((engine) => (
                  <div
                    key={engine.id}
                    className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{engine.displayName}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {calculateCost(engine)} tokens/{duration}s
                            {engine.badge && ` • ${engine.badge}`}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs px-3 py-1 bg-[var(--primary-500)] text-white rounded-full hover:bg-[var(--primary-600)] transition-colors">
                        Upgrade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">BROWSE BY CATEGORY</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORIES) as Category[]).map((category) => {
                const CategoryIcon = CATEGORIES[category].icon;
                const isActive = activeCategory === category;
                const count = category === 'all' ? engineList.length : CATEGORIES[category].engines.length;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${isActive
                        ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }
                    `}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    {CATEGORIES[category].label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--bg-tertiary)]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Engine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEngines.map((engine) => {
          const isSelected = selectedEngine === engine.id;
          const speedColors = {
            'ultra-fast': 'text-green-500',
            fast: 'text-blue-500',
            standard: 'text-yellow-500',
            slow: 'text-orange-500',
          };

          return (
            <button
              key={engine.id}
              onClick={() => onSelectEngine(engine.id)}
              className={`
                relative p-4 rounded-lg text-left transition-all duration-200
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--secondary-500)]/20 border-2 border-[var(--primary-500)] scale-[1.02]'
                    : 'bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] hover:scale-[1.01]'
                }
              `}
            >
              {/* Badge */}
              {engine.badge && (
                <div className="absolute top-2 right-2 bg-[var(--primary-500)] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  {engine.badge === '#1 Ranked' && <Award className="w-3 h-3" />}
                  {engine.badge === 'Latest' && <Sparkles className="w-3 h-3" />}
                  {engine.badge === '3x Faster' && <Zap className="w-3 h-3" />}
                  {engine.badge}
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-[var(--primary-500)] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Content */}
              <div className={`${isSelected || engine.badge ? 'mt-6' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-0.5">
                      {engine.displayName}
                    </h4>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      by {engine.provider} • v{engine.version}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Speed</p>
                    <p className={`text-xs font-medium ${speedColors[engine.speed]}`}>
                      {engine.speed.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Max Length</p>
                    <p className="text-xs font-medium text-[var(--text-primary)]">{engine.maxLength}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Cost/30s</p>
                    <p className="text-xs font-medium text-[var(--text-primary)]">
                      ${(engine.pricePerSecond * 30).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {engine.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-[var(--primary-500)] rounded-full" />
                      <p className="text-xs text-[var(--text-secondary)]">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* Audio badge */}
                {engine.hasNativeAudio && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                    <span>🎵</span>
                    <span>Native Audio</span>
                  </div>
                )}

                {/* Rank */}
                {engine.rank && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2 italic">{engine.rank}</p>
                )}
              </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
