import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, Plus, BarChart3, Users, Target, TrendingUp, Building2, Brain, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { AIInsights } from '@/components/dashboard/AIInsights';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-primary-gradient bg-clip-text text-transparent">
              Auto-CEO Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.user_metadata?.first_name || user?.email}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              {user?.user_metadata?.role || 'founder'}
            </Badge>
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <DashboardMetrics />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Create Business Plan</CardTitle>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Generate an AI-powered business plan for your startup idea
                  </CardDescription>
                  <Link to="/business-plan">
                    <Button className="w-full bg-primary-gradient hover:opacity-90">
                      <Plus className="h-4 w-4 mr-2" />
                      New Business Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Portfolio Management</CardTitle>
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Manage multiple companies and track portfolio performance
                  </CardDescription>
                  <Link to="/portfolio">
                    <Button className="w-full bg-primary-gradient hover:opacity-90">
                      <Building2 className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Get AI-powered recommendations and business insights
                  </CardDescription>
                  <Button className="w-full" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    View Insights
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Task Management</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to="/tasks">
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Manage Tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Financial Planning</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to="/financial">
                    <Button size="sm" variant="outline" className="w-full">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      View Financials
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Find Investors</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to="/investors">
                    <Button size="sm" variant="outline" className="w-full">
                      <Users className="h-3 w-3 mr-1" />
                      Match Investors
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Team Management</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to="/team">
                    <Button size="sm" variant="outline" className="w-full">
                      <Users className="h-3 w-3 mr-1" />
                      Hire Talent
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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