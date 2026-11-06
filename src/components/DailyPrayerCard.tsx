import { useState } from 'react';
import { Check, Clock, X, ChevronDown, Flame, Users, Info, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PrayerStatus, SunnahItem, PrayerStreak } from '@/hooks/usePrayerTracking';
import { Checkbox } from '@/components/ui/checkbox';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HadithInfoContent } from '@/components/HadithInfoContent';

const missedToastMsg: Record<string, { title: string; desc: string }> = {
  en: { title: 'Added to Qadha', desc: 'May Allah make it easy to make up.' },
  sv: { title: 'Tillagd i Qadha', desc: 'Må Allah göra det lätt att ta igen.' },
  tr: { title: 'Kazaya eklendi', desc: 'Allah kazasını kolaylaştırsın.' },
  ar: { title: 'أُضيفت إلى القضاء', desc: 'يسّر الله قضاءها.' },
};

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

/**
 * The four ways a prayer can be marked. Each carries its own selected colour,
 * but only when chosen — the card itself stays neutral so a list of five does
 * not turn into a patchwork.
 */
const OPTIONS: {
  status: Exclude<PrayerStatus, 'pending'>;
  labelKey: string;
  icon: LucideIcon;
  selected: string;
}[] = [
  { status: 'ontime', labelKey: 'status.onTime', icon: Check, selected: 'bg-primary text-primary-foreground border-primary' },
  { status: 'jamaah', labelKey: 'status.jamaah', icon: Users, selected: 'bg-accent text-accent-foreground border-accent' },
  { status: 'late', labelKey: 'status.late', icon: Clock, selected: 'bg-accent/20 text-accent-foreground border-accent/40' },
  { status: 'missed', labelKey: 'status.missed', icon: X, selected: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/25' },
];

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
  const { t, lang } = useTranslation();
  const { showArabic } = useUserPrefs();
  const [isOpen, setIsOpen] = useState(false);
  const completedSunnah = sunnahItems.filter((s) => s.completed).length;
  const marked = status !== 'pending';

  const handleMark = (next: PrayerStatus) => {
    haptics.medium();
    onMarkStatus(next);
    if (next === 'missed' && status !== 'missed') {
      const msg = missedToastMsg[lang] ?? missedToastMsg.en;
      toast(`${name} — ${msg.title}`, { description: msg.desc, position: 'top-center' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(delay, 120) / 1000, ease: [0.32, 0.72, 0, 1] }}
      className="surface px-4 py-3.5"
    >
      <div className="mb-3 flex items-center gap-3">
        {/* A quiet dot rather than a badge — presence is the signal. */}
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full transition-colors duration-base ease-brand',
            status === 'ontime' && 'bg-primary',
            status === 'jamaah' && 'bg-accent',
            status === 'late' && 'bg-accent/50',
            status === 'missed' && 'bg-muted-foreground/40',
            !marked && 'bg-border',
          )}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1.0625rem] font-semibold text-foreground">
            {name}
          </h3>
          {showArabic && (
            <p className="truncate text-[0.8125rem] text-muted-foreground" dir="rtl">
              {arabicName}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {streak.current > 0 && (
            <span className="flex items-center gap-1 text-accent" title={t('prayers.streak')}>
              <Flame className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="text-[0.8125rem] font-medium tabular-nums">{streak.current}</span>
            </span>
          )}
          {points > 0 && (
            <span
              className="text-[0.75rem] font-medium tabular-nums text-muted-foreground/70"
              title={comboMultiplier > 1 ? `× ${comboMultiplier.toFixed(1)}` : undefined}
            >
              +{points}
            </span>
          )}
        </div>
      </div>

      <div role="group" aria-label={name} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {OPTIONS.map((option) => {
          const active = status === option.status;
          return (
            <button
              key={option.status}
              type="button"
              aria-pressed={active}
              onClick={() => handleMark(option.status)}
              className={cn(
                'flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2',
                'text-[0.8125rem] font-medium transition-colors duration-base ease-brand',
                active
                  ? option.selected
                  : 'border-border bg-transparent text-muted-foreground hover:bg-muted',
              )}
            >
              <option.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{t(option.labelKey as never)}</span>
            </button>
          );
        })}
      </div>

      {sunnahItems.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between py-2.5 text-[0.8125rem] text-muted-foreground transition-colors duration-base ease-brand hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                {t('home.sunnahLabel')}
                <span className="tabular-nums text-muted-foreground/70">
                  {completedSunnah}/{sunnahItems.length}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-base ease-brand',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 pb-1">
            {sunnahItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl px-1 py-1.5 transition-colors duration-base ease-brand hover:bg-muted/60"
              >
                <label className="tap-target flex flex-1 cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => {
                      haptics.light();
                      onToggleSunnah(item.id);
                    }}
                    className="h-[1.15rem] w-[1.15rem]"
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-[0.8125rem] leading-snug',
                        item.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                      )}
                    >
                      {item.name}
                    </span>
                    {showArabic && (
                      <span className="shrink-0 text-xs text-muted-foreground" dir="rtl">
                        {item.arabicName}
                      </span>
                    )}
                  </span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.light();
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground"
                      aria-label={t('hadith.source')}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-72">
                    <HadithInfoContent id={item.id} />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </motion.div>
  );
}
