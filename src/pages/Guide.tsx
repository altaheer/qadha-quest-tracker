import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Moon,
  RotateCcw,
  Shield,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, type TKey } from '@/lib/i18n';
import { resetTooltips } from '@/components/OneTimeTooltip';
import { levelHabitCount } from '@/hooks/useHabitsTracking';
import { Page, PageHeader, Panel, SectionLabel } from '@/components/common';

/**
 * The permanent version of everything the app explains in passing: the
 * first-time hint on each screen, and the level descriptions from onboarding.
 * Having one place that always holds the full explanation is what lets the
 * onboarding stay four short steps.
 */

const SCREENS: { icon: LucideIcon; to: string; name: TKey; desc: TKey }[] = [
  { icon: HomeIcon, to: '/', name: 'nav.home', desc: 'guide.hintHomeDesc' },
  { icon: Moon, to: '/prayers', name: 'nav.prayers', desc: 'guide.hintPrayersDesc' },
  { icon: RotateCcw, to: '/qadha', name: 'nav.qadha', desc: 'guide.hintQadhaDesc' },
  { icon: BookOpen, to: '/habits', name: 'nav.habits', desc: 'guide.hintHabitsDesc' },
  { icon: Target, to: '/missions', name: 'missions.title', desc: 'guide.hintMissionsDesc' },
  { icon: BarChart3, to: '/insights', name: 'nav.insights', desc: 'guide.hintInsightsDesc' },
  { icon: CalendarIcon, to: '/calendar', name: 'nav.calendar', desc: 'guide.hintCalendarDesc' },
];

const LEVELS: { key: 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom'; desc: TKey }[] = [
  { key: 'easy', desc: 'guide.levelEasyDesc' },
  { key: 'medium', desc: 'guide.levelMediumDesc' },
  { key: 'hard', desc: 'guide.levelHardDesc' },
  { key: 'sahabah', desc: 'guide.levelSahabahDesc' },
  { key: 'custom', desc: 'guide.levelCustomDesc' },
];

export default function Guide() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleReplayHints = () => {
    resetTooltips();
    toast({ title: t('guide.replayHints'), description: t('guide.replayHintsDone') });
  };

  return (
    <Page>
      <PageHeader
        title={t('guide.title')}
        subtitle={t('guide.subtitle')}
        action={
          <Link
            to="/settings"
            aria-label={t('common.back')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-[1.15rem] w-[1.15rem] rtl:rotate-180" strokeWidth={2} />
          </Link>
        }
      />

      <SectionLabel className="pt-0">{t('guide.sectionScreens')}</SectionLabel>
      <Panel className="divide-y divide-border/70">
        {SCREENS.map(({ icon: Icon, to, name, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex gap-3.5 px-4 py-3.5 transition-colors duration-base ease-brand hover:bg-muted/40"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.9375rem] font-semibold text-foreground">{t(name)}</p>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {t(desc)}
              </p>
            </div>
          </Link>
        ))}
      </Panel>

      <SectionLabel>{t('guide.sectionLevels')}</SectionLabel>
      <p className="px-1 pb-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {t('guide.levelWhat')} {t('guide.levelManual')}
      </p>
      <Panel className="divide-y divide-border/70">
        {LEVELS.map(({ key, desc }) => (
          <div key={key} className="px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                {t(`habits.${key}` as TKey)}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {t('guide.habitsCount').replace('{n}', String(levelHabitCount(key)))}
              </span>
            </div>
            <p className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground">{t(desc)}</p>
          </div>
        ))}
      </Panel>

      <SectionLabel>{t('guide.sectionData')}</SectionLabel>
      <Panel>
        <div className="flex gap-3.5 px-4 py-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
            <Shield className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
            {t('guide.dataDesc')}
          </p>
        </div>
      </Panel>

      <div className="pt-5">
        <Button variant="outline" onClick={handleReplayHints} className="w-full">
          {t('guide.replayHints')}
        </Button>
      </div>
    </Page>
  );
}
