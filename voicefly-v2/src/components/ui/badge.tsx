"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const badgeVariants = {
  default:
    "bg-[var(--accent)] text-[var(--accent-foreground)]",
  secondary:
    "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]",
  success:
    "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]",
  warning:
    "bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]",
  error:
    "bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]",
  info:
    "bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)]",
  outline:
    "bg-transparent border border-[var(--border)] text-[var(--text-primary)]",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-sm",
};

const dotColors = {
  default: "bg-[var(--accent-foreground)]",
  secondary: "bg-[var(--text-secondary)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  error: "bg-[var(--error)]",
  info: "bg-[var(--info)]",
  outline: "bg-[var(--text-secondary)]",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", dot = false, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
