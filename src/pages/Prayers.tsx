import { useState } from 'react';
import { DailyPrayerCard } from '@/components/DailyPrayerCard';
import { DailyStats } from '@/components/DailyStats';
import { DateNavigator } from '@/components/DateNavigator';
import { usePrayerTracking, DailyPrayers, PrayerSunnah } from '@/hooks/usePrayerTracking';
import { AlertCircle } from 'lucide-react';

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
    isToday,
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  } = usePrayerTracking(selectedDate);

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
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

      <DailyStats
        totalPoints={getTotalPoints()}
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
            sunnahItems={sunnah[prayer.key as keyof PrayerSunnah]}
            onMarkStatus={(status) => markPrayer(prayer.key, status)}
            onToggleSunnah={(sunnahId) => toggleSunnah(prayer.key as keyof PrayerSunnah, sunnahId)}
            delay={index * 50}
          />
        ))}
      </div>
    </div>
  );
}
