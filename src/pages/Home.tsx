import { Moon, Flame, RotateCcw, ChevronRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking } from '@/hooks/usePrayerTracking';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useHabitsTracking } from '@/hooks/useHabitsTracking';
import { useMissions, computeProgress } from '@/hooks/useMissions';
import { Progress } from '@/components/ui/progress';
import { DailyStats } from '@/components/DailyStats';
import { QuickActionsFAB } from '@/components/QuickActionsFAB';
import { nafilahPrayers } from '@/hooks/useNafilahTracking';
import { habitCategories } from '@/hooks/useHabitsTracking';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t, tHabit } = useTranslation();
  const { getTotalPoints: getPrayerPoints, getCompletedCount } = usePrayerTracking();
  const { totalPrayers: qadhaPrayers, calculateDaysToComplete } = useQadhaPrayers();
  const { getTotalPoints: getHabitPoints, getCompletedCount: getHabitCompletedCount, getActiveCount } = useHabitsTracking();
  const { missions } = useMissions();

  const totalPoints = getPrayerPoints() + getHabitPoints();
  const completed = getCompletedCount();

  const activeMissionLabel = (m: typeof missions[number]) => {
    if (m.actionType === 'prayer') {
      const qual = m.qualifier === 'jamaah' ? t('missions.inJamaah') : t('missions.onTime');
      const name = m.actionId === 'all' ? t('missions.allFive') : t(`prayerNames.${m.actionId}` as any);
      return `${name} ${qual}`;
    }
    if (m.actionType === 'habit') return tHabit(m.actionId);
    return nafilahPrayers.find((p) => p.id === m.actionId)?.name ?? m.actionId;
  };


  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-elevated mb-4">
          <Moon className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Assalamu Alaikum
        </h1>
        <p className="text-muted-foreground">
          {t('prayers.subtitle')}
        </p>
      </div>

      <DailyStats
        totalPoints={totalPoints}
        completedPrayers={completed}
        totalPrayers={5}
        completedHabits={getHabitCompletedCount()}
        totalHabits={getActiveCount()}
      />

      <div className="space-y-3">
        <Link to="/prayers" className="flex items-center justify-between p-4 rounded-2xl gradient-card shadow-card border border-border/50 hover:shadow-elevated transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Moon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('prayers.title')}</h3>
              <p className="text-sm text-muted-foreground">{completed}/5</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link to="/qadha" className="flex items-center justify-between p-4 rounded-2xl gradient-card shadow-card border border-border/50 hover:shadow-elevated transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('qadha.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {qadhaPrayers > 0
                  ? `${qadhaPrayers} • ${calculateDaysToComplete()} ${t('qadha.daysToComplete')}`
                  : t('qadha.empty')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link to="/habits" className="flex items-center justify-between p-4 rounded-2xl gradient-card shadow-card border border-border/50 hover:shadow-elevated transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-light flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('habits.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('habits.subtitle')}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      {missions.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground/80">
              {t('missions.active')}
            </h3>
            <Link to="/missions" className="text-xs text-primary">
              {t('missions.title')} →
            </Link>
          </div>
          {missions.slice(0, 2).map((m) => {
            const p = computeProgress(m);
            const pct = Math.min(100, (p.progress / m.days) * 100);
            return (
              <Link
                key={m.id}
                to="/missions"
                className="block p-3 rounded-xl border border-border bg-card hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm text-foreground truncate">
                    {t('missions.iIntendTo')}{' '}
                    <span className="text-primary font-medium">{activeMissionLabel(m)}</span>{' '}
                    {t('missions.for')} {m.days} {t('missions.days')}
                  </p>
                </div>
                <Progress value={pct} className="h-1.5" />
              </Link>
            );
          })}
        </div>
      )}

      <QuickActionsFAB />

    </div>
  );
}
