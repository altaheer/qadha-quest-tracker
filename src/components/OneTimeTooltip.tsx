import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

const KEY = 'seen-tooltips';

function getSeen(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function hasSeenTooltip(id: string) {
  return !!getSeen()[id];
}

export function markTooltipSeen(id: string) {
  const seen = getSeen();
  seen[id] = true;
  try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch {}
}

/** Forgets every dismissed hint, so each screen introduces itself once more. */
export function resetTooltips() {
  try { localStorage.removeItem(KEY); } catch {}
}

interface Props {
  id: string;
  show: boolean;
  title: string;
  description: string;
}

export function OneTimeTooltip({ id, show, title, description }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && !hasSeenTooltip(id)) {
      setVisible(true);
    }
  }, [show, id]);

  const dismiss = () => {
    markTooltipSeen(id);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          className="relative rounded-xl p-4 mb-4 bg-primary/10 border border-primary/30 shadow-card"
        >
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-primary/10 text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
