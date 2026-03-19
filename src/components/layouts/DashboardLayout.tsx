import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CommandMenu } from "@/components/navigation/CommandMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-3 sm:px-4 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <SidebarTrigger />
                <div className="hidden sm:block">
                  <Breadcrumbs />
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden sm:block">
                  <CommandMenu />
                </div>
                <NotificationCenter />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
