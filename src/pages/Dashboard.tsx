import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, Plus, BarChart3, Users, Target, TrendingUp, Building2, Brain, Activity, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Executive Header */}
      <div className="bg-executive-gradient text-primary-foreground border-b">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Executive Dashboard
              </h1>
              <p className="text-primary-foreground/80 text-xs sm:text-sm">
                Welcome back, {user?.user_metadata?.first_name || user?.email} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0 px-3 sm:px-4 py-1.5 text-xs">
                {user?.user_metadata?.role || 'founder'}
              </Badge>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-primary-foreground hover:bg-white/10">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="mb-8 bg-muted/50 p-1">
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-8">
            <PortfolioOverview />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <DashboardMetrics />

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-card hover:shadow-feature transition-all duration-300 border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">Business Plan</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-sm">
                      Generate an AI-powered business plan for your startup
                    </CardDescription>
                    <Link to="/business-plan">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-feature transition-all duration-300 border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-accent/10">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <CardTitle className="text-base">Team</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-sm">
                      Find and hire talented professionals for your team
                    </CardDescription>
                    <Link to="/team">
                      <Button className="w-full" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Hire Talent
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-feature transition-all duration-300 border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">AI Insights</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-sm">
                      Get AI-powered recommendations and insights
                    </CardDescription>
                    <Button className="w-full" variant="outline">
                      <Brain className="h-4 w-4 mr-2" />
                      View Insights
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Secondary Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Management Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/tasks">
                  <Card className="shadow-card hover:shadow-feature transition-all duration-300 cursor-pointer border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm">Tasks</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">Manage workflows</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/financial">
                  <Card className="shadow-card hover:shadow-feature transition-all duration-300 cursor-pointer border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <TrendingUp className="h-4 w-4 text-accent" />
                        </div>
                        <CardTitle className="text-sm">Financials</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">Track revenue</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/investors">
                  <Card className="shadow-card hover:shadow-feature transition-all duration-300 cursor-pointer border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm">Investors</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">Match funding</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/team">
                  <Card className="shadow-card hover:shadow-feature transition-all duration-300 cursor-pointer border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Users className="h-4 w-4 text-accent" />
                        </div>
                        <CardTitle className="text-sm">Hiring</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">Build team</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <DashboardCharts />
          </TabsContent>

          <TabsContent value="insights">
            <AIInsights />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityFeed />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;