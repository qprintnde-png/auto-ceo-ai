import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioCharts } from './PortfolioCharts';

interface Company {
  id: string;
  name: string;
  stage: string;
  industry: string;
  current_funding: number;
  funding_goal: number;
  employee_count: number;
  created_at: string;
}

interface PortfolioMetrics {
  totalCompanies: number;
  totalValuation: number;
  totalEmployees: number;
  averageGrowthRate: number;
  activeInvestments: number;
}

export const PortfolioOverview = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalCompanies: 0,
    totalValuation: 0,
    totalEmployees: 0,
    averageGrowthRate: 0,
    activeInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  const fetchPortfolioData = async () => {
    try {
      // Fetch all companies owned by the user
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id);

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);

      // Calculate portfolio metrics
      const totalCompanies = companiesData?.length || 0;
      const totalValuation = companiesData?.reduce((sum, company) => 
        sum + (company.current_funding || 0), 0) || 0;
      const totalEmployees = companiesData?.reduce((sum, company) => 
        sum + (company.employee_count || 0), 0) || 0;
      const activeInvestments = companiesData?.filter(company => 
        company.current_funding && company.current_funding > 0).length || 0;

      setMetrics({
        totalCompanies,
        totalValuation,
        totalEmployees,
        averageGrowthRate: 15.2, // Mock data - would be calculated from financial data
        activeInvestments
      });
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted/20 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Companies</p>
                <p className="text-3xl font-bold">{metrics.totalCompanies}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalValuation)}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{metrics.averageGrowthRate}%</span>
              <span className="text-muted-foreground ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Employees</p>
                <p className="text-3xl font-bold">{metrics.totalEmployees}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Investments</p>
                <p className="text-3xl font-bold">{metrics.activeInvestments}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Charts */}
      <PortfolioCharts companies={companies} />

      {/* Company List */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Portfolio Companies</CardTitle>
          <CardDescription>
            Overview of all companies in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">No companies in your portfolio yet</p>
                <p className="text-sm text-muted-foreground">Add your first company to start tracking performance</p>
              </div>
            ) : (
              companies.map((company) => (
                <div 
                  key={company.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/10 hover:bg-muted/20 border border-border/50 transition-all hover-scale cursor-pointer shadow-soft"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10 shadow-soft">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{company.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <span>{company.industry}</span>
                        {company.stage && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {company.stage}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(company.current_funding || 0)}</p>
                    <p className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {company.employee_count || 0} team members
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};