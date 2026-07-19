import type { PrayerStatus } from '@/types';

interface PrayerPunctualityProps {
  data: Record<string, { history: PrayerStatus[]; onTimePercent: number }>;
  getPrayerDisplayName: (prayer: string) => string;
}

export function PrayerPunctuality({ data, getPrayerDisplayName }: PrayerPunctualityProps) {
  const getStatusColor = (status: PrayerStatus) => {
    switch (status) {
      case 'jamaah': return 'bg-accent';
      case 'ontime': return 'bg-primary';
      case 'late': return 'bg-orange-400';
      case 'missed': return 'bg-rose-400';
      default: return 'bg-muted';
    }
  };

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50 space-y-3">
      {prayers.map(prayer => {
        const prayerData = data[prayer];
        if (!prayerData) return null;
        
        return (
          <div key={prayer} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground w-16">
              {getPrayerDisplayName(prayer)}
            </span>
            <div className="flex gap-1.5 flex-1 justify-center">
              {prayerData.history.map((status, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${getStatusColor(status)}`}
                  title={status}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {prayerData.onTimePercent}%
            </span>
          </div>
        );
      })}
      
      <div className="flex justify-center gap-4 pt-2 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">I tid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Sen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <span className="text-muted-foreground">Missad</span>
        </div>
      </div>
    </div>
  );
}
