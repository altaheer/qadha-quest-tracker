import { useHijriDate } from '@/hooks/useHijriDate';
import { useTranslation } from '@/lib/i18n';
import { localeFor } from '@/lib/date';

/**
 * Today's date in both calendars. Sits under the wordmark as quiet context —
 * it is orientation, not a headline, so it stays at body weight.
 */
export function DateHeader() {
  const hijriDate = useHijriDate();
  const { lang } = useTranslation();

  const gregorian = new Date().toLocaleDateString(localeFor(lang), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-[0.8125rem] leading-snug">
      <span className="capitalize text-muted-foreground">{gregorian}</span>
      {hijriDate && (
        <>
          <span aria-hidden className="text-border">·</span>
          <span className="font-medium text-primary/90" dir="rtl">
            {hijriDate.formattedAr}
          </span>
        </>
      )}
    </p>
  );
}
