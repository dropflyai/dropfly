/**
 * Confidence Badge Component
 *
 * Color-coded badge showing AI confidence level.
 * Includes tooltip with reasoning on hover.
 */

'use client';

import { useState } from 'react';
import { cn, getConfidenceInfo, formatPercentage } from '@/lib/utils';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  reasoning?: string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({
  score,
  reasoning,
  showScore = false,
  size = 'md',
}: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { level, label, bgColor, textColor, color } = getConfidenceInfo(score);

  // Icon based on confidence level
  const Icon = level === 'high' ? TrendingUp : level === 'low' ? TrendingDown : Minus;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <div className="relative inline-flex">
      <span
        className={cn(
          'badge inline-flex items-center gap-1.5 font-medium',
          bgColor,
          textColor,
          sizeClasses[size],
          reasoning && 'cursor-help'
        )}
        onMouseEnter={() => reasoning && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon className={iconSizes[size]} style={{ color }} />
        {showScore ? (
          <span>{formatPercentage(score)}</span>
        ) : (
          <span className="capitalize">{level}</span>
        )}
        {reasoning && (
          <Info className={cn(iconSizes[size], 'opacity-60')} />
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && reasoning && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 animate-fade-in">
          <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-dropdown">
            {/* Confidence bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Confidence</span>
                <span className={textColor} style={{ color }}>
                  {formatPercentage(score)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${score * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>

            {/* Reasoning text */}
            <p className="text-xs text-neutral-600 leading-relaxed">{reasoning}</p>

            {/* Level indicator */}
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    level === 'high' && 'bg-confidence-high',
                    level === 'medium' && 'bg-confidence-medium',
                    level === 'low' && 'bg-confidence-low'
                  )}
                />
                <span className="text-xs font-medium text-neutral-700">
                  {label}
                </span>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border-neutral-200 bg-white" />
        </div>
      )}
    </div>
  );
}

/**
 * Confidence Legend Component
 * Shows all confidence levels for reference
 */
export function ConfidenceLegend() {
  const levels = [
    { level: 'high', label: 'High (85%+)', color: '#10B981' },
    { level: 'medium', label: 'Medium (60-84%)', color: '#F59E0B' },
    { level: 'low', label: 'Low (<60%)', color: '#EF4444' },
  ];

  return (
    <div className="flex items-center gap-4 text-xs">
      {levels.map(({ level, label, color }) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-neutral-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
