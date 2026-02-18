"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, Phone, MessageSquare, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MayaStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  isOnline?: boolean;
  isOnCall?: boolean;
  callsToday?: number;
  messagesHandled?: number;
  onToggle?: () => void;
  loading?: boolean;
}

export function MayaStatus({
  className,
  isOnline = false,
  isOnCall = false,
  callsToday = 0,
  messagesHandled = 0,
  onToggle,
  loading = false,
  ...props
}: MayaStatusProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "p-6 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]",
          className
        )}
        {...props}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-bg-elevated)] animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-24 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
              <div className="h-3 w-16 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded bg-[var(--color-bg-elevated)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 rounded-xl border transition-all",
        isOnCall
          ? "bg-[var(--color-success-muted)] border-[var(--color-success)]"
          : "bg-[var(--color-bg-surface)] border-[var(--color-border-default)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-xl",
              isOnline
                ? "bg-[var(--color-accent-purple-subtle)]"
                : "bg-[var(--color-bg-elevated)]"
            )}
          >
            <Bot
              className={cn(
                "h-6 w-6",
                isOnline
                  ? "text-[var(--color-accent-purple)]"
                  : "text-[var(--color-text-tertiary)]"
              )}
            />
            {/* Status indicator */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-bg-surface)]",
                isOnline ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              Maya AI
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {isOnCall ? (
                <span className="flex items-center gap-1 text-[var(--color-success)]">
                  <Phone className="h-3 w-3 animate-pulse" />
                  On a call...
                </span>
              ) : isOnline ? (
                "Online & Ready"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
        {onToggle && (
          <Button
            variant={isOnline ? "secondary" : "primary"}
            size="sm"
            onClick={onToggle}
            className="gap-2"
          >
            {isOnline ? (
              <>
                <MicOff className="h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Enable
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-default)]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-cyan-subtle)]">
            <Phone className="h-4 w-4 text-[var(--color-accent-cyan)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {callsToday}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Calls today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-purple-subtle)]">
            <MessageSquare className="h-4 w-4 text-[var(--color-accent-purple)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {messagesHandled}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MayaStatus;
