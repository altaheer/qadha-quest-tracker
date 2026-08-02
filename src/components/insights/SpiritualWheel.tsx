import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/i18n';

interface SpiritualWheelProps {
  data: {
    category: string;
    value: number;
    fullMark: number;
  }[];
}

export function SpiritualWheel({ data }: SpiritualWheelProps) {
  const { t } = useTranslation();
  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid 
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name={t('insightsLabels.yourLevel')}
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('insightsLabels.balanceHint')}
      </p>
    </div>
  );
}
