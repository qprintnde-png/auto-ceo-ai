import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, TrendingUp, BarChart3, Calculator, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { FinancialDashboardSkeleton } from '@/components/skeletons';
import { FinancialForm } from './FinancialForm';
import { FinancialCharts } from './FinancialCharts';
import { FinancialProjections } from './FinancialProjections';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FinancialData {
  id: string;
  period_start: string;
  period_end: string;
  period_type: string;
  revenue?: number;
  expenses?: number;
  gross_profit?: number;
  net_profit?: number;
  cash_flow?: number;
  customer_acquisition_cost?: number;
  lifetime_value?: number;
  churn_rate?: number;
  conversion_rate?: number;
  monthly_recurring_revenue?: number;
  burn_rate?: number;
  runway_months?: number;
  is_projection: boolean;
  notes?: string;
  company_id: string;
  business_plan_id?: string;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
}

export const FinancialDashboard = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<FinancialData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      fetchFinancialData();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user?.id);

      if (error) throw error;

      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialData = async () => {
    if (!selectedCompany) return;

    try {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('company_id', selectedCompany)
        .order('period_start', { ascending: true });

      if (error) throw error;
      setFinancialData(data || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to fetch financial data');
    }
  };

  const handleDataCreated = () => {
    fetchFinancialData();
    setIsDialogOpen(false);
    setEditingData(null);
  };

  const handleEdit = (data: FinancialData) => {
    setEditingData(data);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Financial data deleted');
      fetchFinancialData();
    } catch (error) {
      console.error('Error deleting financial data:', error);
      toast.error('Failed to delete financial data');
    }
  };

  const handleGenerateProjections = async (projections: any[]) => {
    try {
      const formattedProjections = projections.map(p => ({
        ...p,
        company_id: selectedCompany,
        is_projection: true,
      }));

      const { error } = await supabase
        .from('financial_data')
        .insert(formattedProjections);

      if (error) throw error;

      toast.success('Financial projections generated');
      fetchFinancialData();
    } catch (error) {
      console.error('Error saving projections:', error);
      toast.error('Failed to save projections');
    }
  };

  // Separate actual data from projections
  const actualData = financialData.filter(d => !d.is_projection);
  const projectionData = financialData.filter(d => d.is_projection);

  // Calculate key metrics
  const totalRevenue = actualData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = actualData.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const latestData = actualData[actualData.length - 1];

  if (isLoading) {
    return <FinancialDashboardSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-subtle-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Company Found</h2>
          <p className="text-muted-foreground">You need to create a company first to manage financial data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-gradient">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-primary-gradient bg-clip-text text-transparent">
                Financial Forecasting
              </h1>
              <p className="text-muted-foreground">
                Track performance and project future growth
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingData(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Financial Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingData ? 'Edit Financial Data' : 'Add Financial Data'}
                  </DialogTitle>
                </DialogHeader>
                <FinancialForm
                  companyId={selectedCompany}
                  onDataCreated={handleDataCreated}
                  onCancel={() => setIsDialogOpen(false)}
                  initialData={editingData}
                  isEditing={!!editingData}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts & Analytics
            </TabsTrigger>
            <TabsTrigger value="projections" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Projections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-soft bg-card-gradient border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {actualData.length} periods
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    ${totalExpenses.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${totalProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-card-gradient border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Runway</CardTitle>
                  <Calculator className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {latestData?.runway_months || 0} months
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            {financialData.length > 0 && (
              <FinancialCharts data={financialData} />
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {/* Data Table */}
            <Card className="shadow-soft bg-card-gradient border-0">
              <CardHeader>
                <CardTitle>Financial Data Records</CardTitle>
                <CardDescription>
                  Manage your historical and projected financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {financialData.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No financial data yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first financial period data
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Financial Data
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Period</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-right p-3">Revenue</th>
                          <th className="text-right p-3">Expenses</th>
                          <th className="text-right p-3">Net Profit</th>
                          <th className="text-center p-3">Status</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialData.map((data) => (
                          <tr key={data.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              {format(new Date(data.period_start), 'MMM yyyy')}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{data.period_type}</Badge>
                            </td>
                            <td className="text-right p-3 text-green-600">
                              ${(data.revenue || 0).toLocaleString()}
                            </td>
                            <td className="text-right p-3 text-red-600">
                              ${(data.expenses || 0).toLocaleString()}
                            </td>
                            <td className={`text-right p-3 ${(data.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${(data.net_profit || 0).toLocaleString()}
                            </td>
                            <td className="text-center p-3">
                              <Badge variant={data.is_projection ? 'secondary' : 'default'}>
                                {data.is_projection ? 'Projection' : 'Actual'}
                              </Badge>
                            </td>
                            <td className="text-center p-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(data)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(data.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {financialData.length > 0 ? (
              <FinancialCharts data={financialData} />
            ) : (
              <Card className="shadow-soft bg-card-gradient border-0">
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No data to visualize</h3>
                  <p className="text-muted-foreground">
                    Add financial data to see charts and analytics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            <FinancialProjections 
              historicalData={actualData}
              onGenerateProjections={handleGenerateProjections}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};