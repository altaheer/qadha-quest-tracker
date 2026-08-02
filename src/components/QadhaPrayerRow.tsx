import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * One prayer's outstanding count. Deliberately a single compact row: five of
 * these stack into one panel so the whole backlog is visible at a glance,
 * which is the point of the screen.
 */
export function QadhaPrayerRow({
  name,
  arabicName,
  showArabic,
  count,
  onIncrement,
  onDecrement,
  onSetCount,
  decrementLabel,
  incrementLabel,
}: {
  name: string;
  arabicName: string;
  showArabic: boolean;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetCount: (count: number) => void;
  decrementLabel: string;
  incrementLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(count));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) onSetCount(parsed);
    setEditing(false);
  };

  const startEditing = () => {
    setDraft(String(count));
    setEditing(true);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.9375rem] font-medium text-foreground">{name}</p>
        {showArabic && (
          <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground" dir="rtl">
            {arabicName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDecrement}
          disabled={count === 0}
          aria-label={decrementLabel}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            'text-primary transition-colors duration-base ease-brand',
            'hover:bg-primary/[0.09] disabled:opacity-25 disabled:hover:bg-transparent',
          )}
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} />
        </button>

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => {
              if (e.target.value === '' || /^\d+$/.test(e.target.value)) setDraft(e.target.value);
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            aria-label={name}
            className={cn(
              'w-[4.5rem] rounded-lg bg-secondary px-1 py-1 text-center',
              'font-display text-xl font-semibold tabular-nums text-foreground',
              'outline-none ring-2 ring-primary/40',
            )}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={cn(
              'w-[4.5rem] rounded-lg py-1 text-center font-display text-xl font-semibold tabular-nums',
              'transition-colors duration-base ease-brand hover:bg-secondary/70',
              count === 0 ? 'text-muted-foreground/40' : 'text-foreground',
            )}
          >
            {count}
          </button>
        )}

        <button
          type="button"
          onClick={onIncrement}
          aria-label={incrementLabel}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            'text-primary transition-colors duration-base ease-brand hover:bg-primary/[0.09]',
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
