import { Sun, Moon as MoonIcon, Bed, Utensils, Settings2, Pause, Play } from 'lucide-react';
import { useHabitsTracking, habitCategories } from '@/hooks/useHabitsTracking';
import { TimeBoundSection } from '@/components/TimeBoundSection';

type HabitLevel = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

const levelConfig: Record<HabitLevel, { label: string; description: string; color: string }> = {
  easy: { label: 'Easy', description: 'Grundläggande sunnahs', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  medium: { label: 'Medium', description: 'Easy + Duha, Tahajjud, fasta', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  hard: { label: 'Hard', description: 'Medium + utökade rutiner', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  sahabah: { label: 'Sahabah', description: 'Maximal disciplin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  custom: { label: 'Custom', description: 'Välj själv vilka vanor', color: 'bg-accent/20 text-accent' },
};

const iconMap: Record<string, typeof Sun> = {
  Sun,
  Moon: MoonIcon,
  Bed,
  Utensils,
};

export default function Habits() {
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

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Dagliga vanor
        </h1>
        <p className="text-muted-foreground text-sm">
          Tryck på paus-ikonen för att gråa ut vanor du inte vill spåra just nu
        </p>
      </div>

      {/* Level Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Välj nivå (mall)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(levelConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => applyLevel(key as HabitLevel)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                level === key
                  ? config.color + ' ring-2 ring-offset-2 ring-primary/30'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {levelConfig[level].description} • Du kan alltid justera individuellt
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Dagens poäng</p>
            <p className="text-2xl font-display font-bold text-foreground">{getTotalPoints()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Avklarade</p>
            <p className="text-2xl font-display font-bold text-primary">
              {getCompletedCount()}/{getActiveCount()}
            </p>
          </div>
        </div>
      </div>

      {/* Regular Habit Categories */}
      <div className="space-y-4 mb-6">
        {habitCategories.map((category) => {
          const IconComponent = iconMap[category.icon] || Sun;
          const activeHabits = category.habits.filter(h => !pausedHabits.has(h.id));
          const pausedHabitsInCategory = category.habits.filter(h => pausedHabits.has(h.id));

          return (
            <div
              key={category.id}
              className="rounded-2xl gradient-card shadow-card border border-border/50 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 border-b border-border/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeHabits.length} aktiva • {pausedHabitsInCategory.length} pausade
                  </p>
                </div>
              </div>
              
              <div className="p-2">
                {/* Active habits */}
                {activeHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                      completedHabits.has(habit.id)
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <button
                      onClick={() => { import('@/lib/haptics').then(m => m.haptics.light()); toggleHabit(habit.id); }}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          completedHabits.has(habit.id)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {completedHabits.has(habit.id) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${completedHabits.has(habit.id) ? 'text-primary font-medium' : 'text-foreground'}`}>
                          {habit.name}
                        </span>
                        {habit.arabicName && (
                          <span className="text-xs text-muted-foreground block">{habit.arabicName}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${completedHabits.has(habit.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                        +{habit.points}p
                      </span>
                    </button>
                    <button
                      onClick={() => togglePause(habit.id)}
                      className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                      title="Pausa denna vana"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Paused habits */}
                {pausedHabitsInCategory.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground px-3 mb-1">Pausade</p>
                    {pausedHabitsInCategory.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-2 p-3 rounded-xl opacity-50"
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground line-through">
                              {habit.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +{habit.points}p
                          </span>
                        </div>
                        <button
                          onClick={() => togglePause(habit.id)}
                          className="p-1.5 rounded-lg hover:bg-muted/70 text-muted-foreground hover:text-primary transition-colors"
                          title="Aktivera denna vana"
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
        })}
      </div>

      {/* Time-Bound Section */}
      <TimeBoundSection />
    </div>
  );
}
