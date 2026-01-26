import { Flame, Star, BookOpen, TrendingDown } from 'lucide-react';
import { useInsightsData } from '@/hooks/useInsightsData';
import { HighlightCards } from '@/components/insights/HighlightCards';
import { WeeklyChart } from '@/components/insights/WeeklyChart';
import { PrayerPunctuality } from '@/components/insights/PrayerPunctuality';
import { ImanHeatmap } from '@/components/insights/ImanHeatmap';
import { PrayerBalanceChart } from '@/components/insights/PrayerBalanceChart';
import { QadhaBurndown } from '@/components/insights/QadhaBurndown';
import { SpiritualWheel } from '@/components/insights/SpiritualWheel';

export default function Insights() {
  const data = useInsightsData();

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Insikter
        </h1>
        <p className="text-sm text-muted-foreground">
          Din spirituella utveckling
        </p>
      </div>

      {/* 1. Highlight Cards */}
      <HighlightCards
        streak={data.currentStreak}
        bestDay={data.bestDay}
        quranPages={0}
      />

      {/* 2. Weekly Overview */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Veckokollen
        </h2>
        <WeeklyChart data={data.weeklyData} />
      </section>

      {/* 3. Prayer Punctuality */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Punktlighet per bön
        </h2>
        <PrayerPunctuality 
          data={data.prayerPunctuality}
          getPrayerDisplayName={data.getPrayerDisplayName}
        />
      </section>

      {/* 4. Iman Heatmap */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Iman-heatmap
        </h2>
        <ImanHeatmap data={data.yearlyHeatmap} />
      </section>

      {/* 5. Prayer Balance */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Böne-balansen
        </h2>
        <PrayerBalanceChart data={data.prayerBalance} />
      </section>

      {/* 6. Qadha Burndown */}
      {data.totalQadha > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Qadha Burn-down
          </h2>
          <QadhaBurndown 
            totalQadha={data.totalQadha}
            projection={data.qadhaProjection}
          />
        </section>
      )}

      {/* 7. Spiritual Wheel */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">
          Spirituellt hjul
        </h2>
        <SpiritualWheel data={data.spiritualWheel} />
      </section>
    </div>
  );
}
