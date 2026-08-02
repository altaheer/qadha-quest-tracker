import { useState } from 'react';
import { Sun, Moon as MoonIcon, Bed, Utensils, Star, Settings2, Pause, Play, Info, ChevronDown } from 'lucide-react';
import { useHabitsTracking, habitCategories, levelHabits } from '@/hooks/useHabitsTracking';
import { TimeBoundSection } from '@/components/TimeBoundSection';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HadithInfoContent } from '@/components/HadithInfoContent';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Page, PageHeader, Panel, SectionLabel, Stat } from '@/components/common';

type HabitLevel = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

/**
 * Levels read as one ascending scale rather than five unrelated colours: the
 * selected level fills with the primary, the rest stay quiet.
 */
const SELECTED_LEVEL = 'bg-primary text-primary-foreground';

const iconMap: Record<string, typeof Sun> = { Sun, Moon: MoonIcon, Bed, Utensils, Star };

const allHabitsCount = habitCategories.reduce((n, c) => n + c.habits.length, 0);

function levelCount(key: HabitLevel) {
  return key === 'custom' ? allHabitsCount : levelHabits[key].length;
}

function InfoButton({ id }: { id: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); haptics.light(); }}
          className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/70 transition-colors"
          aria-label="Info"
        >
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-72">
        <HadithInfoContent id={id} />
      </PopoverContent>
    </Popover>
  );
}

export default function Habits() {
  const { t, tHabit, tHabitCategory } = useTranslation();
  const { showArabic } = useUserPrefs();
  const {
    completedHabits,
    pausedHabits,
    level,
    toggleHabit,
    togglePause,
    applyLevel,
    getTotalPoints,
    getActiveCount,
    getCompletedCount,
  } = useHabitsTracking();

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(habitCategories.map(c => [c.id, true]))
  );

  const levels: HabitLevel[] = ['easy', 'medium', 'hard', 'sahabah', 'custom'];

  return (
    <Page>
      <PageHeader title={t('habits.title')} subtitle={t('habits.subtitle')} />

      <Panel>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <Stat value={getCompletedCount() + '/' + getActiveCount()} label={t('habits.completed')} tone="primary" />
          <Stat
            className="text-end"
            value={getTotalPoints()}
            label={t('habits.pointsToday')}
          />
        </div>
      </Panel>

      <SectionLabel>
        <span className="inline-flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
          {t('habits.selectLevel')}
        </span>
      </SectionLabel>
      <div className="flex flex-wrap gap-2">
        {levels.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={level === key}
            onClick={() => applyLevel(key)}
            className={cn(
              'rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-base ease-brand',
              level === key ? SELECTED_LEVEL : 'bg-secondary text-muted-foreground hover:bg-secondary/70',
            )}
          >
            {t(`habits.${key}` as never)}
            <span className="ms-1.5 tabular-nums opacity-60">{levelCount(key)}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {habitCategories.filter(c => c.id !== 'misc' || level === 'custom').map((category) => {
          const IconComponent = iconMap[category.icon] || Sun;
          const activeHabits = category.habits.filter(h => !pausedHabits.has(h.id));
          const pausedHabitsInCategory = category.habits.filter(h => pausedHabits.has(h.id));
          const isOpen = openCategories[category.id] ?? true;

          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={(v) => setOpenCategories(s => ({ ...s, [category.id]: v }))}
              className="rounded-2xl gradient-card shadow-card border border-border/50 overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 border-b border-border/30 text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">{tHabitCategory(category.id)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {activeHabits.length} {t('habits.active')} • {pausedHabitsInCategory.length} {t('habits.paused').toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-2">
                  {activeHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-1 p-3 rounded-xl transition-all ${
                        completedHabits.has(habit.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <button onClick={() => { haptics.light(); toggleHabit(habit.id); }} className="flex-1 flex items-center gap-3 text-left">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          completedHabits.has(habit.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {completedHabits.has(habit.id) && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm ${completedHabits.has(habit.id) ? 'text-primary font-medium' : 'text-foreground'}`}>
                            {tHabit(habit.id)}
                          </span>
                          {showArabic && habit.arabicName && (
                            <span className="text-xs text-muted-foreground block">{habit.arabicName}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${completedHabits.has(habit.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                          +{habit.points}p
                        </span>
                      </button>
                      <InfoButton id={habit.id} />
                      <button
                        onClick={() => togglePause(habit.id)}
                        className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                        title={t('habits.pauseHint')}
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {pausedHabitsInCategory.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground px-3 mb-1">{t('habits.paused')}</p>
                      {pausedHabitsInCategory.map((habit) => (
                        <div key={habit.id} className="flex items-center gap-1 p-3 rounded-xl opacity-50">
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                            <div className="flex-1">
                              <span className="text-sm text-muted-foreground line-through">{tHabit(habit.id)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">+{habit.points}p</span>
                          </div>
                          <InfoButton id={habit.id} />
                          <button
                            onClick={() => togglePause(habit.id)}
                            className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-primary transition-colors"
                            title={t('habits.activateHint')}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <div className="pt-5">
        <TimeBoundSection />
      </div>
    </Page>
  );
}
