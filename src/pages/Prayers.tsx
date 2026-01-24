import { DailyPrayerCard } from '@/components/DailyPrayerCard';
import { DailyStats } from '@/components/DailyStats';
import { usePrayerTracking, DailyPrayers, PrayerSunnah } from '@/hooks/usePrayerTracking';

const prayerInfo: { key: keyof DailyPrayers; name: string; arabicName: string }[] = [
  { key: 'fajr', name: 'Fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر' },
  { key: 'asr', name: 'Asr', arabicName: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب' },
  { key: 'isha', name: 'Isha', arabicName: 'العشاء' },
];

export default function Prayers() {
  const {
    prayers,
    streaks,
    sunnah,
    markPrayer,
    toggleSunnah,
    getPoints,
    getTotalPoints,
    getCompletedCount,
  } = usePrayerTracking();

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Dagens böner
        </h2>
        <p className="text-muted-foreground text-sm">
          Markera dina obligatoriska böner och sunnah
        </p>
      </div>

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
