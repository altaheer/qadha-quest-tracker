import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';

interface ImanHeatmapProps {
  data: { date: string; level: number }[];
}

export function ImanHeatmap({ data }: ImanHeatmapProps) {
  const { t } = useTranslation();
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted/50';
      case 1: return 'bg-primary/20';
      case 2: return 'bg-primary/40';
      case 3: return 'bg-primary/60';
      case 4: return 'bg-primary/80';
      case 5: return 'bg-primary';
      default: return 'bg-muted/50';
    }
  };

  // Group data by week for display
  const weeks = useMemo(() => {
    const result: { date: string; level: number }[][] = [];
    let currentWeek: { date: string; level: number }[] = [];
    
    data.forEach((day, index) => {
      const date = new Date(day.date);
      if (index === 0) {
        // Pad the first week with empty days
        const dayOfWeek = date.getDay();
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', level: -1 });
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }, [data]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.date);
      if (validDay) {
        const date = new Date(validDay.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
          labels.push({ month: monthNames[month], weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      {/* Month labels */}
      <div className="flex mb-1 text-xs text-muted-foreground pl-6">
        {monthLabels.map((label, i) => (
          <span 
            key={i}
            className="absolute"
            style={{ marginLeft: `${label.weekIndex * 12 + 24}px` }}
          >
            {label.month}
          </span>
        ))}
      </div>
      
      {/* Heatmap grid */}
      <div className="flex gap-0.5 overflow-x-auto pb-2 pt-4">
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mr-1">
          <span className="h-2.5 leading-none">S</span>
          <span className="h-2.5 leading-none">M</span>
          <span className="h-2.5 leading-none">T</span>
          <span className="h-2.5 leading-none">O</span>
          <span className="h-2.5 leading-none">T</span>
          <span className="h-2.5 leading-none">F</span>
          <span className="h-2.5 leading-none">L</span>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-2.5 h-2.5 rounded-sm ${day.level >= 0 ? getLevelColor(day.level) : 'bg-transparent'}`}
                title={day.date ? `${day.date}: ${t('insightsLabels.level')} ${day.level}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center gap-1 mt-2 text-xs text-muted-foreground">
        <span>Mindre</span>
        {[0, 1, 2, 3, 4, 5].map(level => (
          <div key={level} className={`w-2.5 h-2.5 rounded-sm ${getLevelColor(level)}`} />
        ))}
        <span>Mer</span>
      </div>
    </div>
  );
}
