import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface CompletionCelebrationProps {
  show: boolean;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * A quiet beat of acknowledgement — soft scale/fade, brief haptics.
 * No confetti, no looping spin.
 */
export function CompletionCelebration({
  show,
  onDismiss,
  durationMs = 1800,
}: CompletionCelebrationProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!show) return;
    haptics.medium();
    const dismiss = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(dismiss);
  }, [show, onDismiss, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.25 }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.98, opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="relative flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-8 py-8 shadow-elevated"
          >
            <div className="rounded-full bg-primary/10 p-3.5">
              <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.75} />
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-semibold text-foreground">
                MashaAllah
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground" dir="rtl">
                ما شاء الله
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
