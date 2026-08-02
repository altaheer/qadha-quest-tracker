import { useMemo } from 'react';
import { BookOpen, Check, Moon, RotateCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking, type DailyPrayers } from '@/hooks/usePrayerTracking';
import { useHabitsTracking, habitCategories, levelHabits } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress, getActionLabel } from '@/hooks/useMissions';
import { useTranslation } from '@/lib/i18n';
import { getDateString, localeFor } from '@/lib/date';
import { PageHint } from '@/components/PageHint';
import { cn } from '@/lib/utils';
import {
  Chip,
  Meter,
  Page,
  Panel,
  PanelBody,
  PanelHeader,
  SectionLabel,
  Stat,
} from '@/components/common';
import type { PrayerHistory, HabitsHistory, PrayerCounts, PrayerStatus } from '@/types';

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const DAYS_SHOWN = 5;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

type PrayerCellState = 'done' | 'missed' | 'none';

function prayerCellState(s: PrayerStatus | undefined, isPast: boolean): PrayerCellState {
  if (s === 'ontime' || s === 'jamaah' || s === 'late') return 'done';
  if (s === 'missed') return 'missed';
  if (isPast) return 'missed';
  return 'none';
}

/**
 * Five days of prayers as a compact grid — rows are prayers, columns are days,
 * today on the right. Reads as texture rather than as data to be decoded.
 */
