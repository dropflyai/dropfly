"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away" | null;
}

const avatarSizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const statusColors = {
  online: "bg-[var(--success)]",
  offline: "bg-[var(--text-tertiary)]",
  busy: "bg-[var(--error)]",
  away: "bg-[var(--warning)]",
};

const statusSizes = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-4 h-4 border-2",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getBackgroundColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, src, alt, name, size = "md", status, ...props },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const showFallback = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0",
          avatarSizes[size],
          showFallback && name
            ? getBackgroundColor(name)
            : "bg-[var(--surface-secondary)]",
          className
        )}
        {...props}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : name ? (
          <span className="font-medium text-white select-none">
            {getInitials(name)}
          </span>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-[var(--text-tertiary)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-[var(--surface)]",
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps["size"];
  children: React.ReactNode;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = "md", children, ...props }, ref) => {
    const avatars = React.Children.toArray(children);
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    const overlapSizes = {
      xs: "-space-x-2",
      sm: "-space-x-2.5",
      md: "-space-x-3",
      lg: "-space-x-4",
      xl: "-space-x-5",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", overlapSizes[size], className)}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className="ring-2 ring-[var(--surface)] rounded-full"
          >
            {React.isValidElement<AvatarProps>(avatar)
              ? React.cloneElement(avatar, { size })
              : avatar}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-medium ring-2 ring-[var(--surface)]",
              avatarSizes[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export default Avatar;
