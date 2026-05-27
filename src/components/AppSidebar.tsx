import { Home, Moon, Calendar, BarChart3, Settings, BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/lib/i18n';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const mainItems = [
    { titleKey: 'nav.home' as const, url: '/', icon: Home },
    { titleKey: 'nav.prayers' as const, url: '/prayers', icon: Moon },
    { titleKey: 'nav.qadha' as const, url: '/qadha', icon: RotateCcw },
  ];
  const secondaryItems = [
    { titleKey: 'nav.habits' as const, url: '/habits', icon: BookOpen },
    { titleKey: 'nav.insights' as const, url: '/insights', icon: BarChart3 },
    { titleKey: 'nav.calendar' as const, url: '/calendar', icon: Calendar },
  ];
  const settingsItems = [
    { titleKey: 'nav.settings' as const, url: '/settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-semibold text-foreground">Ibadah</h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.titleKey)}>
                    <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.titleKey)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.titleKey)}>
                    <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.titleKey)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={t(item.titleKey)}>
                <NavLink to={item.url} end className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.titleKey)}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
