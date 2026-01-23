import { Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center py-8 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-elevated mb-4">
        <Moon className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
        Qadha Prayer Tracker
      </h1>
      <p className="text-muted-foreground font-body max-w-md mx-auto">
        Keep track of your missed prayers and see how long it will take to complete them
      </p>
    </header>
  );
}
