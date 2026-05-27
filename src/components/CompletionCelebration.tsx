import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface CompletionCelebrationProps {
  show: boolean;
  onDismiss: () => void;
  durationMs?: number;
}

export function CompletionCelebration({
  show,
  onDismiss,
  durationMs = 2000,
}: CompletionCelebrationProps) {
  useEffect(() => {
    if (!show) return;

    // Subtle confetti burst
    const fire = () => {
      confetti({
        particleCount: 60,
        spread: 70,
        startVelocity: 35,
        gravity: 0.9,
        scalar: 0.9,
        origin: { y: 0.55 },
        ticks: 120,
      });
    };
    fire();
    const second = window.setTimeout(fire, 250);
    const dismiss = window.setTimeout(onDismiss, durationMs);

    return () => {
      window.clearTimeout(second);
      window.clearTimeout(dismiss);
    };
  }, [show, onDismiss, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative flex flex-col items-center gap-4 px-8 py-10 rounded-3xl bg-card/95 border border-primary/30 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4 rounded-full bg-primary/15"
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                MashaAllah!
              </p>
              <p className="text-xs text-primary mt-2" dir="rtl">
                ما شاء الله
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
