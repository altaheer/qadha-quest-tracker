import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserPrefs, Theme } from '@/hooks/useUserPrefs';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useUserPrefs();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/50">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => { haptics.light(); setTheme(opt.value); }}
            aria-label={opt.label}
            aria-pressed={active}
            className={cn(
              'relative tap-target px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-toggle-pill"
                className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={opt.value + (active ? '-on' : '-off')}
                initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
              >
                <Icon className="h-4 w-4" />
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
