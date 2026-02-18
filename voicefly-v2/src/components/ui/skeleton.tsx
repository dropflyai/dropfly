"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", width, height, style, ...props }, ref) => {
    const variantClasses = {
      text: "rounded-md h-4",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-[var(--surface-secondary)]",
          variantClasses[variant],
          className
        )}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  showImage?: boolean;
  showFooter?: boolean;
}

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, lines = 3, showImage = true, showFooter = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6",
          className
        )}
        {...props}
      >
        {showImage && (
          <Skeleton
            variant="rectangular"
            className="w-full h-40 mb-4"
          />
        )}
        <Skeleton variant="text" className="w-3/4 h-5 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              className={cn(
                "h-4",
                i === lines - 1 ? "w-1/2" : "w-full"
              )}
            />
          ))}
        </div>
        {showFooter && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" className="w-24 h-4" />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
}

export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ className, rows = 5, columns = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              variant="text"
              className={cn(
                "h-4",
                i === 0 ? "w-1/4" : i === columns - 1 ? "w-16" : "flex-1"
              )}
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={cn(
              "flex items-center gap-4 p-4",
              rowIndex !== rows - 1 && "border-b border-[var(--border)]"
            )}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-1/4" : colIndex === columns - 1 ? "w-16" : "flex-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTable.displayName = "SkeletonTable";

export interface SkeletonStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: number;
}

export const SkeletonStats = React.forwardRef<HTMLDivElement, SkeletonStatsProps>(
  ({ className, cards = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4",
          cards === 2 && "grid-cols-2",
          cards === 3 && "grid-cols-3",
          cards >= 4 && "grid-cols-2 md:grid-cols-4",
          className
        )}
        {...props}
      >
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <Skeleton variant="text" className="w-1/2 h-4 mb-3" />
            <Skeleton variant="text" className="w-3/4 h-8 mb-2" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
        ))}
      </div>
    );
  }
);

SkeletonStats.displayName = "SkeletonStats";

export default Skeleton;
