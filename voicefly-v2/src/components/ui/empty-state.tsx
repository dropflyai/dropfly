"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-[var(--text-tertiary)]">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Default icon components
const NoDataIcon = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const NoResultsIcon = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

export interface EmptyStateNoDataProps
  extends Omit<EmptyStateProps, "icon" | "title"> {
  title?: string;
}

export function EmptyStateNoData({
  title = "No data yet",
  description = "Get started by creating your first item.",
  ...props
}: EmptyStateNoDataProps) {
  return (
    <EmptyState
      icon={<NoDataIcon />}
      title={title}
      description={description}
      {...props}
    />
  );
}

export interface EmptyStateNoResultsProps
  extends Omit<EmptyStateProps, "icon" | "title"> {
  title?: string;
  query?: string;
}

export function EmptyStateNoResults({
  title = "No results found",
  description,
  query,
  ...props
}: EmptyStateNoResultsProps) {
  const defaultDescription = query
    ? `We couldn't find any results for "${query}". Try adjusting your search.`
    : "We couldn't find any results. Try adjusting your filters.";

  return (
    <EmptyState
      icon={<NoResultsIcon />}
      title={title}
      description={description || defaultDescription}
      {...props}
    />
  );
}

export interface EmptyStateErrorProps
  extends Omit<EmptyStateProps, "icon" | "title"> {
  title?: string;
  onRetry?: () => void;
}

export function EmptyStateError({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry,
  action,
  ...props
}: EmptyStateErrorProps) {
  const defaultAction = onRetry ? (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Try again
    </button>
  ) : undefined;

  return (
    <EmptyState
      icon={<ErrorIcon />}
      title={title}
      description={description}
      action={action || defaultAction}
      {...props}
    />
  );
}

export default EmptyState;
