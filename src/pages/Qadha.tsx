import { Header } from '@/components/Header';
import { PrayerCard } from '@/components/PrayerCard';
import { EstimateCard } from '@/components/EstimateCard';
import { useQadhaPrayers, PrayerCounts } from '@/hooks/useQadhaPrayers';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const prayerInfo: { key: keyof PrayerCounts; name: string; arabicName: string }[] = [
  { key: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { key: 'asr', name: 'Asr', arabicName: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { key: 'isha', name: 'Isha', arabicName: 'العشاء' },
];

export default function Qadha() {
  const {
    counts,
    dailyGoal,
    setDailyGoal,
    increment,
    decrement,
    setCount,
    reset,
    resetAll,
    totalPrayers,
    calculateDaysToComplete,
  } = useQadhaPrayers();

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Qadha böner
        </h2>
        <p className="text-muted-foreground text-sm">
          Håll koll på dina missade böner
        </p>
      </div>

      {/* Estimate Card */}
      <div className="mb-6">
        <EstimateCard
          totalPrayers={totalPrayers}
          dailyGoal={dailyGoal}
          daysToComplete={calculateDaysToComplete()}
          onGoalChange={setDailyGoal}
        />
      </div>

      {/* Prayer Cards */}
      <div className="space-y-4">
        {prayerInfo.map((prayer, index) => (
          <PrayerCard
            key={prayer.key}
            name={prayer.name}
            arabicName={prayer.arabicName}
            count={counts[prayer.key]}
            onIncrement={() => increment(prayer.key)}
            onDecrement={() => decrement(prayer.key)}
            onReset={() => reset(prayer.key)}
            onSetCount={(count) => setCount(prayer.key, count)}
            delay={index * 50}
          />
        ))}
      </div>

      {/* Reset All Button */}
      <div className="flex justify-center pt-6">
        <Button
          variant="outline"
          onClick={resetAll}
          className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          disabled={totalPrayers === 0}
        >
          <RotateCcw className="h-4 w-4" />
          Återställ alla räknare
        </Button>
      </div>
    </div>
  );
}
