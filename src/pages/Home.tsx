import { Moon, Target, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrayerTracking, type DailyPrayers } from '@/hooks/usePrayerTracking';
import { useHabitsTracking, habitCategories, levelHabits } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress, getActionLabel } from '@/hooks/useMissions';
import { Progress } from '@/components/ui/progress';
import { DateHeader } from '@/components/DateHeader';
import { QuickActionsFAB } from '@/components/QuickActionsFAB';
import { useTranslation } from '@/lib/i18n';
import { haptics } from '@/lib/haptics';

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const MAX_CHIPS = 6;

export default function Home() {
  const { t, tHabit, lang } = useTranslation();
  const navigate = useNavigate();
  const { prayers, markPrayer } = usePrayerTracking();
  const {
    completedHabits,
    pausedHabits,
    level,
    toggleHabit,
  } = useHabitsTracking();
  const { missions } = useMissions();

  // Pending prayers today
  const pendingPrayers = PRAYER_KEYS.filter((p) => prayers[p].status === 'pending');

  // Active (tracked) habits not completed
  const trackedHabitIds = level === 'custom'
    ? habitCategories.flatMap((c) => c.habits.map((h) => h.id)).filter((id) => !pausedHabits.has(id))
    : levelHabits[level].filter((id) => !pausedHabits.has(id));
  const pendingHabits = trackedHabitIds.filter((id) => !completedHabits.has(id));

  type Chip =
    | { kind: 'prayer'; key: keyof DailyPrayers; label: string }
    | { kind: 'habit'; id: string; label: string };

  const allChips: Chip[] = [
    ...pendingPrayers.map((p) => ({
      kind: 'prayer' as const,
      key: p,
      label: t(`prayerNames.${p}` as any),
    })),
    ...pendingHabits.map((id) => ({
      kind: 'habit' as const,
      id,
      label: tHabit(id),
    })),
  ];

  const allDone = allChips.length === 0;
  const visibleChips = allChips.slice(0, MAX_CHIPS - 1);
  const overflow = allChips.length - visibleChips.length;
  const showOverflowChip = overflow > 0;

  const handlePrayerChip = (p: keyof DailyPrayers) => {
    haptics.light();
    markPrayer(p, 'on-time');
  };

  const handleHabitChip = (id: string) => {
    haptics.light();
    toggleHabit(id);
  };

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-elevated mb-4">
          <Moon className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Assalamu Alaikum
        </h1>
        <p className="text-muted-foreground text-sm">{t('home.subtitle')}</p>
        <div className="mt-3">
          <DateHeader />
        </div>
      </div>

      {/* Right now card */}
      <div className="rounded-2xl gradient-card shadow-card border border-border/50 p-5">
        <h2 className="font-display text-base font-semibold text-foreground/90 mb-3">
          {t('home.rightNow')}
        </h2>

        {allDone ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 mb-2 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground/90">{t('home.dayComplete')}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleChips.map((c) =>
              c.kind === 'prayer' ? (
                <button
                  key={`p-${c.key}`}
                  onClick={() => handlePrayerChip(c.key)}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  {c.label}
                </button>
              ) : (
                <button
                  key={`h-${c.id}`}
                  onClick={() => handleHabitChip(c.id)}
                  className="px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground text-sm border border-accent/20 hover:bg-accent/15 transition-colors"
                >
                  {c.label}
                </button>
              ),
            )}
            {showOverflowChip && (
              <button
                onClick={() => navigate(pendingPrayers.length > 0 ? '/prayers' : '/habits')}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm border border-border hover:bg-muted/80 transition-colors"
              >
                {t('home.moreItems').replace('{n}', String(overflow))}
              </button>
            )}
          </div>
        )}
      </div>

      {missions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground/80">
              {t('missions.active')}
            </h3>
            <Link to="/missions" className="text-xs text-primary">
              {t('missions.title')} →
            </Link>
          </div>
          {missions.slice(0, 2).map((m) => {
            const p = computeProgress(m);
            const pct = Math.min(100, (p.progress / m.days) * 100);
            const label = getActionLabel(m, t, tHabit, lang);
            return (
              <Link
                key={m.id}
                to="/missions"
                className="block p-3 rounded-xl border border-border bg-card hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm text-foreground truncate">
                    {t('missions.iIntendTo')}{' '}
                    <span className="text-primary font-medium">{label}</span>{' '}
                    {t('missions.for')} {m.days} {t('missions.days')}
                  </p>
                </div>
                <Progress value={pct} className="h-1.5" />
              </Link>
            );
          })}
        </div>
      )}

      <QuickActionsFAB />
    </div>
  );
}
