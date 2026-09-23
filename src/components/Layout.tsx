import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DateHeader } from '@/components/DateHeader';
import { BottomNav } from '@/components/BottomNav';
import { QuickActionsFAB } from '@/components/QuickActionsFAB';
import { useLocation } from 'react-router-dom';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';

interface LayoutProps {
  children: ReactNode;
}

/**
 * App shell: a quiet header carrying the wordmark and today's date, the page
 * itself, and the bottom navigation on mobile. The header holds no controls —
 * everything actionable lives in the page or the nav.
 */
export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const hideFab = pathname.startsWith('/settings') || pathname.startsWith('/guide');
  // Keep the local reminder scheduler alive while the shell is mounted.
  useLocalNotifications();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 pt-safe backdrop-blur-xl">
            <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-3">
              <SidebarTrigger className="tap-target -ms-2 hidden rounded-lg p-2 text-muted-foreground transition-colors duration-base ease-brand hover:bg-muted hover:text-foreground md:flex">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="min-w-0">
                <p className="font-display text-[0.9375rem] font-semibold leading-tight text-foreground">
                  Ibadah
                </p>
                <DateHeader />
              </div>
            </div>
          </header>

          <main className="bottom-nav-offset flex-1 overflow-auto md:pb-0">{children}</main>
        </div>

        <BottomNav />
        {!hideFab && <QuickActionsFAB />}
      </div>
    </SidebarProvider>
  );
}
