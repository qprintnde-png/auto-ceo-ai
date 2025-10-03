import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CommandMenu } from "@/components/navigation/CommandMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-4 gap-4">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger />
                <Breadcrumbs />
              </div>
              <div className="flex items-center gap-2">
                <CommandMenu />
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
