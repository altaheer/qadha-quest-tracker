import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyPrayerCard } from '@/components/DailyPrayerCard';
import { DailyStats } from '@/components/DailyStats';
import { DateNavigator } from '@/components/DateNavigator';
import { NafilahSection } from '@/components/NafilahSection';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { usePrayerTracking, DailyPrayers, PrayerSunnah, getComboMultiplier, getComboLabel } from '@/hooks/usePrayerTracking';
import { useNafilahTracking } from '@/hooks/useNafilahTracking';
import { haptics } from '@/lib/haptics';
import { AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMBO_THRESHOLDS = [10, 30, 50, 100];

const prayerInfo: { key: keyof DailyPrayers; name: string; arabicName: string }[] = [
  { key: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { key: 'asr', name: 'Asr', arabicName: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { key: 'isha', name: 'Isha', arabicName: 'العشاء' },
];

export default function Prayers() {
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

  const {
    nafilahPrayers,
    toggleNafilah,
    getTotalNafilahPoints,
  } = useNafilahTracking(selectedDate);

  const comboLabel = getComboLabel(combo);
  const totalPoints = getTotalPoints() + getTotalNafilahPoints();
  const completedCount = getCompletedCount();

  // Detect combo threshold crossings for color flash
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

  // Daily completion celebration
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

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <CompletionCelebration show={celebrate} onDismiss={() => setCelebrate(false)} />

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {isToday ? 'Dagens böner' : 'Böner'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isToday 
            ? 'Markera dina obligatoriska böner och sunnah'
            : 'Fyll i böner för tidigare dagar'
          }
        </p>
      </div>

      <DateNavigator 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />

      {!isToday && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30 mb-4">
          <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Backfill-läge</p>
            <p className="text-muted-foreground">
              Böner markerade som "Missad" läggs automatiskt till i Qadha.
            </p>
          </div>
        </div>
      )}

      {/* Combo indicator */}
      {combo >= 10 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/30 mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-bold text-foreground">{comboLabel}</p>
              <p className="text-xs text-muted-foreground">{combo} böner i rad</p>
            </div>
          </div>
          <div className="text-sm font-bold text-accent bg-accent/20 px-2.5 py-1 rounded-lg">
            {comboMultiplier.toFixed(1)}x
          </div>
        </div>
      )}

      <DailyStats
        totalPoints={totalPoints}
        completedPrayers={getCompletedCount()}
        totalPrayers={5}
      />

      <div className="space-y-4">
        {prayerInfo.map((prayer, index) => (
          <DailyPrayerCard
            key={prayer.key}
            name={prayer.name}
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

      <NafilahSection
        prayers={nafilahPrayers}
        onToggle={toggleNafilah}
      />
    </div>
  );
}
