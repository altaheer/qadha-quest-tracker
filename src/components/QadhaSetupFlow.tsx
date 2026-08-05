import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { estimateQadha, type YearMonth } from '@/lib/qadhaEstimate';
import { useTranslation } from '@/lib/i18n';
import { localeFor } from '@/lib/date';
import { cn } from '@/lib/utils';

/**
 * Works out a qadha count from two rough dates, one question at a time.
 *
 * Asking someone to type five numbers is the hardest possible opening question —
 * not knowing those numbers is usually why they installed the app. Two months
 * they can actually recall is a far easier thing to answer, and it also covers
 * the "I have not started praying yet" case, which a pair of ages cannot express.
 */

interface Props {
  /** Receives the per-prayer count; the caller decides where it is written. */
  onApply: (perPrayer: number) => void;
  /** Shown as a quiet escape hatch for people who already know their numbers. */
  onManual?: () => void;
}

type Step = 'puberty' | 'started' | 'when' | 'result';

/** Menstrual cycles vary; 7 is a common middle figure and the range is generous. */
const DEFAULT_MENSTRUAL_DAYS = 7;
const MIN_MENSTRUAL_DAYS = 1;
const MAX_MENSTRUAL_DAYS = 15;

/** Nobody reaches puberty before this, and it bounds the year list sensibly. */
const EARLIEST_AGE = 8;
const OLDEST_PLAUSIBLE_AGE = 100;

