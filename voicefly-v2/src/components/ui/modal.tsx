"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  className?: string;
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

export function Modal({
  open,
  onClose,
  size = "md",
  closeOnOverlay = true,
  closeOnEscape = true,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] animate-in zoom-in-95 fade-in duration-200",
          modalSizes[size],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ModalHeader({
  className,
  onClose,
  showCloseButton = true,
  children,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between p-6 border-b border-[var(--border)]",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  );
}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <p
      className={cn("mt-1 text-sm text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 p-6 border-t border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}

export default Modal;
