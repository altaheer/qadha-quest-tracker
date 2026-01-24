import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, isToday, isFuture } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const goToPrevious = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const goToNext = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isFuture(nextDate) || isToday(nextDate)) {
      onDateChange(nextDate);
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const canGoNext = !isToday(selectedDate);
  const dateIsToday = isToday(selectedDate);

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border/50 mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="h-9 w-9"
        aria-label="Föregående dag"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 text-center">
        <button
          onClick={goToToday}
          className="flex items-center justify-center gap-2 mx-auto hover:text-primary transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium capitalize">
            {dateIsToday ? 'Idag' : format(selectedDate, 'EEEE d MMMM', { locale: sv })}
          </span>
        </button>
        {!dateIsToday && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Tryck för att gå till idag
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        disabled={!canGoNext}
        className="h-9 w-9"
        aria-label="Nästa dag"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
