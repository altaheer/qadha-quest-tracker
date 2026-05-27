import { Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation, languageLabels, Language } from '@/lib/i18n';

export function LanguageSelector() {
  const { t, lang, setLanguage } = useTranslation();

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Languages className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
            <CardDescription>{languageLabels[lang]}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Select value={lang} onValueChange={(v) => setLanguage(v as Language)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(languageLabels) as Language[]).map((l) => (
              <SelectItem key={l} value={l}>
                {languageLabels[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
