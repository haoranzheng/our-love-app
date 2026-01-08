'use client';

import React, { useState, useRef, TouchEvent, MouseEvent } from 'react';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
  className?: string; // Should include rounded corners matching the child
  deleteColor?: string;
}

export default function SwipeToDelete({ 
  children, 
  onDelete, 
  disabled = false,
  className = "",
  deleteColor = "bg-red-500"
}: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentOffset = useRef(0);
  const DELETE_BTN_WIDTH = 80; // px

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentOffset.current = offset;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !isSwiping) return;
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - startX.current;
    
    // Calculate new offset
    let newOffset = currentOffset.current + deltaX;
    
    // Constraints
    if (newOffset > 0) newOffset = 0; // Cannot swipe right to reveal nothing
    if (newOffset < -DELETE_BTN_WIDTH) newOffset = -DELETE_BTN_WIDTH; // Max swipe left

    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (disabled || !isSwiping) return;
    setIsSwiping(false);
    
    // Threshold to snap open or close
    if (offset < -(DELETE_BTN_WIDTH / 2)) {
      setOffset(-DELETE_BTN_WIDTH);
    } else {
      setOffset(0);
    }
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e: MouseEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    currentOffset.current = offset;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (disabled || !isSwiping) return;
    if (e.buttons !== 1) { // Left click not held
        setIsSwiping(false);
        return;
    }
    const deltaX = e.clientX - startX.current;
    let newOffset = currentOffset.current + deltaX;
    
    if (newOffset > 0) newOffset = 0; 
    if (newOffset < -DELETE_BTN_WIDTH) newOffset = -DELETE_BTN_WIDTH;
    
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (isSwiping) {
        setIsSwiping(false);
        if (offset < -(DELETE_BTN_WIDTH / 2)) {
            setOffset(-DELETE_BTN_WIDTH);
        } else {
            setOffset(0);
        }
    }
  };

  const handleDeleteClick = (e: MouseEvent) => {
      e.stopPropagation();
      // Reset position first? No, wait for confirmation or action.
      // But typically we want to reset UI if delete is cancelled or handled.
      // Since we rely on parent to delete, we can just trigger it.
      // If the item is removed from DOM, this component unmounts.
      // If it stays (e.g. failed delete), we might want to close it.
      if (confirm('确定要删除吗？')) {
        onDelete();
        setOffset(0);
      }
  };

  return (
    <div 
        className={`relative overflow-hidden select-none ${className}`}
        onMouseLeave={() => { if(isSwiping) { setIsSwiping(false); setOffset(0); } }}
    >
      {/* Background Delete Button */}
      <div 
        className={`absolute right-0 top-0 bottom-0 flex items-center justify-center ${deleteColor} text-white font-bold tracking-wider cursor-pointer z-0 transition-opacity duration-200`}
        style={{ 
          width: `${DELETE_BTN_WIDTH}px`,
          opacity: offset === 0 ? 0 : 1 
        }}
        onClick={handleDeleteClick}
      >
        删除
      </div>

      {/* Foreground Content */}
      <div 
        className="relative z-10 transition-transform duration-200 ease-out h-full touch-pan-y"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}