function Question({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-xl font-semibold leading-snug text-foreground">{title}</h3>
      {hint && <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Kept at module scope rather than nested in the flow: a component defined
 * inside another is a fresh type on every render, which would tear down and
 * rebuild both dropdowns each time a value changed.
 */
/**
 * Month and year are tracked as independent nullable fields, not a single
 * YearMonth — a YearMonth cannot represent "month chosen, year not yet",
 * and defaulting the missing half to a guessed year let Next enable before
 * the user had actually chosen one (the estimate then ran off a year picked
 * for them, silently).
 */
function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
  months,
  years,
  monthLabel,
  yearLabel,
}: {
  month: number | null;
  year: number | null;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  months: string[];
  years: number[];
  monthLabel: string;
  yearLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="space-y-1.5">
        <label className="px-1 text-xs font-medium text-muted-foreground">{monthLabel}</label>
        <Select value={month !== null ? String(month) : undefined} onValueChange={(m) => onMonthChange(Number(m))}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {months.map((name, m) => (
              <SelectItem key={m} value={String(m)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="px-1 text-xs font-medium text-muted-foreground">{yearLabel}</label>
        <Select value={year !== null ? String(year) : undefined} onValueChange={(y) => onYearChange(Number(y))}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function QadhaSetupFlow({ onApply, onManual }: Props) {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState<Step>('puberty');

  const [pubertyMonth, setPubertyMonth] = useState<number | null>(null);
  const [pubertyYear, setPubertyYear] = useState<number | null>(null);
  const puberty: YearMonth | null = useMemo(
    () => (pubertyMonth !== null && pubertyYear !== null ? { month: pubertyMonth, year: pubertyYear } : null),
    [pubertyMonth, pubertyYear],
  );

  const [startedToday, setStartedToday] = useState(false);
  const [startedMonth, setStartedMonth] = useState<number | null>(null);
  const [startedYear, setStartedYear] = useState<number | null>(null);
  const startedAt: YearMonth | 'today' | null = useMemo(() => {
    if (startedToday) return 'today';
    return startedMonth !== null && startedYear !== null ? { month: startedMonth, year: startedYear } : null;
  }, [startedToday, startedMonth, startedYear]);

  const [deductMenstrual, setDeductMenstrual] = useState(false);
  const [menstrualDays, setMenstrualDays] = useState(DEFAULT_MENSTRUAL_DAYS);

  const locale = localeFor(lang);
  const thisYear = new Date().getFullYear();

  // Month names come from Intl rather than the dictionary — every language
  // already knows how it writes "March".
  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2000, m, 1)));
  }, [locale]);

  const years = useMemo(
    () =>
      Array.from(
        { length: OLDEST_PLAUSIBLE_AGE - EARLIEST_AGE + 1 },
        (_, i) => thisYear - EARLIEST_AGE - i,
      ),
    [thisYear],
  );

  const result = useMemo(() => {
    if (!puberty || !startedAt) return null;
    return estimateQadha({
      from: puberty,
      to: startedAt,
      menstrualDaysPerMonth: deductMenstrual ? menstrualDays : 0,
    });
  }, [puberty, startedAt, deductMenstrual, menstrualDays]);

  const back = () => {
    if (step === 'result') setStep(startedAt === 'today' ? 'started' : 'when');
    else if (step === 'when') setStep('started');
    else if (step === 'started') setStep('puberty');
  };

  const pickerProps = {
    months,
    years,
    monthLabel: t('qadhaSetup.month'),
    yearLabel: t('qadhaSetup.year'),
  };

  const pubertyComplete = puberty !== null;
  const whenComplete = startedAt !== null && startedAt !== 'today';

  return (
    <div>
      {step !== 'puberty' && (
        <button
          type="button"
          onClick={back}
          className="mb-3 -ms-1 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[0.8125rem] text-muted-foreground transition-colors duration-base ease-brand hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
          {t('common.back')}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
        >
          {step === 'puberty' && (
            <>
              <Question title={t('qadhaSetup.pubertyQ')} hint={t('qadhaSetup.pubertyHint')} />
              <MonthYearPicker
                month={pubertyMonth}
                year={pubertyYear}
                onMonthChange={setPubertyMonth}
                onYearChange={setPubertyYear}
                {...pickerProps}
              />
              <Button
                size="lg"
                className="mt-6 w-full"
                disabled={!pubertyComplete}
                onClick={() => setStep('started')}
              >
                {t('common.next')}
              </Button>
              {onManual && (
                <Button variant="ghost" className="mt-2 w-full" onClick={onManual}>
                  {t('qadhaSetup.manual')}
                </Button>
              )}
            </>
          )}

          {step === 'started' && (
            <>
              <Question title={t('qadhaSetup.startedQ')} />
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    // Undo a prior "not yet" from this same visit to the step,
                    // otherwise startedAt would still resolve to 'today' while
                    // the user is now filling in a start date on the 'when' step.
                    setStartedToday(false);
                    setStep('when');
                  }}
                  className="surface-interactive w-full px-4 py-3.5 text-start"
                >
                  <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                    {t('qadhaSetup.startedYes')}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                    {t('qadhaSetup.startedYesDesc')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartedToday(true);
                    setStep('result');
                  }}
                  className="surface-interactive w-full px-4 py-3.5 text-start"
                >
                  <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                    {t('qadhaSetup.startedNo')}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                    {t('qadhaSetup.startedNoDesc')}
                  </p>
                </button>
              </div>
            </>
          )}

          {step === 'when' && (
            <>
              <Question title={t('qadhaSetup.whenQ')} hint={t('qadhaSetup.whenHint')} />
              <MonthYearPicker
                month={startedMonth}
                year={startedYear}
                onMonthChange={setStartedMonth}
                onYearChange={setStartedYear}
                {...pickerProps}
              />
              <Button
                size="lg"
                className="mt-6 w-full"
                disabled={!whenComplete}
                onClick={() => setStep('result')}
              >
                {t('common.next')}
              </Button>
            </>
          )}

          {step === 'result' && result && (
            <>
              <div className="surface px-5 py-6 text-center">
                <p className="text-[0.8125rem] text-muted-foreground">
                  {t('qadhaSetup.resultLabel')}
                </p>
                <p className="mt-2 font-display text-[3.25rem] font-semibold leading-none tracking-tight tabular-nums text-primary">
                  {result.perPrayer.toLocaleString(locale)}
                </p>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {t('qadhaSetup.perPrayer')}
                </p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground/70">
                  {t('qadhaSetup.totalLabel').replace(
                    '{n}',
                    result.totalPrayers.toLocaleString(locale),
                  )}
                </p>
              </div>

              <div className="surface mt-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.875rem] font-medium text-foreground">
                      {t('qadhaSetup.menstrualToggle')}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {t('qadhaSetup.menstrualDesc')}
                    </p>
                  </div>
                  <Switch checked={deductMenstrual} onCheckedChange={setDeductMenstrual} />
                </div>

                {deductMenstrual && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <span className="text-[0.8125rem] text-foreground">
                      {t('qadhaSetup.menstrualPerMonth')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setMenstrualDays((d) => Math.max(MIN_MENSTRUAL_DAYS, d - 1))
                        }
                        aria-label="−"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-[0.9375rem] font-semibold tabular-nums text-foreground">
                        {menstrualDays}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMenstrualDays((d) => Math.min(MAX_MENSTRUAL_DAYS, d + 1))
                        }
                        aria-label="+"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {deductMenstrual && result.excludedDays > 0 && (
                  <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                    {t('qadhaSetup.excludedNote').replace(
                      '{n}',
                      result.excludedDays.toLocaleString(locale),
                    )}
                  </p>
                )}
              </div>

              <p className="mt-3 rounded-xl bg-muted/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                {t('qadhaSetup.saferNote')}
              </p>

              <p className="mt-2.5 px-1 text-[0.6875rem] italic leading-relaxed text-muted-foreground/80">
                {t('qadhaSetup.disclaimer')}
              </p>

              <Button
                size="lg"
                className={cn('mt-4 w-full gap-2')}
                onClick={() => onApply(result.perPrayer)}
              >
                <Check className="h-4 w-4" />
                {t('qadhaSetup.apply')}
              </Button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
