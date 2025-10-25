'use client';

import { useState } from 'react';
import { VideoEngineConfig } from '@/types/video-engine';
import Card from './ui/Card';
import { Check, Zap, Award, Sparkles } from 'lucide-react';

interface VideoEngineSelectorProps {
  engines: Record<string, VideoEngineConfig>;
  selectedEngine: string | null;
  onSelectEngine: (engineId: string) => void;
  userTier: string;
}

export default function VideoEngineSelector({
  engines,
  selectedEngine,
  onSelectEngine,
  userTier,
}: VideoEngineSelectorProps) {
  const engineList = Object.values(engines);

  if (engineList.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <p className="text-[var(--text-secondary)] text-center">
          No video engines available for your tier. Upgrade to access AI video generation!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          🎬 Choose AI Video Engine
        </h3>
        <div className="text-xs px-3 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-full font-medium">
          {userTier.toUpperCase()} TIER
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {engineList.map((engine) => {
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

      {/* Auto-select option */}
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
                We'll choose the best engine for your tier and video requirements
              </p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
        </div>
      </button>
    </div>
  );
}
