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

type HabitLevel = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

const levelColors: Record<HabitLevel, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hard: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  sahabah: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  custom: 'bg-accent/20 text-accent',
};

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
    <div className="container max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          {t('habits.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('habits.subtitle')}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{t('habits.selectLevel')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((key) => (
            <button
              key={key}
              onClick={() => applyLevel(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                level === key
                  ? levelColors[key] + ' ring-2 ring-offset-2 ring-primary/30'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {t(`habits.${key}` as any)}
              <span className="ml-1.5 text-xs opacity-70">({levelCount(key)})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{t('habits.pointsToday')}</p>
            <p className="text-2xl font-display font-bold text-foreground">{getTotalPoints()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('habits.completed')}</p>
            <p className="text-2xl font-display font-bold text-primary">
              {getCompletedCount()}/{getActiveCount()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
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

      <TimeBoundSection />
    </div>
  );
}
