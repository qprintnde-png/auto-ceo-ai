import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Target, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardMetrics {
  totalCompanies: number;
  totalRevenue: number;
  totalTasks: number;
  completedTasks: number;
  totalTeamMembers: number;
  activeInvestorMatches: number;
  revenueGrowth: number;
  portfolioValue: number;
  burnRate: number;
  runway: number;
}

export const DashboardMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCompanies: 0,
    totalRevenue: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalTeamMembers: 0,
    activeInvestorMatches: 0,
    revenueGrowth: 0,
    portfolioValue: 0,
    burnRate: 0,
    runway: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardMetrics();
    }
  }, [user]);

  const fetchDashboardMetrics = async () => {
    try {
      // Fetch companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, current_funding')
        .eq('owner_id', user?.id);

      // Fetch financial data
      const { data: financialData } = await supabase
        .from('financial_data')
        .select('revenue, expenses, burn_rate, runway_months')
        .in('company_id', companies?.map(c => c.id) || [])
        .eq('is_projection', false);

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status')
        .in('company_id', companies?.map(c => c.id) || []);

      // Fetch team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('id')
        .in('company_id', companies?.map(c => c.id) || []);

      // Fetch investor matches
      const { data: investorMatches } = await supabase
        .from('investor_matches')
        .select('id, status')
        .in('company_id', companies?.map(c => c.id) || [])
        .neq('status', 'rejected');

      // Calculate metrics
      const totalRevenue = financialData?.reduce((sum, fd) => sum + (fd.revenue || 0), 0) || 0;
      const totalBurnRate = financialData?.reduce((sum, fd) => sum + (fd.burn_rate || 0), 0) || 0;
      const avgRunway = financialData?.length ? 
        financialData.reduce((sum, fd) => sum + (fd.runway_months || 0), 0) / financialData.length : 0;
      const portfolioValue = companies?.reduce((sum, c) => sum + (c.current_funding || 0), 0) || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

      setMetrics({
        totalCompanies: companies?.length || 0,
        totalRevenue,
        totalTasks: tasks?.length || 0,
        completedTasks,
        totalTeamMembers: teamMembers?.length || 0,
        activeInvestorMatches: investorMatches?.length || 0,
        revenueGrowth: 12.5, // Mock growth rate
        portfolioValue,
        burnRate: totalBurnRate,
        runway: avgRunway,
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const completionRate = metrics.totalTasks > 0 ? 
    Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted/20 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Portfolio Value */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.portfolioValue)}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+{metrics.revenueGrowth}%</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-muted-foreground">Across {metrics.totalCompanies} companies</span>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-2">
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.completedTasks} of {metrics.totalTasks} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Size */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{metrics.totalTeamMembers}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-muted-foreground">Across all companies</span>
          </div>
        </CardContent>
      </Card>

      {/* Investor Matches */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Investor Matches</p>
              <p className="text-2xl font-bold">{metrics.activeInvestorMatches}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-muted-foreground">Potential investors</span>
          </div>
        </CardContent>
      </Card>

      {/* Burn Rate */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.burnRate)}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-500/10">
              <ArrowDownRight className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-muted-foreground">Monthly spending</span>
          </div>
        </CardContent>
      </Card>

      {/* Runway */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Runway</p>
              <p className="text-2xl font-bold">{Math.round(metrics.runway)} months</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            {metrics.runway < 6 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-500">Low runway</span>
              </>
            ) : (
              <span className="text-muted-foreground">Time remaining</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Companies */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
              <p className="text-2xl font-bold">{metrics.totalCompanies}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-muted-foreground">In your portfolio</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};