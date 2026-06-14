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
  type Mission,
  type MissionActionType,
  type MissionQualifier,
} from '@/hooks/useMissions';
import { CompletionCelebration } from '@/components/CompletionCelebration';

const DURATION_PRESETS = [7, 14, 21, 30, 40];

function parseActionValue(v: string): {
  actionType: MissionActionType;
  actionId: string;
  qualifier?: MissionQualifier;
} | null {
  if (!v) return null;
  const parts = v.split(':');
  const type = parts[0] as MissionActionType;
  if (type === 'prayer') {
    return { actionType: 'prayer', actionId: parts[1], qualifier: parts[2] as MissionQualifier };
  }
  return { actionType: type, actionId: parts[1] };
}

function getPausedHabits(): Set<string> {
  try {
    const v = localStorage.getItem('habits-paused');
    return v ? new Set(JSON.parse(v)) : new Set();
  } catch {
    return new Set();
  }
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
  const [daysValue, setDaysValue] = useState<string>('30');
  const [customDays, setCustomDays] = useState('');
  const [missesValue, setMissesValue] = useState<string>('auto');
  const [customMisses, setCustomMisses] = useState('');
  const [celebrate, setCelebrate] = useState<{ sentence: string; bonus: number } | null>(null);

  const pausedHabits = useMemo(() => getPausedHabits(), []);

  // Reconcile on mount
  useEffect(() => {
    const { justCompleted } = reconcile();
    if (justCompleted.length > 0) {
      const first = justCompleted[0];
      const sentence = getActionLabel(first, t, tHabit, lang);
      setCelebrate({ sentence, bonus: first.bonus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBegin = () => {
    const parsed = parseActionValue(actionValue);
    if (!parsed) return;
    const days =
      daysValue === 'custom'
        ? Math.max(1, Number(customDays) || 0)
        : Number(daysValue);
    if (days < 1) return;
    let missesAllowed: number | undefined;
    if (missesValue === 'custom') {
      const n = Math.max(0, Number(customMisses) || 0);
      missesAllowed = n;
    } else if (missesValue !== 'auto') {
      missesAllowed = Math.max(0, Number(missesValue));
    }
    createMission({ ...parsed, days, missesAllowed });
    setActionValue('');
    setDaysValue('30');
    setCustomDays('');
    setMissesValue('auto');
    setCustomMisses('');
  };

  const activeHabits = habitCategories
    .flatMap((c) => c.habits)
    .filter((h) => !pausedHabits.has(h.id));

  // Build the sentence builder rendered as ONE flowing sentence
  const sentence = (
    <div
      className="flex flex-wrap items-center gap-2 text-base"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={arabicStyle}
    >
      <span className="text-foreground/80">{t('missions.iIntendTo')}</span>
      <select
        value={actionValue}
        onChange={(e) => setActionValue(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium min-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        style={arabicStyle}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <option value="">—</option>
        <optgroup label={t('nav.prayers')}>
          <option value="prayer:all:on-time">{getActionLabel({ actionType: 'prayer', actionId: 'all', qualifier: 'on-time' }, t, tHabit, lang)}</option>
          <option value="prayer:all:jamaah">{getActionLabel({ actionType: 'prayer', actionId: 'all', qualifier: 'jamaah' }, t, tHabit, lang)}</option>
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => (
            <optgroup key={p} label={t(`prayerNames.${p}` as any)}>
              <option value={`prayer:${p}:on-time`}>
                {getActionLabel({ actionType: 'prayer', actionId: p, qualifier: 'on-time' }, t, tHabit, lang)}
              </option>
              <option value={`prayer:${p}:jamaah`}>
                {getActionLabel({ actionType: 'prayer', actionId: p, qualifier: 'jamaah' }, t, tHabit, lang)}
              </option>
            </optgroup>
          ))}
        </optgroup>
        {activeHabits.length > 0 && (
          <optgroup label={t('habits.title')}>
            {activeHabits.map((h) => (
              <option key={h.id} value={`habit:${h.id}`}>
                {getActionLabel({ actionType: 'habit', actionId: h.id }, t, tHabit, lang)}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Nafilah">
          {nafilahPrayers.map((n) => (
            <option key={n.id} value={`nafilah:${n.id}`}>
              {getActionLabel({ actionType: 'nafilah', actionId: n.id }, t, tHabit, lang)}
            </option>
          ))}
        </optgroup>
      </select>
      <span className="text-foreground/80">{t('missions.for')}</span>
      <select
        value={daysValue}
        onChange={(e) => setDaysValue(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        style={arabicStyle}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {DURATION_PRESETS.map((d) => (
          <option key={d} value={String(d)}>
            {d}
          </option>
        ))}
        <option value="custom">{t('missions.custom')}</option>
      </select>
      {daysValue === 'custom' && (
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          value={customDays}
          onChange={(e) => setCustomDays(e.target.value)}
          className="w-24"
          placeholder="..."
        />
      )}
      <span className="text-foreground/80">{t('missions.days')},</span>
      <span className="text-foreground/80">{t('missions.allowingUpTo')}</span>
      <select
        value={missesValue}
        onChange={(e) => setMissesValue(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        style={arabicStyle}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <option value="auto">10% (auto)</option>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="5">5</option>
        <option value="7">7</option>
        <option value="custom">{t('missions.custom')}</option>
      </select>
      {missesValue === 'custom' && (
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={customMisses}
          onChange={(e) => setCustomMisses(e.target.value)}
          className="w-24"
          placeholder="..."
        />
      )}
      <span className="text-foreground/80">{t('missions.misses')}</span>
    </div>
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
        {sentence}
        <Button
          onClick={handleBegin}
          disabled={!actionValue || (daysValue === 'custom' && !customDays)}
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
                  <span>
                    {p.missesUsed}/{p.missesAllowed} {t('missions.missesUsed')}
                  </span>
                  <span className="text-accent font-medium">
                    +{p.bonus} {t('missions.bonus')}
                  </span>
                </div>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recreateMission(m)}
                  >
                    {t('missions.tryAgain')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEnded(m.id)}
                  >
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
