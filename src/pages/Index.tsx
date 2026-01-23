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

const Index = () => {
  const {
    counts,
    dailyGoal,
    setDailyGoal,
    increment,
    decrement,
    reset,
    resetAll,
    totalPrayers,
    calculateDaysToComplete,
  } = useQadhaPrayers();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 pb-12">
        <Header />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Prayer Cards */}
          <div className="md:col-span-2 lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {prayerInfo.map((prayer, index) => (
              <PrayerCard
                key={prayer.key}
                name={prayer.name}
                arabicName={prayer.arabicName}
                count={counts[prayer.key]}
                onIncrement={() => increment(prayer.key)}
                onDecrement={() => decrement(prayer.key)}
                onReset={() => reset(prayer.key)}
                delay={index * 50}
              />
            ))}

            {/* Reset All Button */}
            <div className="sm:col-span-2 lg:col-span-2 flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={resetAll}
                className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                disabled={totalPrayers === 0}
              >
                <RotateCcw className="h-4 w-4" />
                Reset All Counts
              </Button>
            </div>
          </div>

          {/* Estimate Card */}
          <div className="md:col-span-2 lg:col-span-1">
            <EstimateCard
              totalPrayers={totalPrayers}
              dailyGoal={dailyGoal}
              daysToComplete={calculateDaysToComplete()}
              onGoalChange={setDailyGoal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
