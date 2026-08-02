import { Moon, Sun, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { NafilahPrayer, NafilahDifficulty } from '@/hooks/useNafilahTracking';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/lib/i18n';
import { useUserPrefs } from '@/hooks/useUserPrefs';
import { Panel, SectionLabel } from '@/components/common';

interface NafilahSectionProps {
  prayers: NafilahPrayer[];
  onToggle: (id: string) => void;
}

/**
 * Voluntary prayers, grouped by how demanding they are. Difficulty is carried
 * by a single small icon rather than by tinting whole rows, so the list stays
 * scannable as it grows.
 */
const GROUPS: { difficulty: NafilahDifficulty; labelKey: string; icon: typeof Moon; tone: string }[] = [
  { difficulty: 'hard', labelKey: 'nafilah.hard', icon: Moon, tone: 'text-accent' },
  { difficulty: 'medium', labelKey: 'nafilah.medium', icon: Sunrise, tone: 'text-accent/80' },
  { difficulty: 'easy', labelKey: 'nafilah.easy', icon: Sun, tone: 'text-primary' },
];

export function NafilahSection({ prayers, onToggle }: NafilahSectionProps) {
  const { t } = useTranslation();
  const { showArabic } = useUserPrefs();

  return (
    <section className="pt-4">
      <SectionLabel>{t('nafilah.title')}</SectionLabel>
      <p className="px-1 pb-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {t('nafilah.subtitle')}
      </p>

      <div className="space-y-5">
        {GROUPS.map(({ difficulty, labelKey, icon: Icon, tone }) => {
          const group = prayers.filter((p) => p.difficulty === difficulty);
          if (group.length === 0) return null;
          return (
            <div key={difficulty}>
              <div className="flex items-center gap-2 px-1 pb-2">
                <Icon className={cn('h-3.5 w-3.5', tone)} strokeWidth={2} />
                <h3 className="text-[0.8125rem] font-medium text-muted-foreground">
                  {t(labelKey as never)}
                </h3>
              </div>

              <Panel className="divide-y divide-border/70">
                {group.map((prayer) => (
                  <label
                    key={prayer.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-base ease-brand hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={prayer.completed}
                      onCheckedChange={() => {
                        haptics.light();
                        onToggle(prayer.id);
                      }}
                      className="h-[1.15rem] w-[1.15rem]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'truncate text-[0.9375rem] font-medium',
                            prayer.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground',
                          )}
                        >
                          {prayer.name}
                        </span>
                        {showArabic && (
                          <span className="shrink-0 text-xs text-muted-foreground" dir="rtl">
                            {prayer.arabicName}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[0.75rem] leading-snug text-muted-foreground">
                        {t(`nafilahDesc.${prayer.id}` as never)}
                        <span className="text-muted-foreground/70"> · {prayer.rakaat}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-[0.8125rem] font-semibold tabular-nums',
                        prayer.completed ? 'text-primary' : 'text-muted-foreground/70',
                      )}
                    >
                      +{prayer.points}
                    </span>
                  </label>
                ))}
              </Panel>
            </div>
          );
        })}
      </div>
    </section>
  );
}
