'use client';

import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  snapPoints?: number[]; // Heights in vh units
  initialSnap?: number;  // Index of snapPoints
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  snapPoints = [85],
  initialSnap = 0,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart(clientY);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStart === null) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStart;

    // If dragging down more than 100px, close
    if (deltaY > 100) {
      onClose();
      setDragStart(null);
    }
  };

  const handleDragEnd = () => {
    setDragStart(null);
  };

  if (!mounted || !isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] z-50 transition-transform duration-300 ease-out"
        style={{
          borderTopLeftRadius: 'var(--radius-2xl)',
          borderTopRightRadius: 'var(--radius-2xl)',
          maxHeight: `${snapPoints[currentSnap]}vh`,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-[var(--bg-elevated)] rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bg-tertiary)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-tertiary)]" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: `${snapPoints[currentSnap] - 15}vh` }}>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
