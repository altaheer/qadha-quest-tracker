import { Calendar } from 'lucide-react';
import { useHijriDate } from '@/hooks/useHijriDate';
import { useTranslation } from '@/lib/i18n';

const localeMap: Record<string, string> = {
  en: 'en-US',
  sv: 'sv-SE',
  tr: 'tr-TR',
  ar: 'ar-EG',
};

export function DateHeader() {
  const hijriDate = useHijriDate();
  const { lang } = useTranslation();
  const today = new Date();

  const gregorianFormatted = today.toLocaleDateString(localeMap[lang] || 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-center gap-3 text-sm text-center">
      <Calendar className="h-4 w-4 text-primary shrink-0" />
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
