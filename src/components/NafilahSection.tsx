import { Moon, Sun, Sunrise, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { NafilahPrayer, NafilahDifficulty } from '@/hooks/useNafilahTracking';
import { haptics } from '@/lib/haptics';

interface NafilahSectionProps {
  prayers: NafilahPrayer[];
  onToggle: (id: string) => void;
}

const difficultyConfig: Record<NafilahDifficulty, { label: string; color: string; bgColor: string; icon: typeof Moon }> = {
  hard: { label: 'Svår', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: Moon },
  medium: { label: 'Medel', color: 'text-accent', bgColor: 'bg-accent/10', icon: Sunrise },
  easy: { label: 'Lätt', color: 'text-primary', bgColor: 'bg-primary/10', icon: Sun },
};

export function NafilahSection({ prayers, onToggle }: NafilahSectionProps) {
  const grouped: Record<NafilahDifficulty, NafilahPrayer[]> = {
    hard: prayers.filter(p => p.difficulty === 'hard'),
    medium: prayers.filter(p => p.difficulty === 'medium'),
    easy: prayers.filter(p => p.difficulty === 'easy'),
  };

  const groups: { difficulty: NafilahDifficulty; title: string }[] = [
    { difficulty: 'hard', title: 'Svåra – Kräver extra ansträngning' },
    { difficulty: 'medium', title: 'Medel – Kräver planering' },
    { difficulty: 'easy', title: 'Lätta – Vanebildande' },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl font-bold text-foreground">Nafila-böner</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        Frivilliga böner – svårare böner ger fler poäng
      </p>

      <div className="space-y-6">
        {groups.map(({ difficulty, title }) => {
          const config = difficultyConfig[difficulty];
          const Icon = config.icon;
          return (
            <div key={difficulty}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn('h-4 w-4', config.color)} />
                <h4 className={cn('text-sm font-semibold', config.color)}>{title}</h4>
              </div>
              <div className="space-y-2">
                {grouped[difficulty].map((prayer) => (
                  <label
                    key={prayer.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200',
                      prayer.completed
                        ? cn(config.bgColor, 'border-transparent')
                        : 'bg-card border-border/50 hover:bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={prayer.completed}
                      onCheckedChange={() => { haptics.light(); onToggle(prayer.id); }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          prayer.completed && 'line-through text-muted-foreground'
                        )}>
                          {prayer.name}
                        </span>
                        <span className="text-xs text-muted-foreground" dir="rtl">
                          {prayer.arabicName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {prayer.description} · {prayer.rakaat}
                      </p>
                    </div>
                    <div className={cn(
                      'text-sm font-bold px-2 py-1 rounded-lg',
                      config.bgColor, config.color
                    )}>
                      +{prayer.points}p
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
