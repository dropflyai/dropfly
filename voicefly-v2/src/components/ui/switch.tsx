"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

const switchSizes = {
  sm: {
    track: "w-8 h-4",
    thumb: "w-3 h-3",
    translate: "translate-x-4",
  },
  md: {
    track: "w-11 h-6",
    thumb: "w-5 h-5",
    translate: "translate-x-5",
  },
  lg: {
    track: "w-14 h-7",
    thumb: "w-6 h-6",
    translate: "translate-x-7",
  },
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      description,
      size = "md",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || React.useId();
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);

    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

    const handleClick = () => {
      if (disabled) return;

      const newChecked = !isChecked;
      if (!isControlled) {
        setUncontrolledChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    const sizeConfig = switchSizes[size];

    const switchElement = (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={switchId}
        aria-checked={isChecked}
        aria-labelledby={label ? `${switchId}-label` : undefined}
        aria-describedby={description ? `${switchId}-description` : undefined}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeConfig.track,
          isChecked
            ? "bg-[var(--accent)]"
            : "bg-[var(--surface-secondary)] border border-[var(--border)]",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
            sizeConfig.thumb,
            isChecked ? sizeConfig.translate : "translate-x-0.5",
            "mt-0.5 ml-0.5"
          )}
          style={{
            marginTop: size === "sm" ? "2px" : size === "md" ? "2px" : "2px",
            marginLeft: isChecked ? "0" : "2px",
          }}
        />
      </button>
    );

    if (!label && !description) {
      return switchElement;
    }

    return (
      <div className="flex items-start gap-3">
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <label
              id={`${switchId}-label`}
              htmlFor={switchId}
              className={cn(
                "text-sm font-medium text-[var(--text-primary)] cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={`${switchId}-description`}
              className={cn(
                "text-sm text-[var(--text-secondary)]",
                disabled && "opacity-50"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
