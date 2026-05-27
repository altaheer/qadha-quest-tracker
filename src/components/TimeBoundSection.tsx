import { Calendar, Clock, Pause, Play, Star } from 'lucide-react';
import { useTimeBoundHabits } from '@/hooks/useTimeBoundHabits';
import { haptics } from '@/lib/haptics';

interface TimeBoundSectionProps {
  selectedDate?: Date;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  weekly: { label: 'Veckovis', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  monthly: { label: 'Månadsvis', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  yearly: { label: 'Årligen', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export function TimeBoundSection({ selectedDate }: TimeBoundSectionProps) {
  const {
    events,
    completedEvents,
    pausedEvents,
    toggleEvent,
    togglePause,
    hijriDate,
    hijriMonthName,
  } = useTimeBoundHabits(selectedDate);

  // Separate active and upcoming events
  const activeEvents = events.filter(e => e.isActive && !pausedEvents.has(e.id));
  const upcomingEvents = events.filter(e => !e.isActive && !pausedEvents.has(e.id));
  const pausedEventsList = events.filter(e => pausedEvents.has(e.id));

  return (
    <div className="rounded-2xl gradient-card shadow-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground">
            Tidsbundna gärningar
          </h3>
          <p className="text-xs text-muted-foreground">
            {hijriDate.day} {hijriMonthName?.ar} {hijriDate.year} AH
          </p>
        </div>
      </div>

      <div className="p-2">
        {/* Active Today */}
        {activeEvents.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-primary px-3 py-1 flex items-center gap-1">
              <Star className="h-3 w-3" /> Aktiva idag
            </p>
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                  completedEvents.has(event.id)
                    ? 'bg-primary/10'
                    : 'hover:bg-muted/50'
                }`}
              >
                <button
                  onClick={() => { haptics.light(); toggleEvent(event.id); }}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      completedEvents.has(event.id)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {completedEvents.has(event.id) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${completedEvents.has(event.id) ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {event.name}
                    </span>
                    <span className="text-xs text-muted-foreground block">{event.arabicName}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${completedEvents.has(event.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                      +{event.points}p
                    </span>
                    <span className={`text-xs block ${typeLabels[event.type].color} px-1.5 py-0.5 rounded mt-0.5`}>
                      {typeLabels[event.type].label}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => togglePause(event.id)}
                  className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                  title="Pausa"
                >
                  <Pause className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground px-3 py-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Kommande
            </p>
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-3 rounded-xl opacity-60"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground line-through">
                      {event.name}
                    </span>
                    <span className="text-xs text-muted-foreground/70 block">{event.arabicName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {event.nextDate}
                    </span>
                    {event.hijriDate && (
                      <span className="text-xs text-muted-foreground/70 block">
                        {event.hijriDate}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => togglePause(event.id)}
                  className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                  title="Pausa"
                >
                  <Pause className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Paused Events */}
        {pausedEventsList.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground px-3 mb-1">Pausade</p>
            {pausedEventsList.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-3 rounded-xl opacity-40"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground line-through">
                      {event.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => togglePause(event.id)}
                  className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-primary transition-colors"
                  title="Aktivera"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
