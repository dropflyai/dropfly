"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function StatCard({
  className,
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  ...props
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  if (loading) {
    return (
      <div
        className={cn(
          "p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
            <div className="h-8 w-32 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
            <div className="h-3 w-20 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-elevated)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] transition-all hover:border-[var(--color-border-strong)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {title}
          </p>
          <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && (
                <TrendingUp className="h-3 w-3 text-[var(--color-success)]" />
              )}
              {isNegative && (
                <TrendingDown className="h-3 w-3 text-[var(--color-error)]" />
              )}
              {isNeutral && (
                <Minus className="h-3 w-3 text-[var(--color-text-tertiary)]" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive && "text-[var(--color-success)]",
                  isNegative && "text-[var(--color-error)]",
                  isNeutral && "text-[var(--color-text-tertiary)]"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-purple-subtle)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
