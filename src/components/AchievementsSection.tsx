import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { Lock } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { haptics } from '@/lib/haptics';
import { useAchievements } from '@/hooks/useAchievements';
import {
  achievements,
  getAchievementName,
  getAchievementDesc,
  type Achievement,
} from '@/lib/achievements';
import { useTranslation } from '@/lib/i18n';

function IconByName({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as any)[name] || Icons.Sparkles;
  return <Cmp className={className} />;
}

export function AchievementsSection() {
  const { unlocked, newlyUnlocked, stats } = useAchievements();
  const { t, lang } = useTranslation();
  const [queue, setQueue] = useState<string[]>([]);
  const [active, setActive] = useState<Achievement | null>(null);

  // Append newly unlocked ids to the queue
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setQueue((q) => [...q, ...newlyUnlocked.filter((id) => !q.includes(id))]);
    }
  }, [newlyUnlocked]);

  // Pop next from queue
  useEffect(() => {
    if (!active && queue.length > 0) {
      const [next, ...rest] = queue;
      const ach = achievements.find((a) => a.id === next);
      if (ach) {
        setActive(ach);
        setQueue(rest);
      } else {
        setQueue(rest);
      }
    }
  }, [active, queue]);

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    haptics.medium();
    const id = window.setTimeout(() => setActive(null), 2600);
    return () => window.clearTimeout(id);
  }, [active]);

  const total = achievements.length;
  const unlockedCount = Object.keys(unlocked).length;

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t('insights.achievements')}
        </h2>
        <span className="text-xs text-muted-foreground">
          {unlockedCount} / {total} {t('insights.unlockedCount')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((a) => {
          const isUnlocked = !!unlocked[a.id];
          const isSecret = a.category === 'secret';
          const hidden = isSecret && !isUnlocked;
          return (
            <div
              key={a.id}
              className={[
                'rounded-2xl border p-3 flex flex-col items-center text-center transition-colors duration-200',
                isUnlocked
                  ? 'bg-card border-primary/30'
                  : 'bg-muted/30 border-border opacity-70',
              ].join(' ')}
            >
              <div
                className={[
                  'h-10 w-10 rounded-full flex items-center justify-center mb-2',
                  isUnlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {isUnlocked ? (
                  <IconByName name={a.icon} className="h-5 w-5" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {hidden ? '???' : getAchievementName(a, lang)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                {hidden
                  ? ''
                  : isUnlocked
                  ? getAchievementDesc(a, lang)
                  : '???'}
              </p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm px-6"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="relative flex flex-col items-center gap-4 px-7 py-8 rounded-3xl bg-card/95 border border-primary/30 shadow-elevated max-w-sm"
            >
              <motion.div
                initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="p-4 rounded-full bg-primary/15 text-primary"
              >
                <IconByName name={active.icon} className="h-10 w-10" />
              </motion.div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-primary mb-1">
                  {t('insights.achievements')}
                </p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {getAchievementName(active, lang)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {getAchievementDesc(active, lang)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
