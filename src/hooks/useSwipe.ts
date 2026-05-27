import { useRef, TouchEvent } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  onSwipeUp,
  threshold = 60,
}: SwipeHandlers) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    start.current = null;

    if (absX > absY && absX > threshold) {
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    } else if (absY > absX && absY > threshold) {
      if (dy < 0) onSwipeUp?.();
      else onSwipeDown?.();
    }
  };

  return { onTouchStart, onTouchEnd };
}
