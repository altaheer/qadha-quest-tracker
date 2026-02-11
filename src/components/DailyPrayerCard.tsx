import { useState } from 'react';
import { Check, Clock, X, ChevronDown, ChevronUp, Flame, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PrayerStatus, SunnahItem, PrayerStreak } from '@/hooks/usePrayerTracking';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DailyPrayerCardProps {
  name: string;
  arabicName: string;
  status: PrayerStatus;
  streak: PrayerStreak;
  points: number;
  sunnahItems: SunnahItem[];
  onMarkStatus: (status: PrayerStatus) => void;
  onToggleSunnah: (sunnahId: string) => void;
  delay?: number;
}

const statusConfig = {
  pending: {
    bgClass: 'bg-card',
    borderClass: 'border-border/50',
    label: 'Väntar',
    icon: null,
  },
  'on-time': {
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
    label: 'I tid',
    icon: Check,
  },
  jamaah: {
    bgClass: 'bg-primary/20',
    borderClass: 'border-primary/50',
    label: 'Jamaah',
    icon: Users,
  },
  late: {
    bgClass: 'bg-accent/10',
    borderClass: 'border-accent/30',
    label: 'Sent',
    icon: Clock,
  },
  missed: {
    bgClass: 'bg-muted',
    borderClass: 'border-muted-foreground/20',
    label: 'Missad',
    icon: X,
  },
};

export function DailyPrayerCard({
  name,
  arabicName,
  status,
  streak,
  points,
  sunnahItems,
  onMarkStatus,
  onToggleSunnah,
  delay = 0,
}: DailyPrayerCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[status];
  const completedSunnah = sunnahItems.filter(s => s.completed).length;

  return (
    <div
      className={cn(
        'rounded-2xl p-4 shadow-card border transition-all duration-300 animate-fade-in',
        config.bgClass,
        config.borderClass
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-muted-foreground text-sm" dir="rtl">{arabicName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {streak.current > 0 && (
            <div className="flex items-center gap-1 text-accent">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">{streak.current}</span>
              {streak.multiplier > 1 && (
                <span className="text-xs bg-accent/20 px-1.5 rounded-full">
                  {streak.multiplier}x
                </span>
              )}
            </div>
          )}
          {points > 0 && (
            <div className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded-lg">
              +{points}p
            </div>
          )}
        </div>
      </div>

      {/* Status Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          variant={status === 'on-time' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onMarkStatus('on-time')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'on-time' && 'bg-primary hover:bg-primary/90'
          )}
        >
          <Check className="h-3.5 w-3.5" />
          I tid
        </Button>
        <Button
          variant={status === 'jamaah' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onMarkStatus('jamaah')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'jamaah' && 'bg-primary hover:bg-primary/90'
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Jamaah
        </Button>
        <Button
          variant={status === 'late' ? 'gold' : 'outline'}
          size="sm"
          onClick={() => onMarkStatus('late')}
          className="flex-1 gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Sent
        </Button>
        <Button
          variant={status === 'missed' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onMarkStatus('missed')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'missed' && 'bg-muted-foreground/20 text-muted-foreground'
          )}
        >
          <X className="h-3.5 w-3.5" />
          Missad
        </Button>
      </div>

      {/* Sunnah & Extras */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
            <span className="flex items-center gap-2">
              Sunnah & Extras
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {completedSunnah}/{sunnahItems.length}
              </span>
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {sunnahItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggleSunnah(item.id)}
              />
              <div className="flex-1 flex items-center justify-between">
                <span className={cn(
                  'text-sm',
                  item.completed && 'text-muted-foreground line-through'
                )}>
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground" dir="rtl">
                  {item.arabicName}
                </span>
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
