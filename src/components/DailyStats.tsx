import { Trophy, Target, Flame, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface DailyStatsProps {
  totalPoints: number;
  completedPrayers: number;
  totalPrayers: number;
  completedHabits?: number;
  totalHabits?: number;
}

export function DailyStats({
  totalPoints,
  completedPrayers,
  totalPrayers,
  completedHabits = 0,
  totalHabits = 0,
}: DailyStatsProps) {
  const { t } = useTranslation();
  const totalCompleted = completedPrayers + completedHabits;
  const totalItems = totalPrayers + totalHabits;
  const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{totalPoints}</p>
        <p className="text-xs text-muted-foreground">{t('habits.pointsToday')}</p>
      </div>

      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Flame className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{overallPercentage}%</p>
        <p className="text-xs text-muted-foreground">{t('habits.completed')}</p>
      </div>

      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Target className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">
          {completedPrayers}/{totalPrayers}
        </p>
        <p className="text-xs text-muted-foreground">{t('nav.prayers')}</p>
      </div>

      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">
          {completedHabits}/{totalHabits}
        </p>
        <p className="text-xs text-muted-foreground">{t('nav.habits')}</p>
      </div>
    </div>
  );
}
