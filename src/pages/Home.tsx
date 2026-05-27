import { Moon, Flame, RotateCcw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrayerTracking } from '@/hooks/usePrayerTracking';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useHabitsTracking } from '@/hooks/useHabitsTracking';
import { DailyStats } from '@/components/DailyStats';
import { QuickActionsFAB } from '@/components/QuickActionsFAB';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  const { getTotalPoints: getPrayerPoints, getCompletedCount } = usePrayerTracking();
  const { totalPrayers: qadhaPrayers, calculateDaysToComplete } = useQadhaPrayers();
  const { getTotalPoints: getHabitPoints, getCompletedCount: getHabitCompletedCount, getActiveCount } = useHabitsTracking();

  const totalPoints = getPrayerPoints() + getHabitPoints();
  const completed = getCompletedCount();

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

      <QuickActionsFAB />
    </div>
  );
}
