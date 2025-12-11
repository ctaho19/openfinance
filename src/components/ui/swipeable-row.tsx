"use client";

import { useState, useRef, type ReactNode, type TouchEvent, type MouseEvent } from "react";
import { Check, Trash2 } from "lucide-react";

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  disabled?: boolean;
}

export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "Done",
  leftLabel = "Delete",
  disabled = false,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const threshold = 80;

  const handleStart = (clientX: number) => {
    if (disabled) return;
    startX.current = clientX;
    currentX.current = clientX;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    currentX.current = clientX;
    const diff = currentX.current - startX.current;
    // Limit the swipe distance
    const clampedDiff = Math.max(-120, Math.min(120, diff));
    setOffset(clampedDiff);
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);
    
    if (offset > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (offset < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    setOffset(0);
  };

  const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
  const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);

  return (
    <div className="relative overflow-hidden touch-pan-y">
      {/* Right action (swipe right reveals left side) */}
      {onSwipeRight && (
        <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-success-600">
          <div className="flex flex-col items-center gap-1 text-white">
            <Check className="h-5 w-5" />
            <span className="text-xs font-medium">{rightLabel}</span>
          </div>
        </div>
      )}
      
      {/* Left action (swipe left reveals right side) */}
      {onSwipeLeft && (
        <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-danger-600">
          <div className="flex flex-col items-center gap-1 text-white">
            <Trash2 className="h-5 w-5" />
            <span className="text-xs font-medium">{leftLabel}</span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div
        className="relative bg-theme-elevated transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : undefined 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    </div>
  );
}
