import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Building2, TrendingUp, Users2, DollarSign, Target, 
  ArrowUpRight, FileText, Calendar, Briefcase, Network
} from 'lucide-react';

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

interface CompanyPerformanceProps {
  selectedCompany: Company | null;
}

export const CompanyPerformance = ({ selectedCompany }: CompanyPerformanceProps) => {
  if (!selectedCompany) {
    return (
      <div className="bg-card rounded-lg p-12 text-center border shadow-soft">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Company Selected</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select a company from the sidebar to view detailed performance metrics and management tools.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const fundingProgress = selectedCompany.funding_goal 
    ? (selectedCompany.current_funding / selectedCompany.funding_goal) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card className="shadow-elegant border overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">{selectedCompany.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{selectedCompany.stage}</Badge>
                  <Badge variant="outline">{selectedCompany.industry}</Badge>
                </div>
              </div>
            </div>
          </div>
          {selectedCompany.description && (
            <CardDescription className="mt-4 text-base">
              {selectedCompany.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft border hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Current Funding</p>
            <p className="text-2xl font-bold">{formatCurrency(selectedCompany.current_funding || 0)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Funding Goal</p>
            <p className="text-2xl font-bold">{formatCurrency(selectedCompany.funding_goal || 0)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Team Size</p>
            <p className="text-2xl font-bold">{selectedCompany.employee_count || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Progress */}
      <Card className="shadow-soft border">
        <CardHeader>
          <CardTitle className="text-lg">Funding Progress</CardTitle>
          <CardDescription>
            {formatCurrency(selectedCompany.current_funding || 0)} of {formatCurrency(selectedCompany.funding_goal || 0)} raised
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={fundingProgress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground text-right">
            {fundingProgress.toFixed(1)}% Complete
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-soft border">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Manage and monitor your company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/business-plan" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <FileText className="h-4 w-4 mr-2" />
                Business Plan
              </Button>
            </Link>
            <Link to="/financial" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <TrendingUp className="h-4 w-4 mr-2" />
                Financials
              </Button>
            </Link>
            <Link to="/tasks" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Calendar className="h-4 w-4 mr-2" />
                Tasks
              </Button>
            </Link>
            <Link to="/team" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Users2 className="h-4 w-4 mr-2" />
                Team
              </Button>
            </Link>
            <Link to="/investors" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Network className="h-4 w-4 mr-2" />
                Investors
              </Button>
            </Link>
            <Link to="/settings" className="w-full">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Briefcase className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
