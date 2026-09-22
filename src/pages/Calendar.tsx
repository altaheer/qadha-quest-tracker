import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { gregorianToHijri, hijriMonths } from '@/lib/hijri';
import { getDateString } from '@/lib/date';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { sv, enUS, tr, arSA, type Locale } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';
import { PageHint } from '@/components/PageHint';
import type { DailyPrayers, PrayerStatus } from '@/types';

const localeMap: Record<string, Locale> = { en: enUS, sv, tr, ar: arSA };

const PRAYER_KEYS: (keyof DailyPrayers)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

type DayTone = 'done' | 'missed' | 'mixed' | 'none';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function cellTone(status: PrayerStatus | undefined, isPast: boolean): 'done' | 'missed' | 'none' {
  if (status === 'ontime' || status === 'jamaah' || status === 'late') return 'done';
  if (status === 'missed') return 'missed';
  if (isPast) return 'missed';
  return 'none';
}

function summarizeDay(
  prayers: DailyPrayers | undefined,
  isPast: boolean,
): {
  tone: DayTone;
  done: number;
  statuses: Record<string, PrayerStatus | 'pending'>;
} {
  const statuses: Record<string, PrayerStatus | 'pending'> = {};
  let done = 0;
  let missed = 0;
  for (const k of PRAYER_KEYS) {
    const s = prayers?.[k]?.status;
    statuses[k] = s || 'pending';
    const tone = cellTone(s, isPast);
    if (tone === 'done') done++;
    else if (tone === 'missed') missed++;
  }
  let tone: DayTone = 'none';
  if (done === 5) tone = 'done';
  else if (done > 0 && missed > 0) tone = 'mixed';
  else if (done > 0) tone = 'mixed';
  else if (missed > 0) tone = 'missed';
  return { tone, done, statuses };
}

export default function Calendar() {
  const { t, lang } = useTranslation();
  const locale = localeMap[lang] || enUS;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Recompute when the visible month changes (cheap; reads localStorage).
  const prayerHistory = useMemo(
    () => readJSON<Record<string, { prayers?: DailyPrayers }>>('prayer-history', {}),
    [currentMonth],
  );
  const habitsHistory = useMemo(
    () => readJSON<Record<string, Record<string, boolean>>>('habits-tracking', {}),
    [currentMonth],
  );
  const pausedHabits = useMemo(() => {
    return new Set(readJSON<string[]>('habits-paused', []));
  }, [currentMonth]);

  const todayKey = getDateString(new Date());

  const weekDays = (() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), 'EEE', { locale }));
  })();

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const selectedKey = selectedDate ? getDateString(selectedDate) : null;
  const selectedHijri = selectedDate ? gregorianToHijri(selectedDate) : null;
  const selectedHijriMonth = selectedHijri ? hijriMonths[selectedHijri.month - 1] : null;
  const firstHijri = gregorianToHijri(monthStart);
  const lastHijri = gregorianToHijri(monthEnd);

  const selectedDetail = useMemo(() => {
    if (!selectedKey || !selectedDate) return null;
    const isPast = selectedKey < todayKey;
    const prayer = summarizeDay(prayerHistory[selectedKey]?.prayers, isPast);
    const habitDay = habitsHistory[selectedKey] || {};
    const habitDone = Object.entries(habitDay).filter(
      ([id, done]) => done && !pausedHabits.has(id),
    ).length;
    return { prayer, habitDone };
  }, [selectedKey, selectedDate, prayerHistory, habitsHistory, pausedHabits, todayKey]);

  return (
    <div className="p-4 pb-24">
      <div className="mx-auto max-w-lg">
        <PageHint id="calendar" />

        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale })}
            </h2>
            <p className="text-sm text-muted-foreground" dir="rtl">
              {firstHijri.month === lastHijri.month
                ? `${hijriMonths[firstHijri.month - 1]?.ar} ${firstHijri.year}`
                : `${hijriMonths[firstHijri.month - 1]?.ar} – ${hijriMonths[lastHijri.month - 1]?.ar} ${lastHijri.year}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t('calendar.today')}
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className="py-2 text-center text-xs font-medium capitalize text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayDate, idx) => {
            const key = getDateString(dayDate);
            const hijri = gregorianToHijri(dayDate);
            const inMonth = isSameMonth(dayDate, currentMonth);
            const selected = !!(selectedDate && isSameDay(dayDate, selectedDate));
            const today = isToday(dayDate);
            const isPast = key < todayKey;
            const summary = summarizeDay(prayerHistory[key]?.prayers, isPast);
            const habitDay = habitsHistory[key] || {};
            const habitDone = Object.entries(habitDay).filter(
              ([id, v]) => v && !pausedHabits.has(id),
            ).length;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(dayDate)}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg p-1 transition-colors',
                  'hover:bg-muted/50',
                  !inMonth && 'opacity-40',
                  selected && 'bg-primary text-primary-foreground hover:bg-primary',
                  today && !selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                )}
              >
                <span className={cn('text-sm font-medium', selected && 'text-primary-foreground')}>
                  {format(dayDate, 'd')}
                </span>
                <span
                  className={cn(
                    'text-[10px]',
                    selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {hijri.day}
                </span>
                <span className="mt-0.5 flex items-center gap-0.5" aria-hidden>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      summary.tone === 'done' && (selected ? 'bg-primary-foreground' : 'bg-primary'),
                      summary.tone === 'missed' &&
                        (selected ? 'bg-primary-foreground/45' : 'bg-destructive/45'),
                      summary.tone === 'mixed' && (selected ? 'bg-primary-foreground/75' : 'bg-accent'),
                      summary.tone === 'none' &&
                        (selected ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'),
                    )}
                  />
                  {habitDone > 0 && (
                    <span
                      className={cn(
                        'h-1 rounded-full',
                        selected ? 'bg-primary-foreground/65' : 'bg-primary/35',
                      )}
                      style={{ width: `${Math.min(10, 2 + habitDone)}px` }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDate && selectedHijri && selectedHijriMonth && selectedDetail && selectedKey && (
          <div className="mt-6 space-y-3 rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale })}
                </p>
                <p className="text-sm text-muted-foreground">{t('calendar.gregorian')}</p>
              </div>
              <div className="text-right" dir="rtl">
                <p className="font-display text-lg font-semibold">
                  {selectedHijri.day} {selectedHijriMonth.ar} {selectedHijri.year}
                </p>
                <p className="text-sm text-muted-foreground">{t('calendar.hijri')}</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('nav.prayers')} · {selectedDetail.prayer.done}/5
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRAYER_KEYS.map((k) => {
                  const s = selectedDetail.prayer.statuses[k];
                  const done = s === 'ontime' || s === 'jamaah' || s === 'late';
                  const missed = s === 'missed' || (selectedKey < todayKey && s === 'pending');
                  return (
                    <span
                      key={k}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[0.75rem] font-medium',
                        done && 'bg-primary/10 text-primary',
                        missed && 'bg-destructive/10 text-destructive',
                        !done && !missed && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {t(`prayerNames.${k}` as never)}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('nav.habits')} · {selectedDetail.habitDone}
              </p>
            </div>

            <Link
              to={`/prayers?date=${selectedKey}`}
              className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              {t('calendar.openInPrayers' as never)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
