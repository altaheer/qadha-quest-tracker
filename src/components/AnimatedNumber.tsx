import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  /** Intl-formatted display string. Defaults to String(value). */
  display?: string;
  className?: string;
  /** Slide direction when the value increases. */
  duration?: number;
}

/**
 * Soft opacity + slight vertical slide when a key number changes.
 * Honours prefers-reduced-motion by swapping instantly.
 */
export function AnimatedNumber({
  value,
  display,
  className,
  duration = 0.28,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const prev = useRef(value);
  const [dir, setDir] = useState(0);

  useEffect(() => {
    if (value === prev.current) return;
    setDir(value > prev.current ? 1 : -1);
    prev.current = value;
  }, [value]);

  const text = display ?? String(value);

  if (reduce) {
    return <span className={cn('tabular-nums', className)}>{text}</span>;
  }

  return (
    <span className={cn('relative inline-flex overflow-hidden tabular-nums', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, y: dir * 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dir * -8 }}
          transition={{ duration, ease: [0.32, 0.72, 0, 1] }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
