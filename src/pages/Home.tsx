import { useMemo } from 'react';
import { Moon, Target, BookOpen, RotateCcw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking, type DailyPrayers } from '@/hooks/usePrayerTracking';
import { useHabitsTracking, habitCategories, levelHabits } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress, getActionLabel } from '@/hooks/useMissions';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import { getDateString } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { PrayerHistory, HabitsHistory, PrayerCounts, PrayerStatus } from '@/types';

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

const localeMap: Record<string, string> = {
  en: 'en-US', sv: 'sv-SE', tr: 'tr-TR', ar: 'ar-EG',
};

type PrayerCellState = 'done' | 'missed' | 'none';

function prayerCellState(s: PrayerStatus | undefined, isPast: boolean): PrayerCellState {
  if (s === 'on-time' || s === 'jamaah' || s === 'late') return 'done';
  if (s === 'missed') return 'missed';
  if (isPast) return 'missed';
  return 'none';
}

function CardShell({
  to,
  icon: Icon,
  label,
  value,
  children,
}: {
  to: string;
  icon: typeof Moon;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl gradient-card shadow-card border border-border/50 overflow-hidden hover:shadow-elevated transition-all"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <p className="flex-1 font-display text-sm font-semibold text-foreground/90 truncate">
          {label}
        </p>
        <span className="text-base font-semibold text-foreground tabular-nums">{value}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
      {children && (
        <div className="border-t border-border/50 bg-background/30 px-2 py-2">{children}</div>
      )}
    </Link>
  );
}

function DayColumns({
  days,
  lang,
  renderBody,
}: {
  days: string[];
  lang: string;
  renderBody: (date: string, isToday: boolean) => React.ReactNode;
}) {
  const todayKey = getDateString(new Date());
  return (
    <div className="grid grid-cols-5 gap-0">
      {days.map((dk) => {
        const d = new Date(dk);
        const weekday = d.toLocaleDateString(localeMap[lang] || 'en-US', { weekday: 'short' });
        const isToday = dk === todayKey;
        return (
          <div key={dk} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                'text-[10px] capitalize leading-none',
                isToday ? 'text-primary font-semibold' : 'text-muted-foreground',
              )}
            >
              {weekday.slice(0, 3)}
            </span>
            {renderBody(dk, isToday)}
          </div>
        );
      })}
    </div>
  );
}

