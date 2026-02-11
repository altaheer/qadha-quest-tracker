import { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PrayerCardProps {
  name: string;
  arabicName: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onSetCount?: (count: number) => void;
  delay?: number;
}

export function PrayerCard({
  name,
  arabicName,
  count,
  onIncrement,
  onDecrement,
  onReset,
  onSetCount,
  delay = 0,
}: PrayerCardProps) {
  const [inputValue, setInputValue] = useState(count.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && onSetCount) {
      onSetCount(numValue);
    } else {
      setInputValue(count.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Sync input value when count changes from +/- buttons
  if (count.toString() !== inputValue && document.activeElement?.tagName !== 'INPUT') {
    setInputValue(count.toString());
  }

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

      <div className="flex items-center justify-between gap-3">
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
          <Input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="text-center font-display text-7xl font-bold text-primary h-24 border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30"
            aria-label={`${name} prayer count`}
          />
          <p className="text-xs text-muted-foreground mt-1 font-body">böner</p>
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
