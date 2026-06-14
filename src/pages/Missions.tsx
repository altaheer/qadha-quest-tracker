import { useEffect, useMemo, useState } from 'react';
import { Target, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import { habitCategories } from '@/hooks/useHabitsTracking';
import { nafilahPrayers } from '@/hooks/useNafilahTracking';
import {
  useMissions,
  computeProgress,
  getActionLabel,
  type MissionActionType,
  type MissionQualifier,
} from '@/hooks/useMissions';
import { CompletionCelebration } from '@/components/CompletionCelebration';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function parseActionValue(v: string): {
  actionType: MissionActionType;
  actionId: string;
} | null {
  if (!v) return null;
  const [type, id] = v.split(':');
  return { actionType: type as MissionActionType, actionId: id };
}

export default function MissionsPage() {
  const { t, lang, isRTL, tHabit } = useTranslation();
  const arabicStyle = lang === 'ar' ? { fontFamily: "'Cairo', sans-serif" } : undefined;

  const {
    missions,
    completed,
    endedMissions,
    createMission,
    deleteMission,
    reconcile,
    recreateMission,
    removeEnded,
  } = useMissions();

  const [actionValue, setActionValue] = useState('');
  const [qualifier, setQualifier] = useState<MissionQualifier>('on-time');
  const [daysValue, setDaysValue] = useState<string>('30');
  const [missesValue, setMissesValue] = useState<string>('3');
  const [celebrate, setCelebrate] = useState<{ sentence: string; bonus: number } | null>(null);

  useEffect(() => {
    const { justCompleted } = reconcile();
    if (justCompleted.length > 0) {
      const first = justCompleted[0];
      const sentence = getActionLabel(first, t, tHabit, lang);
      setCelebrate({ sentence, bonus: first.bonus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = parseActionValue(actionValue);
  const isPrayer = parsed?.actionType === 'prayer';

  const handleBegin = () => {
    if (!parsed) return;
    const days = Math.max(1, Number(daysValue) || 0);
    const misses = Math.max(0, Number(missesValue) || 0);
    if (days < 1) return;
    createMission({
      actionType: parsed.actionType,
      actionId: parsed.actionId,
      qualifier: isPrayer ? qualifier : undefined,
      days,
      missesAllowed: misses,
    });
    setActionValue('');
    setQualifier('on-time');
    setDaysValue('30');
    setMissesValue('3');
  };

  // All habits — not filtered by active/paused
  const allHabits = useMemo(
    () => habitCategories.flatMap((c) => c.habits),
    [],
  );

  return (
    <div
      className="container max-w-lg mx-auto px-4 py-6 space-y-6 bottom-nav-offset"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={arabicStyle}
    >
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Target className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          {t('missions.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('missions.subtitle')}</p>
      </div>

      {/* New Mission card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t('missions.newMission')}
        </h2>

        <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Line 1: I intend to [action] */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground/80">{t('missions.iIntendTo')}</span>
            <select
              value={actionValue}
              onChange={(e) => setActionValue(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={arabicStyle}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="">—</option>
              <optgroup label={t('nav.prayers')}>
                {PRAYERS.map((p) => (
                  <option key={p} value={`prayer:${p}`}>
                    {t(`prayerNames.${p}` as any)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('habits.title')}>
                {allHabits.map((h) => (
                  <option key={h.id} value={`habit:${h.id}`}>
                    {tHabit(h.id)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Nafilah">
                {nafilahPrayers.map((n) => (
                  <option key={n.id} value={`nafilah:${n.id}`}>
                    {n.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Line 2 (only if prayer): qualifier */}
          {isPrayer && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground/80">·</span>
              <select
                value={qualifier}
                onChange={(e) => setQualifier(e.target.value as MissionQualifier)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                style={arabicStyle}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="on-time">{t('missions.onTime')}</option>
                <option value="jamaah">{t('missions.inJamaah')}</option>
              </select>
            </div>
          )}

          {/* Line 3: for X days */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground/80">{t('missions.for')}</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={daysValue}
              onChange={(e) => setDaysValue(e.target.value)}
              className="w-24"
            />
            <span className="text-foreground/80">{t('missions.days')}</span>
          </div>

          {/* Line 4: and may miss X */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground/80">{t('missions.mayMiss')}</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={missesValue}
              onChange={(e) => setMissesValue(e.target.value)}
              className="w-24"
            />
            <span className="text-foreground/80">{t('missions.misses')}</span>
          </div>
        </div>

        <Button
          onClick={handleBegin}
          disabled={!parsed || !daysValue}
          className="w-full gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {t('missions.begin')}
        </Button>
      </div>

      {/* Active missions */}
      {missions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t('missions.active')}
          </h2>
          {missions.map((m) => {
            const p = computeProgress(m);
            const label = getActionLabel(m, t, tHabit, lang);
            const pct = Math.min(100, (p.progress / m.days) * 100);
            const missedMsg = t('missions.missedBeforeLose')
              .replace('{used}', String(p.missesUsed))
              .replace('{allowed}', String(p.missesAllowed));
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground leading-snug">
                    {t('missions.iIntendTo')} <span className="text-primary">{label}</span>{' '}
                    {t('missions.for')} {m.days} {t('missions.days')}
                  </p>
                  <button
                    onClick={() => deleteMission(m.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Progress value={pct} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {p.progress} / {m.days} {t('missions.days')}
                  </span>
                  <span>
                    {p.daysRemaining} {t('missions.remaining')}
                  </span>
                  <span className="text-accent font-medium">
                    +{p.bonus} {t('missions.bonus')}
                  </span>
                </div>
                <p className={`text-xs ${p.missesUsed >= p.missesAllowed ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {missedMsg}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {/* Completed missions */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t('missions.completed')}
          </h2>
          {completed.map((m) => {
            const label = getActionLabel(m, t, tHabit, lang);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 to-amber-100/10 p-4 shadow-card"
              >
                <p className="font-medium text-foreground">
                  {t('missions.iIntendTo')} <span className="text-gold">{label}</span>{' '}
                  {t('missions.for')} {m.days} {t('missions.days')}
                </p>
                <p className="text-sm text-gold mt-1">
                  +{m.bonus} {t('missions.bonus')}
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">
                  {t('missions.accepted')}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {/* Ended missions */}
      {endedMissions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-muted-foreground">
            {t('missions.endedTitle')}
          </h2>
          {endedMissions.map((m) => {
            const label = getActionLabel(m, t, tHabit, lang);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2"
              >
                <p className="text-foreground/80">
                  {t('missions.iIntendTo')} <span className="font-medium">{label}</span>{' '}
                  {t('missions.for')} {m.days} {t('missions.days')}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {t('missions.endedEarly')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => recreateMission(m)}>
                    {t('missions.tryAgain')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeEnded(m.id)}>
                    {t('common.close')}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <CompletionCelebration
        show={!!celebrate}
        onDismiss={() => setCelebrate(null)}
        durationMs={3000}
      />
    </div>
  );
}
