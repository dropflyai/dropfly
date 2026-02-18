"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface CreditMeterProps {
  credits: number;
  maxCredits: number;
  className?: string;
  showLabel?: boolean;
}

export function CreditMeter({
  credits,
  maxCredits,
  className,
  showLabel = true,
}: CreditMeterProps) {
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-[var(--surface)] border border-[var(--border)]",
        className
      )}
    >
      <Zap
        className={cn(
          "w-4 h-4",
          isLow
            ? "text-[var(--error)]"
            : isMedium
            ? "text-[var(--warning)]"
            : "text-[var(--accent)]"
        )}
      />
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {credits.toLocaleString()}
          </span>
        )}
        <div className="w-16 h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isLow
                ? "bg-[var(--error)]"
                : isMedium
                ? "bg-[var(--warning)]"
                : "bg-[var(--accent)]"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CreditDisplay({
  credits,
  maxCredits,
  plan,
  className,
}: CreditMeterProps & { plan?: string }) {
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isLow
                ? "bg-[var(--error-bg)]"
                : isMedium
                ? "bg-[var(--warning-bg)]"
                : "bg-[var(--accent-bg)]"
            )}
          >
            <Zap
              className={cn(
                "w-4 h-4",
                isLow
                  ? "text-[var(--error)]"
                  : isMedium
                  ? "text-[var(--warning)]"
                  : "text-[var(--accent)]"
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Credits Remaining
            </p>
            {plan && (
              <p className="text-xs text-[var(--text-tertiary)]">{plan} Plan</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            {credits.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            of {maxCredits.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="w-full h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isLow
              ? "bg-[var(--error)]"
              : isMedium
              ? "bg-[var(--warning)]"
              : "bg-[var(--accent)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isLow && (
        <p className="mt-2 text-xs text-[var(--error)]">
          Low credits! Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}

export default CreditMeter;
