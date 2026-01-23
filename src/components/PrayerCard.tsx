import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrayerCardProps {
  name: string;
  arabicName: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  delay?: number;
}

export function PrayerCard({
  name,
  arabicName,
  count,
  onIncrement,
  onDecrement,
  onReset,
  delay = 0,
}: PrayerCardProps) {
  return (
    <div
      className={cn(
        "gradient-card rounded-2xl p-6 shadow-card border border-border/50",
        "hover:shadow-elevated transition-all duration-300",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-muted-foreground font-body text-sm">{arabicName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="text-muted-foreground hover:text-destructive"
          title="Reset count"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="counter"
          size="counter"
          onClick={onDecrement}
          disabled={count === 0}
          aria-label={`Decrease ${name} count`}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-center">
          <span
            key={count}
            className="font-display text-4xl font-bold text-primary inline-block animate-count-up"
          >
            {count}
          </span>
          <p className="text-xs text-muted-foreground mt-1 font-body">prayers</p>
        </div>

        <Button
          variant="counter"
          size="counter"
          onClick={onIncrement}
          aria-label={`Increase ${name} count`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
