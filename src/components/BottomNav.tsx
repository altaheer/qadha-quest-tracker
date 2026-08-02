import { useState } from 'react';
import {
  Home,
  Moon,
  RotateCcw,
  BarChart3,
  MoreHorizontal,
  BookOpen,
  Calendar as CalendarIcon,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

/**
 * The active tab is marked by colour and a soft pill behind the icon — enough
 * to locate yourself without the bar competing with the page above it.
 */
function TabContent({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active: boolean }) {
  return (
    <>
      <span
        className={cn(
          'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-base ease-brand',
          active && 'bg-primary/[0.1]',
        )}
      >
        <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={active ? 2.25 : 1.75} />
      </span>
      <span className={cn('text-[0.6875rem] leading-none', active && 'font-medium')}>{label}</span>
    </>
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { titleKey: 'nav.home' as const, url: '/', icon: Home },
    { titleKey: 'nav.prayers' as const, url: '/prayers', icon: Moon },
    { titleKey: 'nav.qadha' as const, url: '/qadha', icon: RotateCcw },
    { titleKey: 'nav.habits' as const, url: '/habits', icon: BookOpen },
  ];

  const moreItems = [
    { titleKey: 'missions.title' as const, url: '/missions', icon: Target },
    { titleKey: 'nav.insights' as const, url: '/insights', icon: BarChart3 },
    { titleKey: 'nav.calendar' as const, url: '/calendar', icon: CalendarIcon },
    { titleKey: 'nav.settings' as const, url: '/settings', icon: Settings },
  ];

  const moreActive = moreItems.some((i) => i.url === pathname);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/90 pb-safe backdrop-blur-xl md:hidden"
        aria-label={t('nav.more')}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around">
          {tabs.map((tab) => (
            <li key={tab.url} className="flex-1">
              <NavLink
                to={tab.url}
                end
                className={({ isActive }) =>
                  cn(
                    'tap-target flex flex-col items-center justify-center gap-1 py-2 transition-colors duration-base ease-brand',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <TabContent icon={tab.icon} label={t(tab.titleKey)} active={isActive} />
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'tap-target flex w-full flex-col items-center justify-center gap-1 py-2 transition-colors duration-base ease-brand',
                moreActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <TabContent icon={MoreHorizontal} label={t('nav.more')} active={moreActive} />
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <SheetHeader>
            <SheetTitle className="text-start font-display text-lg">{t('nav.more')}</SheetTitle>
          </SheetHeader>
          <ul className="mt-3 space-y-0.5">
            {moreItems.map((item) => (
              <li key={item.url}>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(item.url);
                  }}
                  className={cn(
                    'tap-target flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start',
                    'transition-colors duration-base ease-brand hover:bg-muted',
                    item.url === pathname && 'bg-muted/60',
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                    <item.icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
                  </span>
                  <span className="text-[0.9375rem] font-medium text-foreground">
                    {t(item.titleKey)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
