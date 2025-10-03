import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { CompanySelector } from '@/components/portfolio/CompanySelector';
import { BarChart3, Building2, TrendingUp, Target, Users2, Rocket } from 'lucide-react';
import { CompanyPerformance } from '@/components/portfolio/CompanyPerformance';

interface Company {
  id: string;
  name: string;
  stage: string;
  industry: string;
  current_funding: number;
  funding_goal: number;
  employee_count: number;
  description: string;
  created_at: string;
}

const Portfolio = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
            <p className="text-muted-foreground">
              Track and manage your startup portfolio performance across all companies
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Company Selector Sidebar */}
          <div className="lg:col-span-1">
            <CompanySelector 
              selectedCompany={selectedCompany}
              onCompanySelect={setSelectedCompany}
            />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Companies</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <PortfolioOverview />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <CompanyPerformance selectedCompany={selectedCompany} />
              </TabsContent>

              <TabsContent value="companies" className="space-y-6">
                {selectedCompany ? (
                  <CompanyPerformance selectedCompany={selectedCompany} />
                ) : (
                  <div className="bg-card rounded-lg p-12 text-center border shadow-soft">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Company Selected</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Select a company from the sidebar to view detailed performance metrics, KPIs, and management tools.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;