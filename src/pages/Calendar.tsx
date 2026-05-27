import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { gregorianToHijri, hijriMonths } from '@/lib/hijri';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { sv, enUS, tr, arSA, type Locale } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

const localeMap: Record<string, Locale> = { en: enUS, sv, tr, ar: arSA };

export default function Calendar() {
  const { t, lang } = useTranslation();
  const locale = localeMap[lang] || enUS;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const weekDays = (() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), 'EEE', { locale }));
  })();

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => { setCurrentMonth(new Date()); setSelectedDate(new Date()); };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedHijri = selectedDate ? gregorianToHijri(selectedDate) : null;
  const selectedHijriMonth = selectedHijri ? hijriMonths[selectedHijri.month - 1] : null;
  const firstDayHijri = gregorianToHijri(monthStart);
  const lastDayHijri = gregorianToHijri(monthEnd);

  return (
    <div className="p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-center">
            <h2 className="text-xl font-display font-semibold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale })}
            </h2>
            <p className="text-sm text-muted-foreground" dir="rtl">
              {firstDayHijri.month === lastDayHijri.month
                ? `${hijriMonths[firstDayHijri.month - 1]?.ar} ${firstDayHijri.year}`
                : `${hijriMonths[firstDayHijri.month - 1]?.ar} - ${hijriMonths[lastDayHijri.month - 1]?.ar} ${lastDayHijri.year}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="flex justify-center mb-4">
          <Button variant="outline" size="sm" onClick={goToToday}>{t('calendar.today')}</Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2 capitalize">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayDate, idx) => {
            const hijri = gregorianToHijri(dayDate);
            const isCurrentMonth = isSameMonth(dayDate, currentMonth);
            const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
            const isTodayDate = isToday(dayDate);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(dayDate)}
                className={cn(
                  'relative aspect-square rounded-lg p-1 flex flex-col items-center justify-center transition-all',
                  'hover:bg-muted/50',
                  !isCurrentMonth && 'opacity-40',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                  isTodayDate && !isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                <span className={cn('text-sm font-medium', isSelected && 'text-primary-foreground')}>
                  {format(dayDate, 'd')}
                </span>
                <span className={cn('text-[10px]', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {hijri.day}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDate && selectedHijri && selectedHijriMonth && (
          <div className="mt-6 p-4 rounded-xl bg-card border border-border/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-display font-semibold capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale })}
                </p>
                <p className="text-sm text-muted-foreground">{t('calendar.gregorian')}</p>
              </div>
              <div className="text-right" dir="rtl">
                <p className="text-lg font-display font-semibold">
                  {selectedHijri.day} {selectedHijriMonth.ar} {selectedHijri.year}
                </p>
                <p className="text-sm text-muted-foreground">{t('calendar.hijri')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
