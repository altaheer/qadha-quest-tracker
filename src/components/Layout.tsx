import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DateHeader } from '@/components/DateHeader';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-colors">
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

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
