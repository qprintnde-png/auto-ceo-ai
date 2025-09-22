import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { CompanySelector } from '@/components/portfolio/CompanySelector';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Settings, Crown, BarChart3, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const { user, signOut } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary-gradient">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-primary-gradient bg-clip-text text-transparent">
                Portfolio Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your startup portfolio and track performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CompanySelector 
              selectedCompany={selectedCompany}
              onCompanySelect={setSelectedCompany}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Portfolio Overview
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Details
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <PortfolioOverview />
              </TabsContent>

              <TabsContent value="companies">
                <div className="space-y-6">
                  {selectedCompany ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-card rounded-lg p-6 shadow-soft">
                        <h3 className="text-lg font-semibold mb-4">Company Actions</h3>
                        <div className="space-y-3">
                          <Link to="/business-plan" className="w-full">
                            <Button variant="outline" className="w-full justify-start">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Business Plan
                            </Button>
                          </Link>
                          <Link to="/financial" className="w-full">
                            <Button variant="outline" className="w-full justify-start">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Financial Dashboard
                            </Button>
                          </Link>
                          <Link to="/tasks" className="w-full">
                            <Button variant="outline" className="w-full justify-start">
                              <Building2 className="h-4 w-4 mr-2" />
                              Task Management
                            </Button>
                          </Link>
                          <Link to="/team" className="w-full">
                            <Button variant="outline" className="w-full justify-start">
                              <Building2 className="h-4 w-4 mr-2" />
                              Team Management
                            </Button>
                          </Link>
                          <Link to="/investors" className="w-full">
                            <Button variant="outline" className="w-full justify-start">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Investor Matching
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg p-6 shadow-soft">
                        <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-sm">{selectedCompany.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Industry</label>
                            <p className="text-sm">{selectedCompany.industry}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Stage</label>
                            <p className="text-sm">{selectedCompany.stage}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="text-sm">{selectedCompany.description || 'No description available'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Company Selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a company from the sidebar to view its details and manage it.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Analytics</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features will be available here, including:
                  </p>
                  <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>Cross-portfolio performance analysis</li>
                    <li>Investment ROI tracking</li>
                    <li>Risk assessment and diversification metrics</li>
                    <li>Comparative company performance</li>
                    <li>Market trend analysis</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;