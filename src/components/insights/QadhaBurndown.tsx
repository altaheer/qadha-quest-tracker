import { TrendingDown, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import { localeFor } from '@/lib/date';

interface QadhaBurndownProps {
  totalQadha: number;
  projection: {
    daysToComplete: number;
    months: number;
  } | null;
}

export function QadhaBurndown({ totalQadha, projection }: QadhaBurndownProps) {
  const { t, lang } = useTranslation();

  /** Intl already knows how each language pluralises "3 months" / "45 days". */
  const duration = (value: number, unit: 'month' | 'day') =>
    new Intl.NumberFormat(localeFor(lang), { style: 'unit', unit, unitDisplay: 'long' }).format(value);

  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-foreground">
            {totalQadha.toLocaleString(localeFor(lang))}
          </p>
          <p className="text-xs text-muted-foreground">{t('insightsLabels.qadhaRemaining')}</p>
        </div>
      </div>
      
      {projection && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('insightsLabels.clearIn')}{' '}
              <span className="font-semibold text-foreground">
                {projection.months > 1
                  ? duration(projection.months, 'month')
                  : duration(projection.daysToComplete, 'day')}
              </span>{' '}
              {t('insightsLabels.atCurrentPace')}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('insightsLabels.progress')}</span>
              <span>0 / {totalQadha}</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </div>
      )}
      
      {!projection && (
        <p className="text-sm text-muted-foreground">
          {t('insightsLabels.setGoal')}
        </p>
      )}
    </div>
  );
}