function PrayerHeatmap({
  days,
  grid,
  lang,
  t,
}: {
  days: string[];
  grid: Record<string, PrayerCellState[]>;
  lang: string;
  t: (k: string) => string;
}) {
  const todayKey = getDateString(new Date());
  const prayerLabels = [
    t('prayers.fajr'),
    t('prayers.dhuhr'),
    t('prayers.asr'),
    t('prayers.maghrib'),
    t('prayers.isha'),
  ];
  return (
    <div className="px-0 py-0">
      <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-0 items-center">
        {/* Header row: empty + weekday labels */}
        <span />
        {days.map((dk) => {
          const d = new Date(dk);
          const weekday = d.toLocaleDateString(localeMap[lang] || 'en-US', { weekday: 'short' });
          const isToday = dk === todayKey;
          return (
            <span
              key={dk}
              className={cn(
                'text-[10px] uppercase tracking-wide text-center leading-none py-1.5',
                isToday ? 'text-primary font-bold' : 'text-muted-foreground',
              )}
            >
              {weekday.slice(0, 2)}
            </span>
          );
        })}

        {/* One row per prayer */}
        {PRAYER_KEYS.map((_p, rowIdx) => (
          <div key={rowIdx} className="contents">
            <span className="text-[10px] font-medium text-muted-foreground/80 pr-2 text-right leading-none">
              {prayerLabels[rowIdx].slice(0, 2)}
            </span>
            {days.map((dk) => {
              const state = grid[dk][rowIdx];
              const isToday = dk === todayKey;
              return (
                <div
                  key={dk}
                  className={cn(
                    'h-8 w-full rounded-none transition-all border',
                    state === 'done' &&
                      'bg-primary border-primary/90 shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.15)]',
                    state === 'missed' &&
                      'bg-destructive/40 border-destructive/60',
                    state === 'none' &&
                      'bg-muted/70 border-border/70',
                    isToday && state === 'none' && 'ring-1 ring-inset ring-primary/50',
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { t, tHabit, lang } = useTranslation();
  const { prayers } = usePrayerTracking();
  const { getActiveCount, getCompletedCount, pausedHabits, level } = useHabitsTracking();
  const { missions } = useMissions();

  const data = useMemo(() => {
    const prayerHistory = readJSON<PrayerHistory>('prayer-history', {});
    const habitsHistory = readJSON<HabitsHistory>('habits-tracking', {});
    const qadhaCounts = readJSON<PrayerCounts>('qadha-prayer-counts', {
      fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
    });

    const todayKey = getDateString(new Date());
    const days: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(getDateString(d));
    }

    let prayersDoneToday = 0;
    const todayData = prayerHistory[todayKey];
    if (todayData) {
      PRAYER_KEYS.forEach((p) => {
        const s = todayData.prayers[p]?.status;
        if (s === 'on-time' || s === 'jamaah' || s === 'late') prayersDoneToday++;
      });
    }

    // per day, per prayer state
    const prayerGrid: Record<string, PrayerCellState[]> = {};
    days.forEach((dk) => {
      const isPast = dk < todayKey;
      const day = prayerHistory[dk];
      prayerGrid[dk] = PRAYER_KEYS.map((p) =>
        prayerCellState(day?.prayers[p]?.status, isPast),
      );
    });

    // habits: per day done / total-active-that-day
    const allIds = habitCategories.flatMap((c) => c.habits.map((h) => h.id));
    const activeHabitIds = allIds.filter((id) => {
      if (pausedHabits.has(id)) return false;
      if (level === 'custom') return true;
      return levelHabits[level].includes(id);
    });
    const totalActive = activeHabitIds.length;
    const habitGrid: Record<string, { done: number; total: number }> = {};
    days.forEach((dk) => {
      const day = habitsHistory[dk] || {};
      let done = 0;
      activeHabitIds.forEach((id) => {
        if (day[id]) done++;
      });
      habitGrid[dk] = { done, total: totalActive };
    });

    const qadhaRemaining = Object.values(qadhaCounts).reduce((a, b) => a + (b || 0), 0);

    return { days, prayersDoneToday, prayerGrid, habitGrid, qadhaRemaining };
  }, [prayers, pausedHabits, level, missions]);

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-primary shadow-elevated mb-3">
          <Moon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Assalamu Alaikum
        </h1>
        <p className="text-muted-foreground text-sm">{t('home.subtitle')}</p>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-sm font-semibold text-foreground/80">
          {t('home.summary')}
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t('home.last5days')}
        </span>
      </div>

      {/* Prayers — heatmap: rows=prayers, cols=days */}
      <CardShell
        to="/prayers"
        icon={Moon}
        label={t('nav.prayers')}
        value={`${data.prayersDoneToday}/5`}
      >
        <PrayerHeatmap days={data.days} grid={data.prayerGrid} lang={lang} t={t} />
      </CardShell>

      {/* Qadha */}
      <CardShell
        to="/qadha"
        icon={RotateCcw}
        label={t('nav.qadha')}
        value={`${data.qadhaRemaining} ${t('home.remaining')}`}
      />

      {/* Habits */}
      <CardShell
        to="/habits"
        icon={BookOpen}
        label={t('nav.habits')}
        value={`${getCompletedCount()}/${getActiveCount()}`}
      >
        <DayColumns
          days={data.days}
          lang={lang}
          renderBody={(dk) => {
            const { done, total } = data.habitGrid[dk];
            const ratio = total > 0 ? done / total : 0;
            return (
              <div
                className={cn(
                  'w-full h-8 rounded-md flex items-center justify-center text-[11px] font-semibold tabular-nums border',
                  total === 0 && 'bg-muted/40 text-muted-foreground border-border',
                  total > 0 && ratio === 0 && 'bg-destructive/10 text-destructive/80 border-destructive/20',
                  total > 0 && ratio > 0 && ratio < 0.8 && 'bg-primary/15 text-primary border-primary/30',
                  total > 0 && ratio >= 0.8 && 'bg-primary text-primary-foreground border-primary',
                )}
              >
                {total > 0 ? `${done}/${total}` : '–'}
              </div>
            );
          }}
        />
      </CardShell>

      {/* Missions — simple list, no boxes */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-sm font-semibold text-foreground/80">
            {t('missions.title')}
          </h3>
          <Link to="/missions" className="text-xs text-primary hover:underline">
            {t('missions.newMission')}
          </Link>
        </div>

        {missions.length === 0 ? (
          <Link
            to="/missions"
            className="block p-4 rounded-2xl border border-dashed border-border bg-card/40 text-center text-sm text-muted-foreground hover:border-primary/40 transition"
          >
            <Target className="h-4 w-4 inline-block me-1.5 -mt-0.5" />
            {t('missions.newMission')}
          </Link>
        ) : (
          missions.map((m) => {
            const p = computeProgress(m);
            const pct = Math.min(100, (p.progress / m.days) * 100);
            const label = getActionLabel(m, t, tHabit, lang);
            return (
              <Link
                key={m.id}
                to="/missions"
                className="block rounded-2xl gradient-card shadow-card border border-border/50 px-4 py-3 hover:shadow-elevated transition-all"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground flex-1">
                    {t('missions.iIntendTo')}{' '}
                    <span className="text-primary font-medium">{label}</span>{' '}
                    {t('missions.for')} {m.days} {t('missions.days')}
                  </p>
                  <span className="text-xs font-semibold tabular-nums text-foreground/80 shrink-0">
                    {p.progress}/{m.days}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
