import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DateHeader } from '@/components/DateHeader';
import { BottomNav } from '@/components/BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar visible on desktop only */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-safe relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-[0.04] dark:hidden"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='hsl(158,28%25,32%25)' stroke-width='1'><polygon points='30,4 36,18 50,18 39,28 44,42 30,34 16,42 21,28 10,18 24,18'/><polygon points='30,8 35,20 47,20 38,28 42,40 30,33 18,40 22,28 13,20 25,20' transform='rotate(22.5 30 30)'/></g></svg>")`,
                backgroundSize: '60px 60px',
              }}
            />
            <div className="relative flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hidden md:flex p-2 hover:bg-muted rounded-lg transition-colors tap-target">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  Ibadah
                </h1>
              </div>
            </div>
            <div className="relative px-4 pb-3">
              <DateHeader />
            </div>
          </header>

          {/* Main Content — extra bottom padding on mobile for bottom nav */}
          <main className="flex-1 overflow-auto bottom-nav-offset md:pb-0">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
