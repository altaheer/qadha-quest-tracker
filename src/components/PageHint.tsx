import { OneTimeTooltip } from '@/components/OneTimeTooltip';
import { useTranslation, type TKey } from '@/lib/i18n';

/**
 * The one-line introduction a screen gives the first time it is opened, and
 * never again. Explaining a feature where it actually lives beats listing every
 * feature up front in a carousel nobody reads — so onboarding stays short and
 * each screen carries its own share of the explaining.
 *
 * The full text lives permanently in the guide (Settings → How it works), and
 * "Show the first-time hints again" there brings these back.
 */
export type HintId = 'home' | 'prayers' | 'qadha' | 'habits' | 'missions' | 'insights' | 'calendar';

const COPY: Record<HintId, { title: TKey; description: TKey }> = {
  home: { title: 'guide.hintHome', description: 'guide.hintHomeDesc' },
  prayers: { title: 'guide.hintPrayers', description: 'guide.hintPrayersDesc' },
  qadha: { title: 'guide.hintQadha', description: 'guide.hintQadhaDesc' },
  habits: { title: 'guide.hintHabits', description: 'guide.hintHabitsDesc' },
  missions: { title: 'guide.hintMissions', description: 'guide.hintMissionsDesc' },
  insights: { title: 'guide.hintInsights', description: 'guide.hintInsightsDesc' },
  calendar: { title: 'guide.hintCalendar', description: 'guide.hintCalendarDesc' },
};

export function PageHint({ id }: { id: HintId }) {
  const { t } = useTranslation();
  const copy = COPY[id];

  return (
    <OneTimeTooltip
      id={`page-${id}`}
      show
      title={t(copy.title)}
      description={t(copy.description)}
    />
  );
}
