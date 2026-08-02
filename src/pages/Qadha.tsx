import { useMemo } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { QadhaEstimateDialog } from '@/components/QadhaEstimateDialog';
import { QadhaPrayerRow } from '@/components/QadhaPrayerRow';
import { useQadhaPrayers, PrayerCounts } from '@/hooks/useQadhaPrayers';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { useTranslation } from '@/lib/i18n';
import { localeFor } from '@/lib/date';
import { PageHint } from '@/components/PageHint';
import { EmptyState, Page, PageHeader, Panel, SectionLabel, Stat } from '@/components/common';

const PRAYERS: { key: keyof PrayerCounts; nameKey: string; arabicName: string }[] = [
  { key: 'fajr', nameKey: 'prayerNames.fajr', arabicName: 'الفجر' },
  { key: 'dhuhr', nameKey: 'prayerNames.dhuhr', arabicName: 'الظهر' },
  { key: 'asr', nameKey: 'prayerNames.asr', arabicName: 'العصر' },
  { key: 'maghrib', nameKey: 'prayerNames.maghrib', arabicName: 'المغرب' },
  { key: 'isha', nameKey: 'prayerNames.isha', arabicName: 'العشاء' },
];

const GOAL_MIN = 1;
const GOAL_MAX = 100;

export default function Qadha() {
  const { t, lang } = useTranslation();
  const { showArabic } = useUserPrefs();
  const {
    counts,
    dailyGoal,
    setDailyGoal,
    increment,
    decrement,
    setCount,
    resetAll,
    totalPrayers,
    calculateDaysToComplete,
  } = useQadhaPrayers();

  const daysToComplete = calculateDaysToComplete();

  /** The date the backlog reaches zero at the current pace. */
  const completionLabel = useMemo(() => {
    if (!isFinite(daysToComplete) || daysToComplete <= 0) return null;
    const date = new Date();
    date.setDate(date.getDate() + daysToComplete);
    return new Intl.DateTimeFormat(localeFor(lang), {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [daysToComplete, lang]);

  const adjustGoal = (delta: number) =>
    setDailyGoal(Math.min(GOAL_MAX, Math.max(GOAL_MIN, dailyGoal + delta)));

  const handleResetAll = () => {
    if (window.confirm(t('qadha.resetAllConfirm'))) resetAll();
  };

  return (
    <Page>
      <PageHeader title={t('qadha.title')} subtitle={t('qadha.subtitle')} />

      <PageHint id="qadha" />

      {totalPrayers === 0 ? (
        <EmptyState icon={Sparkles} title={t('qadha.empty')} description={t('qadha.emptyDesc')} />
      ) : (
        /* The one number this screen exists to show, and how long it will take. */
        <Panel className="animate-rise">
          <div className="px-5 pb-5 pt-6">
            <Stat
              size="hero"
              tone="primary"
              value={totalPrayers.toLocaleString(localeFor(lang))}
              label={t('qadha.totalRemaining')}
            />
          </div>

          <div className="flex items-center gap-4 border-t border-border/70 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-medium text-foreground">{t('qadha.dailyGoal')}</p>
              <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">
                {completionLabel
                  ? `${t('qadha.atThisPace')} · ${completionLabel}`
                  : t('qadha.noGoal')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => adjustGoal(-1)}
                disabled={dailyGoal <= GOAL_MIN}
                aria-label={t('qadha.decrease').replace('{prayer}', t('qadha.dailyGoal'))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors duration-base ease-brand hover:bg-primary/[0.09] disabled:opacity-25 disabled:hover:bg-transparent"
              >
                <Minus className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <span className="w-10 text-center font-display text-xl font-semibold tabular-nums text-foreground">
                {dailyGoal}
              </span>
              <button
                type="button"
                onClick={() => adjustGoal(1)}
                disabled={dailyGoal >= GOAL_MAX}
                aria-label={t('qadha.increase').replace('{prayer}', t('qadha.dailyGoal'))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors duration-base ease-brand hover:bg-primary/[0.09] disabled:opacity-25 disabled:hover:bg-transparent"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </Panel>
      )}

      <SectionLabel>{t('qadha.byPrayer')}</SectionLabel>

      {/* All five visible at once — the backlog at a glance is the whole point. */}
      <Panel className="divide-y divide-border/70">
        {PRAYERS.map((prayer) => {
          const name = t(prayer.nameKey as never);
          return (
            <QadhaPrayerRow
              key={prayer.key}
              name={name}
              arabicName={prayer.arabicName}
              showArabic={showArabic}
              count={counts[prayer.key]}
              onIncrement={() => increment(prayer.key)}
              onDecrement={() => decrement(prayer.key)}
              onSetCount={(next) => setCount(prayer.key, next)}
              incrementLabel={t('qadha.increase').replace('{prayer}', name)}
              decrementLabel={t('qadha.decrease').replace('{prayer}', name)}
            />
          );
        })}
      </Panel>

      <div className="pt-4">
        <QadhaEstimateDialog />
      </div>

      {totalPrayers > 0 && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={handleResetAll}
            className="rounded-full px-4 py-2 text-[0.8125rem] text-muted-foreground transition-colors duration-base ease-brand hover:text-destructive"
          >
            {t('qadha.resetAll')}
          </button>
        </div>
      )}
    </Page>
  );
}