function PrayerGrid({
  days,
  grid,
  lang,
  labels,
}: {
  days: string[];
  grid: Record<string, PrayerCellState[]>;
  lang: string;
  labels: string[];
}) {
  const todayKey = getDateString(new Date());
  return (
    <div className="grid grid-cols-[2.25rem_repeat(5,1fr)] gap-x-1 gap-y-1">
      <span aria-hidden />
      {days.map((dk) => {
        const isToday = dk === todayKey;
        const weekday = new Date(dk).toLocaleDateString(localeFor(lang), { weekday: 'short' });
        return (
          <span
            key={dk}
            className={cn(
              'pb-1 text-center text-[0.6875rem] font-medium leading-none',
              isToday ? 'text-primary' : 'text-muted-foreground/70',
            )}
          >
            {weekday.slice(0, 2)}
          </span>
        );
      })}

      {PRAYER_KEYS.map((prayer, row) => (
        <div key={prayer} className="contents">
          <span className="self-center pe-1 text-end text-[0.6875rem] leading-none text-muted-foreground/70">
            {labels[row].slice(0, 3)}
          </span>
          {days.map((dk) => {
            const state = grid[dk][row];
            return (
              <span
                key={dk}
                title={`${labels[row]} · ${dk}`}
                className={cn(
                  'h-6 rounded-[5px] transition-colors duration-base ease-brand',
                  state === 'done' && 'bg-primary',
                  state === 'missed' && 'bg-destructive/25',
                  state === 'none' && 'bg-muted',
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { t, tHabit, lang } = useTranslation();
  const { prayers } = usePrayerTracking();
  const { getActiveCount, getCompletedCount, pausedHabits, level } = useHabitsTracking();
  const { missions } = useMissions();

  const prayerLabels = PRAYER_KEYS.map((p) => t(`prayerNames.${p}` as never));

  const data = useMemo(() => {
    const prayerHistory = readJSON<PrayerHistory>('prayer-history', {});
    const habitsHistory = readJSON<HabitsHistory>('habits-tracking', {});
    const qadhaCounts = readJSON<PrayerCounts>('qadha-prayer-counts', {
      fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0,
    });

    const todayKey = getDateString(new Date());
    // Oldest → newest, so today sits on the right edge where the eye ends up.
    const days: string[] = [];
    for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(getDateString(d));
    }

    const todayData = prayerHistory[todayKey];
    let prayersDoneToday = 0;
    PRAYER_KEYS.forEach((p) => {
      const s = todayData?.prayers[p]?.status;
      if (s === 'ontime' || s === 'jamaah' || s === 'late') prayersDoneToday++;
    });

    const pendingPrayersToday = PRAYER_KEYS.filter((p) => {
      const s = todayData?.prayers[p]?.status;
      return !s || s === 'pending';
    });

    const prayerGrid: Record<string, PrayerCellState[]> = {};
    days.forEach((dk) => {
      const day = prayerHistory[dk];
      prayerGrid[dk] = PRAYER_KEYS.map((p) => prayerCellState(day?.prayers[p]?.status, dk < todayKey));
    });

    const allIds = habitCategories.flatMap((c) => c.habits.map((h) => h.id));
    const activeHabitIds = allIds.filter((id) => {
      if (pausedHabits.has(id)) return false;
      if (level === 'custom') return true;
      return levelHabits[level].includes(id);
    });
    const habitGrid: Record<string, { done: number; total: number }> = {};
    days.forEach((dk) => {
      const day = habitsHistory[dk] || {};
      habitGrid[dk] = {
        done: activeHabitIds.filter((id) => day[id]).length,
        total: activeHabitIds.length,
      };
    });

    const qadhaRemaining = Object.values(qadhaCounts).reduce((a, b) => a + (b || 0), 0);

    return { days, prayersDoneToday, pendingPrayersToday, prayerGrid, habitGrid, qadhaRemaining };
  }, [prayers, pausedHabits, level]);

  const habitsDone = getCompletedCount();
  const habitsTotal = getActiveCount();
  const habitsRemaining = Math.max(0, habitsTotal - habitsDone);
  const dayComplete = data.pendingPrayersToday.length === 0 && habitsRemaining === 0;

  return (
    <Page className="space-y-3">
      <p className="pb-1 text-sm text-muted-foreground">{t('home.subtitle')}</p>

      <PageHint id="home" />

      {/* The backlog — the reason the app exists, so it leads. */}
      <Panel to="/qadha" className="animate-rise">
        <div className="flex items-center gap-4 px-5 pb-5 pt-5">
          <Stat
            className="flex-1"
            size="lg"
            tone={data.qadhaRemaining === 0 ? 'muted' : 'primary'}
            value={data.qadhaRemaining.toLocaleString(localeFor(lang))}
            label={t('qadha.totalRemaining')}
          />
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
      </Panel>

      {/* What is still open today. */}
      <Panel className="animate-rise">
        <PanelHeader
          icon={dayComplete ? Check : Moon}
          label={t('home.today')}
          value={`${data.prayersDoneToday}/5`}
        />
        <PanelBody>
          {dayComplete ? (
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
              {t('home.dayComplete')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.pendingPrayersToday.map((p) => (
                <Chip key={p} to="/prayers" tone="accent">
                  {t(`prayerNames.${p}` as never)}
                </Chip>
              ))}
              {habitsRemaining > 0 && (
                <Chip to="/habits">
                  {habitsRemaining} {t('nav.habits').toLowerCase()}
                </Chip>
              )}
            </div>
          )}
        </PanelBody>
      </Panel>

      <SectionLabel trailing={t('home.last5days')}>{t('home.summary')}</SectionLabel>

      <Panel to="/prayers">
        <PanelHeader icon={Moon} label={t('nav.prayers')} navigates />
        <PanelBody>
          <PrayerGrid days={data.days} grid={data.prayerGrid} lang={lang} labels={prayerLabels} />
        </PanelBody>
      </Panel>

      <Panel to="/habits">
        <PanelHeader
          icon={BookOpen}
          label={t('nav.habits')}
          value={`${habitsDone}/${habitsTotal}`}
          navigates
        />
        <PanelBody>
          <div className="grid grid-cols-5 gap-1">
            {data.days.map((dk) => {
              const { done, total } = data.habitGrid[dk];
              const ratio = total > 0 ? done / total : 0;
              const weekday = new Date(dk).toLocaleDateString(localeFor(lang), { weekday: 'short' });
              return (
                <div key={dk} className="flex flex-col items-center gap-1">
                  <span className="text-[0.6875rem] leading-none text-muted-foreground/70">
                    {weekday.slice(0, 2)}
                  </span>
                  <span
                    className={cn(
                      'flex h-8 w-full items-center justify-center rounded-lg text-[0.6875rem] font-semibold tabular-nums transition-colors duration-base ease-brand',
                      total === 0 && 'bg-muted text-muted-foreground/60',
                      total > 0 && ratio === 0 && 'bg-muted text-muted-foreground',
                      total > 0 && ratio > 0 && ratio < 0.8 && 'bg-primary/15 text-primary',
                      total > 0 && ratio >= 0.8 && 'bg-primary text-primary-foreground',
                    )}
                  >
                    {total > 0 ? done : '–'}
                  </span>
                </div>
              );
            })}
          </div>
        </PanelBody>
      </Panel>

      {missions.length > 0 && (
        <>
          <SectionLabel>{t('missions.title')}</SectionLabel>
          <div className="space-y-3">
            {missions.map((m) => {
              const p = computeProgress(m);
              const pct = Math.min(100, (p.progress / m.days) * 100);
              const label = getActionLabel(m, t, tHabit, lang);
              return (
                <Panel key={m.id} to="/missions">
                  <div className="px-4 py-3.5">
                    <div className="mb-2.5 flex items-start gap-2.5">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                      <p className="flex-1 text-[0.8125rem] leading-snug text-foreground">
                        {t('missions.iIntendTo')}{' '}
                        <span className="font-medium text-primary">{label}</span>{' '}
                        {t('missions.for')} {m.days} {t('missions.days')}
                      </p>
                      <span className="shrink-0 text-[0.8125rem] font-semibold tabular-nums text-muted-foreground">
                        {p.progress}/{m.days}
                      </span>
                    </div>
                    <Meter value={pct} aria-label={label} />
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}

      {missions.length === 0 && (
        <Link
          to="/missions"
          className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-4 text-[0.8125rem] text-muted-foreground transition-colors duration-base ease-brand hover:border-primary/40 hover:text-foreground"
        >
          <Target className="h-4 w-4" strokeWidth={1.75} />
          {t('missions.newMission')}
        </Link>
      )}
    </Page>
  );
}
