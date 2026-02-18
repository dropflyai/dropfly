"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  onValueChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  label?: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Select({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ open, setOpen, value, onValueChange: handleValueChange, triggerRef }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, placeholder = "Select an option", children, ...props }, ref) => {
  const { open, setOpen, value, triggerRef } = useSelect();

  return (
    <button
      ref={(node) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--accent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        !value && "text-[var(--text-tertiary)]",
        className
      )}
      onClick={() => setOpen((prev) => !prev)}
      {...props}
    >
      <span className="truncate">
        {children || (value ? value : placeholder)}
      </span>
      <svg
        className={cn(
          "w-4 h-4 ml-2 shrink-0 text-[var(--text-tertiary)] transition-transform",
          open && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
});

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelect();
  return <>{value || placeholder}</>;
}

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectContent({
  className,
  children,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef } = useSelect();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, value: itemValue, children, ...props }, ref) => {
    const { value, onValueChange } = useSelect();
    const isSelected = value === itemValue;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
          "text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] focus:bg-[var(--surface-secondary)]",
          "disabled:pointer-events-none disabled:opacity-50",
          isSelected && "bg-[var(--accent-bg)] text-[var(--accent)]",
          className
        )}
        onClick={() => onValueChange(itemValue)}
        {...props}
      >
        <span className="flex-1 text-left">{children}</span>
        {isSelected && (
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
    );
  }
);

SelectItem.displayName = "SelectItem";

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function SelectGroup({
  className,
  label,
  children,
  ...props
}: SelectGroupProps) {
  return (
    <div className={cn("py-1", className)} role="group" {...props}>
      {label && (
        <div className="px-2 py-1.5 text-xs font-semibold text-[var(--text-tertiary)]">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export interface SelectSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}

export default Select;
