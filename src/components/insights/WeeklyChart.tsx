import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyChartProps {
  data: {
    day: string;
    date: string;
    points: number;
    hasData: boolean;
  }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxPoints = Math.max(...data.map(d => d.points), 50);
  
  const getBarColor = (points: number, hasData: boolean) => {
    if (!hasData) return 'hsl(var(--muted))';
    if (points >= 40) return 'hsl(var(--primary))';
    if (points >= 20) return 'hsl(var(--accent))';
    return 'hsl(var(--muted))';
  };

  return (
    <div className="gradient-card rounded-xl p-4 shadow-card border border-border/50">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, maxPoints]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Bar 
              dataKey="points" 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.points, entry.hasData)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-muted-foreground">Bra dag</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-muted-foreground">Ok dag</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-muted-foreground">Ingen data</span>
        </div>
      </div>
    </div>
  );
}
