import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsGridSkeleton } from '@/components/skeletons';
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
    return <MetricsGridSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Portfolio Value */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{metrics.revenueGrowth}%
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio Value</p>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.portfolioValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">vs last month</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.totalCompanies} {metrics.totalCompanies === 1 ? 'company' : 'companies'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">{completionRate}%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Task Completion</p>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.completedTasks} of {metrics.totalTasks} completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Size */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Team Members</p>
            <p className="text-2xl font-bold tracking-tight">{metrics.totalTeamMembers}</p>
            <p className="text-xs text-muted-foreground mt-1">across portfolio</p>
          </div>
        </CardContent>
      </Card>

      {/* Investor Matches */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Investor Matches</p>
            <p className="text-2xl font-bold tracking-tight">{metrics.activeInvestorMatches}</p>
            <p className="text-xs text-muted-foreground mt-1">potential investors</p>
          </div>
        </CardContent>
      </Card>

      {/* Burn Rate */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <ArrowDownRight className="h-5 w-5 text-orange-600" />
            </div>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-0">
              Monthly
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Burn Rate</p>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(metrics.burnRate)}</p>
            <p className="text-xs text-muted-foreground mt-1">per month</p>
          </div>
        </CardContent>
      </Card>

      {/* Runway */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            {metrics.runway < 6 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Average Runway</p>
            <p className="text-2xl font-bold tracking-tight">{Math.round(metrics.runway)} months</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.runway < 6 ? 'Low runway' : 'Healthy runway'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Companies */}
      <Card className="shadow-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Companies</p>
            <p className="text-2xl font-bold tracking-tight">{metrics.totalCompanies}</p>
            <p className="text-xs text-muted-foreground mt-1">in your portfolio</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};