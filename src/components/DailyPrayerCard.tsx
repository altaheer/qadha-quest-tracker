import { useState } from 'react';
import { Check, Clock, X, ChevronDown, ChevronUp, Flame, Users, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PrayerStatus, SunnahItem, PrayerStreak } from '@/hooks/usePrayerTracking';
import { Checkbox } from '@/components/ui/checkbox';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DailyPrayerCardProps {
  name: string;
  arabicName: string;
  status: PrayerStatus;
  streak: PrayerStreak;
  points: number;
  comboMultiplier: number;
  sunnahItems: SunnahItem[];
  onMarkStatus: (status: PrayerStatus) => void;
  onToggleSunnah: (sunnahId: string) => void;
  delay?: number;
}

const statusBg: Record<PrayerStatus, { bg: string; border: string; icon: any }> = {
  pending: { bg: 'bg-card', border: 'border-border/50', icon: null },
  'on-time': { bg: 'bg-primary/10', border: 'border-primary/30', icon: Check },
  jamaah: { bg: 'bg-primary/20', border: 'border-primary/50', icon: Users },
  late: { bg: 'bg-accent/10', border: 'border-accent/30', icon: Clock },
  missed: { bg: 'bg-muted', border: 'border-muted-foreground/20', icon: X },
};

export function DailyPrayerCard({
  name,
  arabicName,
  status,
  streak,
  points,
  comboMultiplier,
  sunnahItems,
  onMarkStatus,
  onToggleSunnah,
  delay = 0,
}: DailyPrayerCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const config = statusBg[status];
  const completedSunnah = sunnahItems.filter(s => s.completed).length;

  const StatusIcon = config.icon;
  const isGood = status === 'on-time' || status === 'jamaah';

  const handleMark = (next: PrayerStatus) => {
    haptics.medium();
    onMarkStatus(next);
  };

  const handleSunnah = (id: string) => {
    haptics.light();
    onToggleSunnah(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isGood ? [1, 1.015, 1] : 1,
      }}
      transition={{
        opacity: { duration: 0.3, delay: delay / 1000 },
        y: { duration: 0.3, delay: delay / 1000 },
        scale: { duration: 0.45, ease: 'easeOut' },
      }}
      className={cn(
        'rounded-2xl p-4 shadow-card border card-lift',
        config.bg,
        config.border,
        isGood && 'glow-primary'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {StatusIcon && (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 6, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={cn(
                  'p-1.5 rounded-full',
                  isGood ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <StatusIcon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
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
            </div>
          )}
          {points > 0 && (
            <div className="flex flex-col items-end">
              <div className="bg-primary/10 text-primary text-sm font-semibold px-2 py-1 rounded-lg">
                +{points}p
              </div>
              {comboMultiplier > 1 && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {status === 'jamaah' ? '27' : status === 'on-time' ? '10' : '6'} × {comboMultiplier.toFixed(1)}x
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Buttons */}
      <div className="flex gap-2 mb-3">
        <Button
          variant={status === 'on-time' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleMark('on-time')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'on-time' && 'bg-primary hover:bg-primary/90'
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {t('status.onTime')}
        </Button>
        <Button
          variant={status === 'jamaah' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleMark('jamaah')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'jamaah' && 'bg-primary hover:bg-primary/90'
          )}
        >
          <Users className="h-3.5 w-3.5" />
          {t('status.jamaah')}
        </Button>
        <Button
          variant={status === 'late' ? 'gold' : 'outline'}
          size="sm"
          onClick={() => handleMark('late')}
          className="flex-1 gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          {t('status.late')}
        </Button>
        <Button
          variant={status === 'missed' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handleMark('missed')}
          className={cn(
            'flex-1 gap-1.5',
            status === 'missed' && 'bg-muted-foreground/20 text-muted-foreground'
          )}
        >
          <X className="h-3.5 w-3.5" />
          {t('status.missed')}
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
        <CollapsibleContent className="space-y-3 pt-3">
          {sunnahItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors tap-target"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleSunnah(item.id)}
                className="h-5 w-5"
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
    </motion.div>
  );
}
