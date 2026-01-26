import { TrendingDown, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QadhaBurndownProps {
  totalQadha: number;
  projection: {
    daysToComplete: number;
    months: number;
  } | null;
}

export function QadhaBurndown({ totalQadha, projection }: QadhaBurndownProps) {
  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-foreground">
            {totalQadha} böner
          </p>
          <p className="text-xs text-muted-foreground">Kvarstående Qadha</p>
        </div>
      </div>
      
      {projection && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Skuldfri om ca{' '}
              <span className="font-semibold text-foreground">
                {projection.months > 1 ? `${projection.months} månader` : `${projection.daysToComplete} dagar`}
              </span>
              {' '}med nuvarande takt
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Framsteg</span>
              <span>0 / {totalQadha}</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      )}
      
      {!projection && (
        <p className="text-sm text-muted-foreground">
          Ställ in ett dagligt Qadha-mål för att se prognos.
        </p>
      )}
    </div>
  );
}
