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
import { BarChart3, Target } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { EmptyState, Page, PageHeader } from '@/components/common';

export default function Insights() {
  const data = useInsightsData();
  const { t } = useTranslation();
  const { totalCompletedBonus, completed } = useMissions();


  const hasData = data.currentStreak > 0 || data.weeklyData.some((d: any) => (d.points ?? d.value ?? 0) > 0);

  return (
    <Page className="space-y-5">
      <PageHeader title={t('insights.title')} subtitle={t('insights.subtitle')} />

      {!hasData && <EmptyState icon={BarChart3} title={t('insights.empty')} />}

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
    </Page>
  );
}
