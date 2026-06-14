import { useEffect, useRef, useState } from 'react';
import { addDays, isFuture, isToday as isTodayFn } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyPrayerCard } from '@/components/DailyPrayerCard';
import { Progress } from '@/components/ui/progress';
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
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    getTotalPoints,
    getCompletedCount,
  } = usePrayerTracking(selectedDate);

  const { nafilahPrayers, toggleNafilah, getTotalNafilahPoints } = useNafilahTracking(selectedDate);

  const totalPoints = getTotalPoints() + getTotalNafilahPoints();
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
    <div
      className="container max-w-lg mx-auto px-4 py-6"
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <CompletionCelebration show={celebrate} onDismiss={() => setCelebrate(false)} />
      <JumpToTodayButton show={!isToday} onClick={() => setSelectedDate(new Date())} />

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {t('prayers.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('prayers.subtitle')}
        </p>
      </div>

      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {!isToday && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30 mb-4">
          <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">{t('prayers.backfillMode')}</p>
            <p className="text-muted-foreground">{t('prayers.backfillDesc')}</p>
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
            animate={{ opacity: 1, y: 0, scale: comboFlash ? [1, 1.04, 1] : 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl border mb-4 transition-colors duration-500',
              comboFlash ? 'bg-primary/15 border-primary/50' : 'bg-accent/10 border-accent/30'
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className={cn('h-5 w-5', comboFlash ? 'text-primary' : 'text-accent')} />
              <div>
                <p className="text-sm font-bold text-foreground">{getComboLabel(combo)}</p>
                <p className="text-xs text-muted-foreground">{combo} {t('prayers.comboLabel')}</p>
              </div>
            </div>
            <motion.div
              key={combo}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className={cn(
                'text-sm font-bold px-2.5 py-1 rounded-lg',
                comboFlash ? 'bg-primary/25 text-primary' : 'bg-accent/20 text-accent'
              )}
            >
              {comboMultiplier.toFixed(1)}x
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
          <span>{t('prayers.title')}</span>
          <span className="font-medium text-foreground">{completedCount} / 5</span>
        </div>
        <Progress value={(completedCount / 5) * 100} className="h-1.5" />
      </div>

      {isToday && noneMarked && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center mb-4">
          <p className="text-sm text-foreground">{t('prayers.empty')}</p>
        </div>
      )}

      <div className="space-y-4">
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
            delay={index * 50}
          />
        ))}
      </div>

      <NafilahSection prayers={nafilahPrayers} onToggle={toggleNafilah} />
    </div>
  );
}
