import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import {
  estimateQadha,
  getQadhaStrings,
  type QadhaEstimateResult,
} from '@/lib/qadhaEstimate';
import { useTranslation } from '@/lib/i18n';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';

export function QadhaEstimateDialog() {
  const { lang, isRTL } = useTranslation();
  const s = getQadhaStrings(lang);
  const { setCount } = useQadhaPrayers();

  const [open, setOpen] = useState(false);
  const [bulughAge, setBulughAge] = useState('');
  const [startedPrayingAge, setStartedPrayingAge] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [result, setResult] = useState<QadhaEstimateResult | null>(null);

  const arabicClass = lang === 'ar' ? 'font-arabic' : '';
  const dir = isRTL ? 'rtl' : 'ltr';

  const reset = () => {
    setBulughAge('');
    setStartedPrayingAge('');
    setCurrentAge('');
    setResult(null);
  };

  const handleCalculate = () => {
    const r = estimateQadha({
      bulughAge: Number(bulughAge) || 0,
      startedPrayingAge: Number(startedPrayingAge) || 0,
      currentAge: Number(currentAge) || 0,
    });
    setResult(r);
  };

  const handleApply = () => {
    if (!result) return;
    (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).forEach((p) =>
      setCount(p, result.perPrayer),
    );
    setOpen(false);
    reset();
  };

  const handleCancel = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className={arabicClass}>{s.title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent dir={dir} className={`max-w-md ${arabicClass}`}>
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
            {s.title}
          </DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            {s.intro}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bulugh">{s.bulughLabel}</Label>
            <Input
              id="bulugh"
              type="number"
              inputMode="numeric"
              min={0}
              value={bulughAge}
              onChange={(e) => setBulughAge(e.target.value)}
              dir={dir}
            />
            <p className="text-xs text-muted-foreground">{s.bulughHint}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="started">{s.startedLabel}</Label>
            <Input
              id="started"
              type="number"
              inputMode="numeric"
              min={0}
              value={startedPrayingAge}
              onChange={(e) => setStartedPrayingAge(e.target.value)}
              dir={dir}
            />
            <p className="text-xs text-muted-foreground">{s.startedHint}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="current">{s.currentAgeLabel}</Label>
            <Input
              id="current"
              type="number"
              inputMode="numeric"
              min={0}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              dir={dir}
            />
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full"
            disabled={!bulughAge || !startedPrayingAge || !currentAge}
          >
            {s.calculate}
          </Button>

          {result && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 space-y-1">
              <p className="text-sm text-muted-foreground">{s.resultPrefix}</p>
              <p className="text-3xl font-bold text-primary">
                {result.perPrayer.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.resultPerPrayer}
              </p>
            </div>
          )}

          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground leading-relaxed">
            {s.saferNote}
          </div>

          <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
            {s.disclaimer}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" onClick={handleCancel} className="flex-1">
            {s.cancelButton}
          </Button>
          <Button
            variant="gold"
            onClick={handleApply}
            disabled={!result}
            className="flex-1"
          >
            {s.applyButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
