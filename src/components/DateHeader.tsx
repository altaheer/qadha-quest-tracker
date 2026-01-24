import { Calendar } from 'lucide-react';
import { useHijriDate } from '@/hooks/useHijriDate';

export function DateHeader() {
  const hijriDate = useHijriDate();
  const today = new Date();
  
  const gregorianFormatted = today.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 text-sm">
      <Calendar className="h-4 w-4 text-primary" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <span className="text-foreground capitalize">{gregorianFormatted}</span>
        {hijriDate && (
          <>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="text-primary font-medium" dir="rtl">
              {hijriDate.formattedAr}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
