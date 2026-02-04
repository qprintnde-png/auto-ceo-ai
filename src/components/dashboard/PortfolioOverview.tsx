import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PortfolioOverviewSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users,
  Calendar,
  ExternalLink,
  Plus,
  Target,
  Briefcase
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  current_funding: number;
  funding_goal: number;
  founded_date: string;
  employee_count: number;
  location: string;
}

interface CompanyMetrics {
  company: Company;
  revenue: number;
  tasks_completed: number;
  total_tasks: number;
  team_size: number;
  investor_matches: number;
  growth_rate: number;
}

export const PortfolioOverview = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  const fetchPortfolioData = async () => {
    try {
      // Get all companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (!companiesData) {
        setCompanies([]);
        return;
      }

      // Fetch metrics for each company
      const companiesWithMetrics = await Promise.all(
        companiesData.map(async (company) => {
          // Get latest financial data (current month)
          const { data: currentFinancialData } = await supabase
            .from('financial_data')
            .select('revenue')
            .eq('company_id', company.id)
            .eq('is_projection', false)
            .order('period_start', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get previous month's financial data for growth calculation
          const { data: previousFinancialData } = await supabase
            .from('financial_data')
            .select('revenue')
            .eq('company_id', company.id)
            .eq('is_projection', false)
            .order('period_start', { ascending: false })
            .range(1, 1)
            .maybeSingle();

          // Get tasks
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('company_id', company.id);

          // Get team members
          const { data: team } = await supabase
            .from('team_members')
            .select('id')
            .eq('company_id', company.id);

          // Get investor matches
          const { data: investors } = await supabase
            .from('investor_matches')
            .select('id')
            .eq('company_id', company.id);

          const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
          const totalTasks = tasks?.length || 0;

          // Calculate real growth rate
          const currentRevenue = currentFinancialData?.revenue || 0;
          const previousRevenue = previousFinancialData?.revenue || 0;
          let growthRate = 0;
          
          if (previousRevenue > 0) {
            growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          } else if (currentRevenue > 0) {
            growthRate = 100; // 100% growth if starting from zero
          }

          return {
            company,
            revenue: currentRevenue,
            tasks_completed: completedTasks,
            total_tasks: totalTasks,
            team_size: team?.length || 0,
            investor_matches: investors?.length || 0,
            growth_rate: growthRate,
          };
        })
      );

      setCompanies(companiesWithMetrics);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
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

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'pre-seed':
        return 'bg-blue-500/10 text-blue-500';
      case 'seed':
        return 'bg-green-500/10 text-green-500';
      case 'series a':
        return 'bg-purple-500/10 text-purple-500';
      case 'series b':
        return 'bg-orange-500/10 text-orange-500';
      case 'growth':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return <PortfolioOverviewSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No Companies Yet"
        description="Start building your portfolio by creating your first company profile to track funding, metrics, and progress."
        action={{
          label: 'Create Company',
          onClick: () => window.location.href = '/dashboard#create-company',
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your Portfolio</h2>
          <p className="text-sm text-muted-foreground">
            Managing {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map(({ company, revenue, tasks_completed, total_tasks, team_size, investor_matches, growth_rate }) => {
          const fundingProgress = company.funding_goal > 0 
            ? (company.current_funding / company.funding_goal) * 100 
            : 0;
          const taskProgress = total_tasks > 0 
            ? (tasks_completed / total_tasks) * 100 
            : 0;

          return (
            <Card key={company.id} className="shadow-card border hover:shadow-feature transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{company.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {company.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={getStageColor(company.stage)}>
                    {company.stage}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Revenue</span>
                      <DollarSign className="h-3 w-3 text-green-500" />
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(revenue)}</p>
                    <div className="flex items-center text-xs mt-1">
                      {growth_rate >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-green-500">+{growth_rate.toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-red-500">{growth_rate.toFixed(1)}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Funding</span>
                      <Target className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(company.current_funding)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {formatCurrency(company.funding_goal)}
                    </p>
                  </div>
                </div>

                {/* Funding Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Funding Progress</span>
                    <span className="text-xs text-muted-foreground">{fundingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={fundingProgress} className="h-2" />
                </div>

                {/* Task Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Tasks Completed</span>
                    <span className="text-xs text-muted-foreground">
                      {tasks_completed} / {total_tasks}
                    </span>
                  </div>
                  <Progress value={taskProgress} className="h-2" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-medium">{team_size}</p>
                    <p className="text-xs text-muted-foreground">Team</p>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-medium">{investor_matches}</p>
                    <p className="text-xs text-muted-foreground">Investors</p>
                  </div>

                  <div className="text-center p-2 rounded-lg bg-muted/20">
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-medium">{company.industry}</p>
                    <p className="text-xs text-muted-foreground">Industry</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/business-plan?company=${company.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/financial?company=${company.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary/90">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Financials
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
