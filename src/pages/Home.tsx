import { useMemo } from 'react';
import { Moon, Target, BookOpen, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking, type DailyPrayers } from '@/hooks/usePrayerTracking';
import { useHabitsTracking } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress, getActionLabel } from '@/hooks/useMissions';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import { getDateString } from '@/lib/date';
import type { PrayerHistory, HabitsHistory, PrayerCounts } from '@/types';

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function Dots({ values }: { values: number[] }) {
  // values: array of 0..1 intensity for last N days (oldest -> newest)
  return (
    <div className="flex items-center gap-1">
      {values.map((v, i) => {
        const opacity = v <= 0 ? 0.15 : 0.35 + v * 0.65;
        return (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{ opacity }}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  const { t, tHabit, lang } = useTranslation();
  const { prayers } = usePrayerTracking();
  const { getActiveCount, getCompletedCount } = useHabitsTracking();
  const { missions } = useMissions();

  const summary = useMemo(() => {
    const prayerHistory = readJSON<PrayerHistory>('prayer-history', {});
    const habitsHistory = readJSON<HabitsHistory>('habits-tracking', {});
    const qadhaCounts = readJSON<PrayerCounts>('qadha-prayer-counts', {
      fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
    });

    const days: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(getDateString(d));
    }

    // Prayers: per-day count of completed (on-time/jamaah/late) out of 5
    let prayersDone = 0;
    const prayerDots = days.map((dk) => {
      const day = prayerHistory[dk];
      if (!day) return 0;
      let c = 0;
      PRAYER_KEYS.forEach((p) => {
        const s = day.prayers[p]?.status;
        if (s === 'on-time' || s === 'jamaah' || s === 'late') c++;
      });
      prayersDone += c;
      return c / 5;
    });

    // Habits: per-day completion ratio (completed / active that day)
    const habitDots = days.map((dk) => {
      const day = habitsHistory[dk];
      if (!day) return 0;
      const vals = Object.values(day);
      if (vals.length === 0) return 0;
      const done = vals.filter(Boolean).length;
      return Math.min(1, done / Math.max(1, vals.length));
    });

    const qadhaRemaining = Object.values(qadhaCounts).reduce((a, b) => a + (b || 0), 0);

    // Missions: dot intensity = 1 if any active mission progressed that day (simplified: any prayer/habit/nafilah activity)
    const missionDots = days.map((dk) => {
      const pHist = prayerHistory[dk];
      const hHist = habitsHistory[dk];
      const any = !!(pHist || hHist);
      return any ? 0.6 : 0;
    });

    return {
      prayersDone,
      prayersMax: 25,
      prayerDots,
      habitsCompleted: getCompletedCount(),
      habitsActive: getActiveCount(),
      habitDots,
      qadhaRemaining,
      missionsActive: missions.length,
      missionDots,
    };
  }, [prayers, missions, getActiveCount, getCompletedCount]);

  const rows = [
    {
      key: 'prayers',
      to: '/prayers',
      icon: Moon,
      label: t('nav.prayers'),
      value: `${summary.prayersDone}/${summary.prayersMax}`,
      dots: summary.prayerDots,
    },
    {
      key: 'qadha',
      to: '/qadha',
      icon: RotateCcw,
      label: t('nav.qadha'),
      value: `${summary.qadhaRemaining} ${t('home.remaining')}`,
      dots: null as number[] | null,
    },
    {
      key: 'habits',
      to: '/habits',
      icon: BookOpen,
      label: t('nav.habits'),
      value: `${summary.habitsCompleted}/${summary.habitsActive}`,
      dots: summary.habitDots,
    },
    {
      key: 'missions',
      to: '/missions',
      icon: Target,
      label: t('missions.title'),
      value: `${summary.missionsActive} ${t('home.active')}`,
      dots: summary.missionDots,
    },
  ];

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-primary shadow-elevated mb-3">
          <Moon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Assalamu Alaikum
        </h1>
        <p className="text-muted-foreground text-sm">{t('home.subtitle')}</p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl gradient-card shadow-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t('home.summary')}
          </h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t('home.last5days')}
          </span>
        </div>

        <ul className="divide-y divide-border/50">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.key}>
                <Link
                  to={r.to}
                  className="flex items-center gap-3 py-2.5 -mx-1 px-1 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="flex-1 text-sm text-foreground/90 truncate">
                    {r.label}
                  </span>
                  {r.dots && <Dots values={r.dots} />}
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    {r.value}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
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
    </div>
  );
}
