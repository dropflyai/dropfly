"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
}

export interface DropdownProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Dropdown({ children, defaultOpen = false }: DropdownProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdown();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen((prev) => !prev);
    onClick?.(e);
  };

  return (
    <button
      ref={(node) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn("inline-flex items-center", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownTrigger.displayName = "DropdownTrigger";

export interface DropdownContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function DropdownContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  ...props
}: DropdownContentProps) {
  const { open, setOpen, triggerRef } = useDropdown();
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

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        alignClasses[align],
        className
      )}
      style={{ marginTop: sideOffset }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  DropdownItemProps
>(
  (
    { className, icon, shortcut, destructive = false, children, onClick, ...props },
    ref
  ) => {
    const { setOpen } = useDropdown();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
          "focus:bg-[var(--surface-secondary)]",
          destructive
            ? "text-[var(--error)] hover:bg-[var(--error-bg)] focus:bg-[var(--error-bg)]"
            : "text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {icon && (
          <span className="w-4 h-4 shrink-0 flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="flex-1 text-left">{children}</span>
        {shortcut && (
          <span className="ml-auto text-xs text-[var(--text-tertiary)]">
            {shortcut}
          </span>
        )}
      </button>
    );
  }
);

DropdownItem.displayName = "DropdownItem";

export interface DropdownSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownSeparator({
  className,
  ...props
}: DropdownSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}

export interface DropdownLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownLabel({ className, ...props }: DropdownLabelProps) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-[var(--text-tertiary)]",
        className
      )}
      {...props}
    />
  );
}

export default Dropdown;
