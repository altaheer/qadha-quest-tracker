/**
 * Shared layout primitives.
 *
 * Every screen is built from these so the app reads as one product rather than
 * a set of separately-styled pages. If a screen needs a surface, a heading or a
 * number readout, it comes from here — new one-off card markup is how the
 * spacing and weight drifted apart in the first place.
 */
import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Page scaffolding ─────────────────────────────────────────────────── */

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('container mx-auto max-w-lg px-5 pb-8 pt-6', className)}>{children}</div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </header>
  );
}

/** Quiet label that separates groups of panels without shouting. */
export function SectionLabel({
  children,
  trailing,
  className,
}: {
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 px-1 pb-2 pt-4', className)}>
      <h2 className="font-display text-[0.9375rem] font-semibold text-foreground/75">{children}</h2>
      {trailing && <span className="text-xs text-muted-foreground">{trailing}</span>}
    </div>
  );
}

/* ── Surfaces ─────────────────────────────────────────────────────────── */

interface PanelProps {
  children: ReactNode;
  className?: string;
  /** Renders the panel as a link and adds the interactive affordances. */
  to?: string;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { children, className, to },
  ref,
) {
  const classes = cn(to ? 'surface-interactive block' : 'surface', 'overflow-hidden', className);
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
});

/**
 * The standard panel header: an icon, a label, an optional value on the right,
 * and a chevron when the panel navigates somewhere.
 */
export function PanelHeader({
  icon: Icon,
  label,
  value,
  navigates,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value?: ReactNode;
  navigates?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3.5', className)}>
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      )}
      <p className="min-w-0 flex-1 truncate font-display text-[0.9375rem] font-semibold text-foreground">
        {label}
      </p>
      {value !== undefined && (
        <span className="shrink-0 text-[0.9375rem] font-semibold tabular-nums text-foreground">
          {value}
        </span>
      )}
      {navigates && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
    </div>
  );
}

/** Hairline-separated region below a PanelHeader. */
export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border-t border-border/70 px-4 py-3.5', className)}>{children}</div>;
}

/* ── Readouts ─────────────────────────────────────────────────────────── */

/**
 * A large numeric readout. `size="hero"` is reserved for the one number a
 * screen exists to show — using it twice on a page defeats the hierarchy.
 */
export function Stat({
  value,
  label,
  size = 'md',
  tone = 'default',
  className,
}: {
  value: ReactNode;
  label?: ReactNode;
  size?: 'md' | 'lg' | 'hero';
  tone?: 'default' | 'primary' | 'muted';
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div
        className={cn(
          'font-display font-semibold tabular-nums leading-none tracking-tight',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-4xl',
          size === 'hero' && 'text-[3.25rem]',
          tone === 'default' && 'text-foreground',
          tone === 'primary' && 'text-primary',
          tone === 'muted' && 'text-muted-foreground',
        )}
      >
        {value}
      </div>
      {label && (
        <div className="mt-1.5 text-[0.8125rem] leading-snug text-muted-foreground">{label}</div>
      )}
    </div>
  );
}

/** Slim progress track. Height stays constant so rows align across panels. */
export function Meter({
  value,
  tone = 'primary',
  className,
  'aria-label': ariaLabel,
}: {
  /** 0–100. */
  value: number;
  tone?: 'primary' | 'accent' | 'muted';
  className?: string;
  'aria-label'?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-slow ease-brand',
          tone === 'primary' && 'bg-primary',
          tone === 'accent' && 'bg-accent',
          tone === 'muted' && 'bg-muted-foreground/30',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Small tappable pill used for "what's left today" style shortcuts. */
export function Chip({
  to,
  children,
  tone = 'default',
}: {
  to: string;
  children: ReactNode;
  tone?: 'default' | 'accent';
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-[0.8125rem] font-medium',
        'transition-colors duration-base ease-brand active:scale-[0.97]',
        tone === 'default' && 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        tone === 'accent' && 'bg-primary/[0.09] text-primary hover:bg-primary/[0.14]',
      )}
    >
      {children}
    </Link>
  );
}

/** Empty-state block — quiet, never alarming. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      {Icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      )}
      <p className="font-display text-[0.9375rem] font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-[26ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
