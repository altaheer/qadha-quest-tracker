import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, isToday, isFuture } from 'date-fns';
import { sv, enUS, tr, arSA } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const localeMap: Record<string, Locale> = {
  en: enUS,
  sv,
  tr,
  ar: arSA,
};

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const { t, lang } = useTranslation();
  const locale = localeMap[lang] || enUS;

  const goToPrevious = () => onDateChange(addDays(selectedDate, -1));
  const goToNext = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isFuture(nextDate) || isToday(nextDate)) onDateChange(nextDate);
  };
  const goToToday = () => onDateChange(new Date());

  const canGoNext = !isToday(selectedDate);
  const dateIsToday = isToday(selectedDate);

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border/50 mb-4">
      <Button variant="ghost" size="icon" onClick={goToPrevious} className="h-9 w-9" aria-label={t('prayers.previous')}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 text-center">
        <button onClick={goToToday} className="flex items-center justify-center gap-2 mx-auto hover:text-primary transition-colors">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium capitalize">
            {dateIsToday ? t('prayers.today') : format(selectedDate, 'EEEE d MMMM', { locale })}
          </span>
        </button>
        {!dateIsToday && (
          <p className="text-xs text-muted-foreground mt-0.5">{t('prayers.tapForToday')}</p>
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={goToNext} disabled={!canGoNext} className="h-9 w-9" aria-label={t('prayers.next')}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
