import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/i18n';

interface PrayerBalanceChartProps {
  data: {
    onTime: number;
    late: number;
    missed: number;
    total: number;
    onTimePercent: number;
    latePercent: number;
    missedPercent: number;
  };
}

export function PrayerBalanceChart({ data }: PrayerBalanceChartProps) {
  const { t } = useTranslation();
  const chartData = [
    { name: t('status.onTime'), value: data.onTime, color: 'hsl(var(--primary))' },
    { name: t('status.late'), value: data.late, color: 'hsl(var(--accent))' },
    { name: t('status.missed'), value: data.missed, color: 'hsl(var(--destructive) / 0.7)' },
  ].filter(d => d.value > 0);

  if (data.total === 0) {
    return (
      <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50 text-center">
        <p className="text-muted-foreground text-sm">{t('insightsLabels.noPrayerData')}</p>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground">
            {data.onTimePercent}%
          </span>
          <span className="text-xs text-muted-foreground">I tid</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-muted-foreground">I tid ({data.onTimePercent}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-muted-foreground">Sen ({data.latePercent}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-destructive/70" />
          <span className="text-muted-foreground">Missad ({data.missedPercent}%)</span>
        </div>
      </div>
    </div>
  );
}
