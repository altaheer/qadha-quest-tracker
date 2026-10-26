import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
 * Native <select> on purpose: Radix Select portals at z-50 (under the onboarding
 * overlay at z-[200]), and its popper viewport is only trigger-tall — both break
 * month/year picking on phones. Kept at module scope so React does not remount
 * the selects on every parent render.
 *
 * Month and year are tracked separately so Next stays disabled until both are set
 * (no silent fallback year/month).
 */
function MonthYearPicker({
  value,
  onChange,
  months,
  years,
  monthLabel,
  yearLabel,
}: {
  value: YearMonth | null;
  onChange: (v: YearMonth | null) => void;
  months: string[];
  years: number[];
  monthLabel: string;
  yearLabel: string;
}) {
  const selectClass =
    'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  // Local drafts so choosing month before year (or vice versa) does not snap
  // the other field back to "—". Parent only receives a value once both are set.
  const [draftMonth, setDraftMonth] = useState<string>(value ? String(value.month) : '');
  const [draftYear, setDraftYear] = useState<string>(value ? String(value.year) : '');

  const emit = (monthStr: string, yearStr: string) => {
    setDraftMonth(monthStr);
    setDraftYear(yearStr);
    if (monthStr === '' || yearStr === '') {
      onChange(null);
      return;
    }
    onChange({ month: Number(monthStr), year: Number(yearStr) });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="space-y-1.5">
        <label className="px-1 text-xs font-medium text-muted-foreground">{monthLabel}</label>
        <select
          className={selectClass}
          value={draftMonth}
          aria-label={monthLabel}
          onChange={(e) => emit(e.target.value, draftYear)}
        >
          <option value="">{'—'}</option>
          {months.map((name, m) => (
            <option key={m} value={String(m)}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="px-1 text-xs font-medium text-muted-foreground">{yearLabel}</label>
        <select
          className={selectClass}
          value={draftYear}
          aria-label={yearLabel}
          onChange={(e) => emit(draftMonth, e.target.value)}
        >
          <option value="">{'—'}</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function QadhaSetupFlow({ onApply, onManual }: Props) {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState<Step>('puberty');
  const [puberty, setPuberty] = useState<YearMonth | null>(null);
  const [startedAt, setStartedAt] = useState<YearMonth | 'today' | null>(null);
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
              <MonthYearPicker value={puberty} onChange={setPuberty} {...pickerProps} />
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
                  onClick={() => setStep('when')}
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
                    setStartedAt('today');
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
                value={startedAt === 'today' ? null : startedAt}
                onChange={setStartedAt}
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
