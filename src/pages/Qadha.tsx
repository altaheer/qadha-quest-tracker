import { Header } from '@/components/Header';
import { PrayerCard } from '@/components/PrayerCard';
import { EstimateCard } from '@/components/EstimateCard';
import { useQadhaPrayers, PrayerCounts } from '@/hooks/useQadhaPrayers';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Qadha() {
  const { t } = useTranslation();
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

  const prayerInfo: { key: keyof PrayerCounts; nameKey: any; arabicName: string }[] = [
    { key: 'fajr', nameKey: 'prayerNames.fajr', arabicName: 'الفجر' },
    { key: 'dhuhr', nameKey: 'prayerNames.dhuhr', arabicName: 'الظهر' },
    { key: 'asr', nameKey: 'prayerNames.asr', arabicName: 'العصر' },
    { key: 'maghrib', nameKey: 'prayerNames.maghrib', arabicName: 'المغرب' },
    { key: 'isha', nameKey: 'prayerNames.isha', arabicName: 'العشاء' },
  ];

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {t('qadha.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('qadha.subtitle')}
        </p>
      </div>

      {totalPrayers === 0 ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center mb-6">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">{t('qadha.empty')}</p>
        </div>
      ) : (
        <div className="mb-6">
          <EstimateCard
            totalPrayers={totalPrayers}
            dailyGoal={dailyGoal}
            daysToComplete={calculateDaysToComplete()}
            onGoalChange={setDailyGoal}
          />
        </div>
      )}

      <div className="space-y-4">
        {prayerInfo.map((prayer, index) => (
          <PrayerCard
            key={prayer.key}
            name={t(prayer.nameKey)}
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

      <div className="flex justify-center pt-6">
        <Button
          variant="outline"
          onClick={resetAll}
          className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          disabled={totalPrayers === 0}
        >
          <RotateCcw className="h-4 w-4" />
          {t('qadha.resetAll')}
        </Button>
      </div>
    </div>
  );
}
