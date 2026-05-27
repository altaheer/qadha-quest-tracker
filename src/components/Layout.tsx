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
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-safe">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hidden md:flex p-2 hover:bg-muted rounded-lg transition-colors tap-target">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  Ibadah
                </h1>
              </div>
            </div>
            <div className="px-4 pb-3">
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
