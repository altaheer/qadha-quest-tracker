import { useMemo } from 'react';
import { Moon, Target, BookOpen, RotateCcw, Check, X, Minus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking, type DailyPrayers } from '@/hooks/usePrayerTracking';
import { useHabitsTracking } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress, getActionLabel } from '@/hooks/useMissions';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import { getDateString } from '@/lib/date';
import { cn } from '@/lib/utils';
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

type DayMark = 'full' | 'partial' | 'empty' | 'none';

const localeMap: Record<string, string> = {
  en: 'en-US', sv: 'sv-SE', tr: 'tr-TR', ar: 'ar-EG',
};

function FiveDayStrip({ marks, lang }: { marks: { date: string; mark: DayMark }[]; lang: string }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {marks.map(({ date, mark }) => {
        const d = new Date(date);
        const weekday = d.toLocaleDateString(localeMap[lang] || 'en-US', { weekday: 'short' });
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground capitalize leading-none">
              {weekday.slice(0, 2)}
            </span>
            <div
              className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center border transition-colors',
                mark === 'full' && 'bg-primary text-primary-foreground border-primary',
                mark === 'partial' && 'bg-primary/15 text-primary border-primary/30',
                mark === 'empty' && 'bg-destructive/10 text-destructive/70 border-destructive/20',
                mark === 'none' && 'bg-muted/40 text-muted-foreground border-border',
              )}
            >
              {mark === 'full' && <Check className="h-4 w-4" strokeWidth={3} />}
              {mark === 'partial' && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {mark === 'empty' && <X className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {mark === 'none' && <Minus className="h-3 w-3" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SummaryCardProps {
  to: string;
  icon: typeof Moon;
  label: string;
  value: string;
  marks: { date: string; mark: DayMark }[];
  lang: string;
}

function SummaryCard({ to, icon: Icon, label, value, marks, lang }: SummaryCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-2xl gradient-card shadow-card border border-border/50 p-4 hover:shadow-elevated transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-semibold text-foreground/90 truncate">
            {label}
          </p>
        </div>
        <span className="text-base font-semibold text-foreground tabular-nums">
          {value}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
      <FiveDayStrip marks={marks} lang={lang} />
    </Link>
  );
}

export default function Home() {
  const { t, tHabit, lang } = useTranslation();
  const { prayers } = usePrayerTracking();
  const { getActiveCount, getCompletedCount } = useHabitsTracking();
  const { missions } = useMissions();

  const data = useMemo(() => {
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

    let prayersDone = 0;
    const prayerMarks = days.map((dk) => {
      const day = prayerHistory[dk];
      if (!day) return { date: dk, mark: 'none' as DayMark };
      let c = 0;
      PRAYER_KEYS.forEach((p) => {
        const s = day.prayers[p]?.status;
        if (s === 'on-time' || s === 'jamaah' || s === 'late') c++;
      });
      prayersDone += c;
      const mark: DayMark = c === 5 ? 'full' : c >= 3 ? 'partial' : c > 0 ? 'partial' : 'empty';
      return { date: dk, mark };
    });

    const habitMarks = days.map((dk) => {
      const day = habitsHistory[dk];
      if (!day) return { date: dk, mark: 'none' as DayMark };
      const vals = Object.values(day);
      const done = vals.filter(Boolean).length;
      if (done === 0) return { date: dk, mark: 'empty' as DayMark };
      if (vals.length > 0 && done >= vals.length * 0.8) return { date: dk, mark: 'full' as DayMark };
      return { date: dk, mark: 'partial' as DayMark };
    });

    // Qadha: mark a day "full" if user logged any qadha that day (we don't have history, so neutral)
    const qadhaMarks = days.map((dk) => ({ date: dk, mark: 'none' as DayMark }));

    // Missions: mark days within an active mission window
    const missionMarks = days.map((dk) => {
      if (missions.length === 0) return { date: dk, mark: 'none' as DayMark };
      const inAny = missions.some((m) => {
        const start = new Date(m.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + m.days - 1);
        const d = new Date(dk);
        return d >= start && d <= end;
      });
      return { date: dk, mark: inAny ? 'full' as DayMark : 'none' as DayMark };
    });

    const qadhaRemaining = Object.values(qadhaCounts).reduce((a, b) => a + (b || 0), 0);

    return {
      prayersDone,
      prayerMarks,
      habitMarks,
      qadhaMarks,
      missionMarks,
      qadhaRemaining,
    };
  }, [prayers, missions]);

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

      <SummaryCard
        to="/prayers"
        icon={Moon}
        label={t('nav.prayers')}
        value={`${data.prayersDone}/25`}
        marks={data.prayerMarks}
        lang={lang}
      />

      <SummaryCard
        to="/qadha"
        icon={RotateCcw}
        label={t('nav.qadha')}
        value={`${data.qadhaRemaining} ${t('home.remaining')}`}
        marks={data.qadhaMarks}
        lang={lang}
      />

      <SummaryCard
        to="/habits"
        icon={BookOpen}
        label={t('nav.habits')}
        value={`${getCompletedCount()}/${getActiveCount()}`}
        marks={data.habitMarks}
        lang={lang}
      />

      <SummaryCard
        to="/missions"
        icon={Target}
        label={t('missions.title')}
        value={`${missions.length} ${t('home.active')}`}
        marks={data.missionMarks}
        lang={lang}
      />

      {missions.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="font-display text-sm font-semibold text-foreground/80 px-1">
            {t('missions.active')}
          </h3>
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
