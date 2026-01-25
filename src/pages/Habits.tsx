import { BookOpen, Sun, Moon as MoonIcon, Bed, Utensils, Settings2 } from 'lucide-react';
import { useState } from 'react';

type HabitLevel = 'easy' | 'medium' | 'hard' | 'sahabah' | 'custom';

const levelConfig: Record<HabitLevel, { label: string; description: string; color: string }> = {
  easy: { label: 'Easy', description: 'Grundläggande sunnahs', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', description: 'Easy + Duha, Tahajjud', color: 'bg-blue-100 text-blue-700' },
  hard: { label: 'Hard', description: 'Medium + utökade rutiner', color: 'bg-orange-100 text-orange-700' },
  sahabah: { label: 'Sahabah', description: 'Maximal disciplin', color: 'bg-purple-100 text-purple-700' },
  custom: { label: 'Custom', description: 'Välj själv', color: 'bg-accent/20 text-accent' },
};

const habitCategories = [
  {
    id: 'morning',
    name: 'Morgonrutiner',
    icon: Sun,
    habits: [
      { id: 'morning-adhkar', name: 'Morgon-adhkār', points: 5 },
      { id: 'wake-dua', name: 'Vakna-du\'a', points: 2 },
      { id: 'wake-siwak', name: 'Siwāk vid uppvaknande', points: 2 },
    ],
  },
  {
    id: 'evening',
    name: 'Kvällsrutiner',
    icon: MoonIcon,
    habits: [
      { id: 'evening-adhkar', name: 'Kvälls-adhkār', points: 5 },
    ],
  },
  {
    id: 'sleep',
    name: 'Innan sömn',
    icon: Bed,
    habits: [
      { id: 'sleep-wudu', name: 'Wudu före sömn', points: 3 },
      { id: 'sleep-kursi', name: 'Āyat al-Kursī', points: 4 },
      { id: 'sleep-mulk', name: 'Sūrah Al-Mulk', points: 4 },
      { id: 'sleep-3quls', name: '3 Quls', points: 3 },
      { id: 'sleep-baqarah', name: 'Sista 2 verserna Al-Baqarah', points: 3 },
      { id: 'sleep-dua', name: 'Sova-du\'a', points: 2 },
      { id: 'sleep-right', name: 'Sova på höger sida', points: 2 },
    ],
  },
  {
    id: 'daily',
    name: 'Under dagen',
    icon: Utensils,
    habits: [
      { id: 'duha', name: 'Duha-bön', points: 5 },
      { id: 'bismillah', name: 'Bismillah före mat', points: 2 },
      { id: 'right-hand', name: 'Äta med höger hand', points: 2 },
      { id: 'smile', name: 'Le mot andra', points: 2 },
    ],
  },
];

export default function Habits() {
  const [selectedLevel, setSelectedLevel] = useState<HabitLevel>('easy');
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());

  const toggleHabit = (habitId: string) => {
    setCompletedHabits(prev => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const totalPoints = habitCategories.reduce((sum, cat) => 
    sum + cat.habits.reduce((catSum, h) => 
      catSum + (completedHabits.has(h.id) ? h.points : 0), 0), 0);

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-primary shadow-elevated mb-3">
          <BookOpen className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Dagliga vanor
        </h1>
        <p className="text-muted-foreground text-sm">
          Bygg sunna-rutiner steg för steg
        </p>
      </div>

      {/* Level Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Välj nivå</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(levelConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedLevel(key as HabitLevel)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedLevel === key
                  ? config.color + ' ring-2 ring-offset-2 ring-primary/30'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {levelConfig[selectedLevel].description}
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Dagens poäng</p>
            <p className="text-2xl font-display font-bold text-foreground">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Avklarade</p>
            <p className="text-2xl font-display font-bold text-primary">
              {completedHabits.size}/{habitCategories.reduce((sum, c) => sum + c.habits.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Habit Categories */}
      <div className="space-y-4">
        {habitCategories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl gradient-card shadow-card border border-border/50 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/30">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <category.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">
                {category.name}
              </h3>
            </div>
            <div className="p-2">
              {category.habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    completedHabits.has(habit.id)
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
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
                    <span className={`text-sm ${completedHabits.has(habit.id) ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {habit.name}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${completedHabits.has(habit.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{habit.points}p
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
