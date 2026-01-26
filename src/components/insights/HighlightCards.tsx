import { Flame, Star, BookOpen } from 'lucide-react';

interface HighlightCardsProps {
  streak: number;
  bestDay: string;
  quranPages: number;
}

export function HighlightCards({ streak, bestDay, quranPages }: HighlightCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Flame className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{streak}</p>
        <p className="text-xs text-muted-foreground">Streak</p>
      </div>
      
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <Star className="h-5 w-5 text-accent mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{bestDay}</p>
        <p className="text-xs text-muted-foreground">Bästa dag</p>
      </div>
      
      <div className="gradient-card rounded-xl p-4 text-center shadow-card border border-border/50">
        <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
        <p className="font-display text-2xl font-bold text-foreground">{quranPages}</p>
        <p className="text-xs text-muted-foreground">Koran-sidor</p>
      </div>
    </div>
  );
}
