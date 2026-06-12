import { useInsightsData } from '@/hooks/useInsightsData';
import { HighlightCards } from '@/components/insights/HighlightCards';
import { WeeklyChart } from '@/components/insights/WeeklyChart';
import { PrayerPunctuality } from '@/components/insights/PrayerPunctuality';
import { ImanHeatmap } from '@/components/insights/ImanHeatmap';
import { PrayerBalanceChart } from '@/components/insights/PrayerBalanceChart';
import { QadhaBurndown } from '@/components/insights/QadhaBurndown';
import { SpiritualWheel } from '@/components/insights/SpiritualWheel';
import { AchievementsSection } from '@/components/AchievementsSection';
import { OneTimeTooltip } from '@/components/OneTimeTooltip';
import { useMissions } from '@/hooks/useMissions';
import { Target } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Insights() {
  const data = useInsightsData();
  const { t } = useTranslation();
  const { totalCompletedBonus, completed } = useMissions();


  const hasData = data.currentStreak > 0 || data.weeklyData.some((d: any) => (d.points ?? d.value ?? 0) > 0);

  return (
    <div className="container max-w-lg mx-auto px-4 py-6 space-y-6 bottom-nav-offset">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">{t('insights.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('insights.subtitle')}</p>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('insights.empty')}</p>
        </div>
      )}

      <HighlightCards streak={data.currentStreak} bestDay={data.bestDay} quranPages={0} />

      {completed.length > 0 && (
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-amber-100/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t('missions.bonus')}</p>
            <p className="text-xl font-bold text-gold">+{totalCompletedBonus}</p>
          </div>
          <p className="text-xs text-muted-foreground">{completed.length} {t('missions.completed').toLowerCase()}</p>
        </div>
      )}


      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.weekly')}</h2>
        <WeeklyChart data={data.weeklyData} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.punctuality')}</h2>
        <PrayerPunctuality data={data.prayerPunctuality} getPrayerDisplayName={data.getPrayerDisplayName} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.heatmap')}</h2>
        <OneTimeTooltip
          id="heatmap-intro"
          show={true}
          title={t('insights.heatmap')}
          description={t('insights.heatmapTip')}
        />
        <ImanHeatmap data={data.yearlyHeatmap} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.balance')}</h2>
        <PrayerBalanceChart data={data.prayerBalance} />
      </section>

      {data.totalQadha > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.burndown')}</h2>
          <QadhaBurndown totalQadha={data.totalQadha} projection={data.qadhaProjection} />
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">{t('insights.wheel')}</h2>
        <SpiritualWheel data={data.spiritualWheel} />
      </section>

      <AchievementsSection />
    </div>
  );
}
