import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation, languageLabels, Language } from '@/lib/i18n';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useHabitsTracking } from '@/hooks/useHabitsTracking';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { Switch } from '@/components/ui/switch';
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

type Level = 'easy' | 'medium' | 'hard' | 'sahabah';

const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function Onboarding({ onComplete }: Props) {
  const { t, lang, setLanguage } = useTranslation();
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState<Record<string, string>>({
    fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '',
  });
  const { setCount } = useQadhaPrayers();
  const { applyLevel } = useHabitsTracking();
  const { autoMarkMissed, setAutoMarkMissed, autoMarkMissedTime, setAutoMarkMissedTime } = useUserPrefs();

  const levels: { key: Level; descKey: any }[] = [
    { key: 'easy', descKey: 'habits.easy' },
    { key: 'medium', descKey: 'habits.medium' },
    { key: 'hard', descKey: 'habits.hard' },
    { key: 'sahabah', descKey: 'habits.sahabah' },
  ];

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

  const skipQadha = () => setStep(2);
  const goNext = () => setStep((s) => s + 1);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex justify-center gap-1.5 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
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
                        'flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border tap-target transition-all',
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
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 mb-4">
                    <Target className="h-7 w-7 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    {t('onboarding.step2Title')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('onboarding.step2Desc')}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {prayerKeys.map((k) => (
                    <div key={k} className="flex items-center gap-3">
                      <Label htmlFor={k} className="w-24 capitalize">
                        {t(`prayerNames.${k}` as any)}
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
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    {t('onboarding.step3Title')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('onboarding.step3Desc')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {levels.map((l) => (
                    <button
                      key={l.key}
                      onClick={() => finish(l.key)}
                      className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left tap-target"
                    >
                      <p className="font-display font-semibold mb-1">
                        {t(`habits.${l.key}` as any)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.key === 'easy' && '✦'}
                        {l.key === 'medium' && '✦✦'}
                        {l.key === 'hard' && '✦✦✦'}
                        {l.key === 'sahabah' && '✦✦✦✦'}
                      </p>
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => finish('easy')}
                >
                  {t('common.skip')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
