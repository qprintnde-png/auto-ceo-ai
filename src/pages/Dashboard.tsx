import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Plus, BarChart3, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <CardTitle className="text-lg">Task Management</CardTitle>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Organize and track your project tasks and deliverables
              </CardDescription>
              <Link to="/tasks">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Financial Forecasting</CardTitle>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Build financial projections and track your startup's metrics
              </CardDescription>
              <Link to="/financial">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Financial Planning
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Welcome to Auto-CEO!</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get started with AI-powered business tools
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Complete Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;