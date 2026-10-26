import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QadhaSetupFlow } from '@/components/QadhaSetupFlow';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useTranslation } from '@/lib/i18n';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

/**
 * The Qadha page's entry point into the same guided flow onboarding uses —
 * for anyone who skipped it at the start, or who wants to redo the estimate.
 */
export function QadhaSetupDialog() {
  const { t, isRTL } = useTranslation();
  const { setCount } = useQadhaPrayers();
  const [open, setOpen] = useState(false);
  /** Remounts the flow on each open so it starts at the first question. */
  const [runId, setRunId] = useState(0);

  const handleApply = (perPrayer: number) => {
    PRAYERS.forEach((p) => setCount(p, perPrayer));
    // Ensure siblings pick up the batch even if effects coalesce oddly.
    try {
      const next = Object.fromEntries(PRAYERS.map((p) => [p, perPrayer]));
      localStorage.setItem('qadha-prayer-counts', JSON.stringify(next));
      window.dispatchEvent(new Event('qadha-updated'));
    } catch {
      /* ignore quota / private mode */
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRunId((n) => n + 1);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          {t('qadhaSetup.open')}
        </Button>
      </DialogTrigger>
      <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">{t('qadhaSetup.open')}</DialogTitle>
          <DialogDescription className="text-start">{t('qadhaSetup.intro')}</DialogDescription>
        </DialogHeader>

        <QadhaSetupFlow key={runId} onApply={handleApply} />
      </DialogContent>
    </Dialog>
  );
}
