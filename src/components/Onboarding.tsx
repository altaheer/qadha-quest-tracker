import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, BookOpen, Moon, RotateCcw, Sparkles, Target, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, languageLabels, Language, type TKey } from '@/lib/i18n';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useHabitsTracking, levelHabitCount } from '@/hooks/useHabitsTracking';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { Switch } from '@/components/ui/switch';
import { QadhaSetupFlow } from '@/components/QadhaSetupFlow';
import { cn } from '@/lib/utils';

const languageFlags: Record<Language, string> = { en: '🇬🇧', sv: '🇸🇪', tr: '🇹🇷', ar: '🇸🇦' };

const ONBOARDING_KEY = 'onboarding-complete';

export function hasCompletedOnboarding() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === '1';
}

export function resetOnboarding() {
  try { localStorage.removeItem(ONBOARDING_KEY); } catch {}
}

interface Props {
  onComplete: () => void;
}

type Level = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

const STEPS = [0, 1, 2, 3];

/**
 * The four things the app tracks, in the order they appear in the nav. Icons
 * match the nav icons so the mapping is learnable rather than decorative.
 */
const AREAS: { icon: LucideIcon; title: TKey; desc: TKey }[] = [
  { icon: Moon, title: 'guide.areaPrayers', desc: 'guide.areaPrayersDesc' },
  { icon: RotateCcw, title: 'guide.areaQadha', desc: 'guide.areaQadhaDesc' },
  { icon: BookOpen, title: 'guide.areaHabits', desc: 'guide.areaHabitsDesc' },
  { icon: BarChart3, title: 'guide.areaProgress', desc: 'guide.areaProgressDesc' },
];

/**
 * Levels are presets, not ranks — each one says what it switches on so the
 * choice is informed rather than a guess between four unexplained words.
 */
const LEVELS: { key: Level; desc: TKey }[] = [
  { key: 'easy', desc: 'guide.levelEasyDesc' },
  { key: 'medium', desc: 'guide.levelMediumDesc' },
  { key: 'hard', desc: 'guide.levelHardDesc' },
  { key: 'sahabah', desc: 'guide.levelSahabahDesc' },
  { key: 'custom', desc: 'guide.levelCustomDesc' },
];

export function Onboarding({ onComplete }: Props) {
  const { t, lang, setLanguage } = useTranslation();
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, string>>({
    fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '',
  });
  /** False while the guided flow is running; true once there are numbers to show. */
  const [manualEntry, setManualEntry] = useState(false);
  const { setCount } = useQadhaPrayers();
  const { applyLevel } = useHabitsTracking();
  const { autoMarkMissed, setAutoMarkMissed, autoMarkMissedTime, setAutoMarkMissedTime } = useUserPrefs();

  const finish = (level: Level) => {
    // Write directly to localStorage so values persist even though this
    // component unmounts before React flushes the setCount state updates.
    const parsed: Record<string, number> = {};
    prayerKeys.forEach((k) => {
      const n = parseInt(counts[k] || '0', 10);
      parsed[k] = !isNaN(n) && n > 0 ? n : 0;
      setCount(k, parsed[k]);
    });
    try {
      localStorage.setItem('qadha-prayer-counts', JSON.stringify(parsed));
      window.dispatchEvent(new Event('qadha-updated'));
    } catch {}
    applyLevel(level);
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
    onComplete();
  };

  const skipQadha = () => setStep(3);
  const goNext = () => setStep((s) => s + 1);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex justify-center gap-1.5 mb-8">
            {STEPS.map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-base ease-brand',
                  i === step ? 'w-8 bg-primary' : 'w-4 bg-muted'
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-elevated mb-6">
                  <Moon className="h-10 w-10 text-primary-foreground" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-3">
                  {t('onboarding.step1Title')}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {t('onboarding.step1Desc')}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {(Object.keys(languageLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border tap-target transition-colors duration-base ease-brand',
                        lang === l
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                      )}
                      aria-pressed={lang === l}
                      dir={l === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <span className="text-2xl leading-none">{languageFlags[l]}</span>
                      <span className="text-sm font-medium text-foreground">{languageLabels[l]}</span>
                    </button>
                  ))}
                </div>

                <Button size="lg" className="w-full" onClick={goNext}>
                  {t('common.next')}
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold mb-2">
                    {t('guide.insideTitle')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('guide.insideDesc')}
                  </p>
                </div>

                <ul className="space-y-5 mb-8">
                  {AREAS.map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex gap-3.5">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                        <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                          {t(title)}
                        </p>
                        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                          {t(desc)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button size="lg" className="w-full" onClick={goNext}>
                  {t('common.next')}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 mb-4">
                    <Target className="h-7 w-7 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    {t('onboarding.step2Title')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {manualEntry ? t('onboarding.step2Desc') : t('qadhaSetup.intro')}
                  </p>
                </div>

                {/*
                  The guided flow leads, because not knowing these five numbers is
                  usually the reason someone installed the app. Typing them stays
                  available for anyone who already has them.
                */}
                {!manualEntry ? (
                  <QadhaSetupFlow
                    onApply={(perPrayer) => {
                      setCounts(
                        Object.fromEntries(prayerKeys.map((k) => [k, String(perPrayer)])),
                      );
                      setManualEntry(true);
                    }}
                    onManual={() => setManualEntry(true)}
                  />
                ) : (
                  <div className="space-y-3 mb-6">
                    {prayerKeys.map((k) => (
                      <div key={k} className="flex items-center gap-3">
                        <Label htmlFor={k} className="w-24 capitalize">
                          {t(`prayerNames.${k}` as TKey)}
                        </Label>
                        <Input
                          id={k}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="0"
                          value={counts[k]}
                          onChange={(e) => setCounts((c) => ({ ...c, [k]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/*
                  Held back while the guided flow is running — it carries its own
                  buttons, and a second set below them reads as two ways forward.
                */}
                {manualEntry && (
                  <>
                    <div className="rounded-2xl border border-border bg-card p-4 mb-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{t('settings.autoMissed')}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('onboarding.autoMissedNote')}</p>
                        </div>
                        <Switch checked={autoMarkMissed} onCheckedChange={setAutoMarkMissed} />
                      </div>
                      {autoMarkMissed && (
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
                          <span className="text-sm text-foreground">{t('settings.autoMissedTime')}</span>
                          <Input
                            type="time"
                            value={autoMarkMissedTime}
                            onChange={(e) => setAutoMarkMissedTime(e.target.value || '00:00')}
                            className="w-28"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground italic">
                        {t('onboarding.editLaterNote')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button size="lg" className="w-full" onClick={goNext}>
                        {t('common.next')}
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={skipQadha}>
                        {t('onboarding.dontKnow')}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    {t('onboarding.step3Title')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('guide.levelWhat')}
                  </p>
                </div>

                <div className="space-y-2">
                  {LEVELS.map(({ key, desc }) => (
                    <button
                      key={key}
                      onClick={() => finish(key)}
                      className="surface-interactive w-full px-4 py-3.5 text-start"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                          {t(`habits.${key}` as TKey)}
                        </p>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {t('guide.habitsCount').replace('{n}', String(levelHabitCount(key)))}
                        </span>
                      </div>
                      <p className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground">
                        {t(desc)}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="mt-4 px-1 text-xs leading-relaxed text-muted-foreground">
                  {t('guide.levelManual')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
