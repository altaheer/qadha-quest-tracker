import { useEffect, useState } from 'react';
import { Plus, Moon, RotateCcw, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { usePrayerTracking } from '@/hooks/usePrayerTracking';
import { useTranslation } from '@/lib/i18n';

export function QuickActionsFAB() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const { markPrayer } = usePrayerTracking();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > 80) setVisible(false);
      else if (y < lastY - 6) setVisible(true);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const actions = [
    { label: t('fab.markFajr'), icon: Moon, onClick: () => { markPrayer('fajr', 'on-time'); haptics.medium(); setOpen(false); } },
    { label: t('fab.addQadha'), icon: RotateCcw, onClick: () => { setOpen(false); navigate('/qadha'); } },
    { label: t('fab.logHabit'), icon: BookOpen, onClick: () => { setOpen(false); navigate('/habits'); } },
  ];

  return (
    <div
      className={cn(
        'fixed right-4 z-40 md:hidden transition-all duration-300',
        'bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.75rem)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-16 right-0 flex flex-col items-end gap-2"
          >
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex items-center gap-2 bg-card text-card-foreground shadow-elevated rounded-full pl-4 pr-3 py-2 tap-target border border-border/50"
              >
                <span className="text-sm font-medium whitespace-nowrap">{a.label}</span>
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <a.icon className="h-4 w-4 text-primary" />
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { haptics.light(); setOpen((v) => !v); }}
        className="w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-elevated flex items-center justify-center"
        aria-label={t('fab.quickActions')}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
