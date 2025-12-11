"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Bottom sheet"}
        className="absolute bottom-0 left-0 right-0 bg-theme-elevated rounded-t-3xl shadow-xl animate-slide-in-up max-h-[85vh] overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-theme-tertiary" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pb-4 border-b border-theme">
            <h2 className="text-lg font-semibold text-theme-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-theme-tertiary transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-theme-muted" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 100px)" }}>
          {children}
        </div>
        
        {/* Safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
