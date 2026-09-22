import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDateString } from '@/lib/date';
import { addDays, isFuture, isToday as isTodayFn } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyPrayerCard } from '@/components/DailyPrayerCard';
import { DateNavigator } from '@/components/DateNavigator';
import { NafilahSection } from '@/components/NafilahSection';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { JumpToTodayButton } from '@/components/JumpToTodayButton';
import { OneTimeTooltip } from '@/components/OneTimeTooltip';
import { usePrayerTracking, DailyPrayers, PrayerSunnah, getComboLabel } from '@/hooks/usePrayerTracking';
import { useNafilahTracking } from '@/hooks/useNafilahTracking';
import { useSwipe } from '@/hooks/useSwipe';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHint } from '@/components/PageHint';
import { Meter, Page, PageHeader } from '@/components/common';

const COMBO_THRESHOLDS = [10, 30, 50, 100];

const prayerInfo: { key: keyof DailyPrayers; nameKey: any; arabicName: string }[] = [
  { key: 'fajr', nameKey: 'prayerNames.fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', nameKey: 'prayerNames.dhuhr', arabicName: 'الظهر' },
  { key: 'asr', nameKey: 'prayerNames.asr', arabicName: 'العصر' },
  { key: 'maghrib', nameKey: 'prayerNames.maghrib', arabicName: 'المغرب' },
  { key: 'isha', nameKey: 'prayerNames.isha', arabicName: 'العشاء' },
];

export default function Prayers() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(() => {
    const raw = searchParams.get('date');
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const d = new Date(raw + 'T12:00:00');
      if (!Number.isNaN(d.getTime()) && !((d.getTime() > Date.now()) && getDateString(d) !== getDateString(new Date()))) {
        return d;
      }
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Keep URL in sync when navigating days so calendar deep-links stay honest.
  useEffect(() => {
    const key = getDateString(selectedDate);
    const current = searchParams.get('date');
    if (current === key) return;
    const next = new URLSearchParams(searchParams);
    const todayKey = getDateString(new Date());
    if (key === todayKey) next.delete('date');
    else next.set('date', key);
    setSearchParams(next, { replace: true });
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    prayers,
    streaks,
    sunnah,
    combo,
    comboMultiplier,
    isToday,
    markPrayer,
    toggleSunnah,
    getPoints,
    getCompletedCount,
  } = usePrayerTracking(selectedDate);

  const { nafilahPrayers, toggleNafilah } = useNafilahTracking(selectedDate);

  const completedCount = getCompletedCount();

  const prevComboRef = useRef(combo);
  const [comboFlash, setComboFlash] = useState(false);
  useEffect(() => {
    const prev = prevComboRef.current;
    if (combo > prev) {
      const crossed = COMBO_THRESHOLDS.some(t => prev < t && combo >= t);
      if (crossed) {
        setComboFlash(true);
        const id = window.setTimeout(() => setComboFlash(false), 900);
        return () => window.clearTimeout(id);
      }
    }
    prevComboRef.current = combo;
  }, [combo]);

  const [celebrate, setCelebrate] = useState(false);
  const prevCompletedRef = useRef(completedCount);
  useEffect(() => {
    const prev = prevCompletedRef.current;
    if (isToday && prev < 5 && completedCount === 5) {
      haptics.strong();
      setCelebrate(true);
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, isToday]);

  const swipe = useSwipe({
    onSwipeLeft: () => {
      const next = addDays(selectedDate, 1);
      if (!isFuture(next) || isTodayFn(next)) {
        haptics.light();
        setSelectedDate(next);
      }
    },
    onSwipeRight: () => {
      haptics.light();
      setSelectedDate((d) => addDays(d, -1));
    },
  });

  const noneMarked = Object.values(prayers).every((p: any) => p.status === 'pending');

  return (
    <Page>
     <div onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <CompletionCelebration show={celebrate} onDismiss={() => setCelebrate(false)} />
      <JumpToTodayButton show={!isToday} onClick={() => setSelectedDate(new Date())} />

      <PageHeader title={t('prayers.title')} subtitle={t('prayers.subtitle')} />

      <PageHint id="prayers" />

      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {!isToday && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/[0.07] px-3.5 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
          <div className="text-[0.8125rem] leading-snug">
            <p className="font-medium text-foreground">{t('prayers.backfillMode')}</p>
            <p className="mt-0.5 text-muted-foreground">{t('prayers.backfillDesc')}</p>
          </div>
        </div>
      )}

      <OneTimeTooltip
        id="combo-intro"
        show={combo >= 1}
        title={t('combo.firstTimeTitle')}
        description={t('combo.firstTimeDesc')}
      />

      <AnimatePresence>
        {combo >= 10 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'mb-4 flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors duration-500',
              comboFlash ? 'border-border bg-muted/60' : 'border-border/70 bg-muted/40'
            )}
          >
            <div className="flex items-center gap-2.5">
              <Zap className={cn('h-4 w-4', 'text-muted-foreground')} strokeWidth={2} />
              <div>
                <p className="text-[0.8125rem] font-semibold text-foreground">{getComboLabel(combo)}</p>
                <p className="text-xs text-muted-foreground">{combo} {t('prayers.comboLabel')}</p>
              </div>
            </div>
            <motion.div
              key={combo}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'rounded-md px-2 py-0.5 text-[0.75rem] font-medium tabular-nums',
                comboFlash ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {comboMultiplier.toFixed(1)}×
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between text-[0.8125rem]">
          <span className="text-muted-foreground">{t('prayers.title')}</span>
          <span className="font-semibold tabular-nums text-foreground">{completedCount} / 5</span>
        </div>
        <Meter value={(completedCount / 5) * 100} aria-label={t('prayers.title')} />
      </div>

      {isToday && noneMarked && (
        <p className="mb-4 rounded-xl bg-muted/60 px-4 py-3 text-center text-[0.8125rem] text-muted-foreground">
          {t('prayers.empty')}
        </p>
      )}

      <div className="space-y-2.5">
        {prayerInfo.map((prayer, index) => (
          <DailyPrayerCard
            key={prayer.key}
            name={t(prayer.nameKey)}
            arabicName={prayer.arabicName}
            status={prayers[prayer.key].status}
            streak={streaks[prayer.key]}
            points={getPoints(prayer.key)}
            comboMultiplier={comboMultiplier}
            sunnahItems={sunnah[prayer.key as keyof PrayerSunnah]}
            onMarkStatus={(status) => markPrayer(prayer.key, status)}
            onToggleSunnah={(sunnahId) => toggleSunnah(prayer.key as keyof PrayerSunnah, sunnahId)}
            delay={index * 25}
          />
        ))}
      </div>

      <NafilahSection prayers={nafilahPrayers} onToggle={toggleNafilah} />
     </div>
    </Page>
  );
}
