import { Calendar, Check, Clock, Pause, Play, Star } from 'lucide-react';
import { useTimeBoundHabits } from '@/hooks/useTimeBoundHabits';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { localeFor } from '@/lib/date';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader } from '@/components/common';

interface TimeBoundSectionProps {
  selectedDate?: Date;
}

/**
 * Deeds tied to a date in the Hijri calendar — Jumuʿah, the sunnah fasts, the
 * two Eids. Split into what is live today, what is coming, and what the user
 * has paused, so the section stays short on an ordinary day.
 */
export function TimeBoundSection({ selectedDate }: TimeBoundSectionProps) {
  const { t, lang } = useTranslation();
  const { showArabic } = useUserPrefs();
  const {
    events,
    completedEvents,
    pausedEvents,
    toggleEvent,
    togglePause,
    hijriDate,
    hijriMonthName,
  } = useTimeBoundHabits(selectedDate);

  const active = events.filter((e) => e.isActive && !pausedEvents.has(e.id));
  const upcoming = events.filter((e) => !e.isActive && !pausedEvents.has(e.id));
  const paused = events.filter((e) => pausedEvents.has(e.id));

  /**
   * "in 5 days" / "om 5 dagar" / "5 gün sonra" — Intl already knows how every
   * language phrases this, so no translated strings are needed.
   */
  const relativeDays = new Intl.RelativeTimeFormat(localeFor(lang), { numeric: 'auto' });

  const nameOf = (id: string, fallback: string) => {
    const translated = t(`timeBoundNames.${id}` as never);
    return translated === `timeBoundNames.${id}` ? fallback : translated;
  };

  const GroupLabel = ({ icon: Icon, children }: { icon: typeof Star; children: string }) => (
    <p className="flex items-center gap-1.5 px-4 pb-1.5 pt-3 text-[0.75rem] font-medium text-muted-foreground">
      <Icon className="h-3 w-3" strokeWidth={2} />
      {children}
    </p>
  );

  return (
    <Panel>
      <PanelHeader
        icon={Calendar}
        label={t('timeBound.title')}
        value={
          <span className="text-[0.75rem] font-normal text-muted-foreground">
            {hijriDate.day} {hijriMonthName?.ar} {hijriDate.year}
          </span>
        }
      />

      <div className="border-t border-border/70 pb-2">
        {active.length > 0 && (
          <>
            <GroupLabel icon={Star}>{t('timeBound.today')}</GroupLabel>
            {active.map((event) => {
              const done = completedEvents.has(event.id);
              return (
                <div key={event.id} className="flex items-center gap-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      toggleEvent(event.id);
                    }}
                    aria-pressed={done}
                    className="flex flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-start transition-colors duration-base ease-brand hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-base ease-brand',
                        done ? 'border-primary bg-primary' : 'border-border',
                      )}
                    >
                      {done && (
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-[0.9375rem]',
                          done ? 'font-medium text-primary' : 'text-foreground',
                        )}
                      >
                        {nameOf(event.id, event.name)}
                      </span>
                      {showArabic && (
                        <span className="block truncate text-xs text-muted-foreground" dir="rtl">
                          {event.arabicName}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-[0.8125rem] font-semibold tabular-nums',
                        done ? 'text-primary' : 'text-muted-foreground/70',
                      )}
                    >
                      +{event.points}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePause(event.id)}
                    aria-label={t('habits.pauseHint')}
                    className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <GroupLabel icon={Clock}>{t('timeBound.upcoming')}</GroupLabel>
            {upcoming.map((event) => (
              <div key={event.id} className="flex items-center gap-2 px-2">
                <div className="flex flex-1 items-center gap-3 px-2 py-2.5">
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-border" />
                  <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-muted-foreground">
                    {nameOf(event.id, event.name)}
                  </span>
                  <span className="shrink-0 text-end text-xs text-muted-foreground/80">
                    {relativeDays.format(event.daysUntil, 'day')}
                    {event.hijriDate && (
                      <span className="block text-muted-foreground/60">{event.hijriDate}</span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => togglePause(event.id)}
                  aria-label={t('habits.pauseHint')}
                  className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
                >
                  <Pause className="h-4 w-4" />
                </button>
              </div>
            ))}
          </>
        )}

        {paused.length > 0 && (
          <>
            <GroupLabel icon={Pause}>{t('habits.paused')}</GroupLabel>
            {paused.map((event) => (
              <div key={event.id} className="flex items-center gap-2 px-2">
                <span className="flex-1 truncate px-2 py-2.5 text-[0.9375rem] text-muted-foreground/60">
                  {nameOf(event.id, event.name)}
                </span>
                <button
                  type="button"
                  onClick={() => togglePause(event.id)}
                  aria-label={t('habits.activateHint')}
                  className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors duration-base ease-brand hover:bg-muted hover:text-primary"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </Panel>
  );
}
