import { useState } from 'react';
import { Home, Moon, RotateCcw, BarChart3, MoreHorizontal, BookOpen, Calendar as CalendarIcon, Settings, Target } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

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


  const moreActive = moreItems.some(i => i.url === pathname);

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/60 pb-safe"
        aria-label={t('nav.more')}
      >
        <ul className="flex items-stretch justify-around">
          {tabs.map((tab) => (
            <li key={tab.url} className="flex-1">
              <NavLink
                to={tab.url}
                end
                className={({ isActive }) =>
                  cn(
                    'tap-target flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )
                }
              >
                <tab.icon className="h-5 w-5" />
                <span>{t(tab.titleKey)}</span>
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              onClick={() => setMoreOpen(true)}
              className={cn(
                'tap-target w-full flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                moreActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>{t('nav.more')}</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <SheetHeader>
            <SheetTitle className="text-left">{t('nav.more')}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-1">
            {moreItems.map((item) => (
              <li key={item.url}>
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(item.url);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl tap-target hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{t(item.titleKey)}</span>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
