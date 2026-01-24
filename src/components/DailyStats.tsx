import { Trophy, Target, Flame } from 'lucide-react';

interface DailyStatsProps {
  totalPoints: number;
  completedPrayers: number;
  totalPrayers: number;
}

export function DailyStats({ totalPoints, completedPrayers, totalPrayers }: DailyStatsProps) {
  const percentage = Math.round((completedPrayers / totalPrayers) * 100);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{totalPoints}</p>
        <p className="text-xs text-muted-foreground">Poäng idag</p>
      </div>
      
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Target className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">
          {completedPrayers}/{totalPrayers}
        </p>
        <p className="text-xs text-muted-foreground">Böner klara</p>
      </div>
      
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Flame className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{percentage}%</p>
        <p className="text-xs text-muted-foreground">Fullföljt</p>
      </div>
    </div>
  );
}
