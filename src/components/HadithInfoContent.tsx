import { hadithData, getHadithText, getFadlText } from '@/lib/hadith';
import { useTranslation } from '@/lib/i18n';

export function HadithInfoContent({ id }: { id: string }) {
  const { t, lang } = useTranslation();
  const info = hadithData[id];

  if (!info) {
    return <p className="text-muted-foreground italic">{t('hadith.comingSoon')}</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="text-foreground">{getHadithText(info, lang)}</p>
      {info.arabic && (
        <p className="text-foreground/90 leading-relaxed" dir="rtl">{info.arabic}</p>
      )}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">{t('hadith.source')}:</span> {info.source}
      </p>
      <p className="text-xs text-muted-foreground italic">
        <span className="font-medium not-italic">{t('hadith.fadl')}:</span> {getFadlText(info, lang)}
      </p>
    </div>
  );
}
