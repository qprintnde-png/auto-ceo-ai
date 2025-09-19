import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BusinessPlanGenerator from '@/components/business-plan/BusinessPlanGenerator';
import BusinessPlanViewer from '@/components/business-plan/BusinessPlanViewer';
import { ArrowLeft, Plus, FileText, Calendar, DollarSign } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface BusinessPlan {
  id: string;
  title: string;
  description: string;
  version: number;
  status: string;
  funding_requirements: number | null;
  created_at: string;
}

type ViewMode = 'list' | 'generator' | 'viewer';

const BusinessPlan = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadBusinessPlans();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessPlans = async () => {
    if (!selectedCompanyId) return;

    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('id, title, description, version, status, funding_requirements, created_at')
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBusinessPlans(data || []);
    } catch (error: any) {
      console.error('Error loading business plans:', error);
      toast({
        title: "Error",
        description: "Failed to load business plans",
        variant: "destructive"
      });
    }
  };

  const handlePlanGenerated = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('viewer');
    loadBusinessPlans(); // Refresh the list
  };

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('viewer');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-subtle-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your business plans...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-subtle-gradient p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <Card className="shadow-elegant bg-card-gradient border-0 text-center p-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Companies Found</h2>
            <p className="text-muted-foreground mb-6">
              You need to create a company first before generating business plans.
            </p>
            <Button onClick={() => window.location.href = '/onboarding'}>
              Complete Company Setup
            </Button>
          </Card>
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
            <div className="flex items-center gap-4">
              {viewMode !== 'list' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode('list');
                    setSelectedPlanId(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold bg-primary-gradient bg-clip-text text-transparent">
                  Business Plans
                </h1>
                {selectedCompanyId && (
                  <p className="text-sm text-muted-foreground">
                    {companies.find(c => c.id === selectedCompanyId)?.name}
                  </p>
                )}
              </div>
            </div>

            {viewMode === 'list' && (
              <Button 
                onClick={() => setViewMode('generator')}
                className="bg-primary-gradient hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
          <div className="space-y-6">
            {businessPlans.length === 0 ? (
              <Card className="shadow-soft bg-card-gradient border-0 text-center p-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Business Plans Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first AI-powered business plan to get started with investor outreach and strategic planning.
                </p>
                <Button 
                  onClick={() => setViewMode('generator')}
                  className="bg-primary-gradient hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Your First Business Plan
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessPlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewPlan(plan.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                              v{plan.version}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {plan.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <CardDescription className="line-clamp-2">
                        {plan.description}
                      </CardDescription>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(plan.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(plan.funding_requirements)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'generator' && selectedCompanyId && (
          <BusinessPlanGenerator 
            companyId={selectedCompanyId}
            onPlanGenerated={handlePlanGenerated}
          />
        )}

        {viewMode === 'viewer' && selectedPlanId && (
          <BusinessPlanViewer 
            planId={selectedPlanId}
            onEdit={() => {
              // TODO: Implement edit functionality
              toast({
                title: "Coming Soon",
                description: "Edit functionality will be available soon"
              });
            }}
            onBack={() => {
              setViewMode('list');
              setSelectedPlanId(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default BusinessPlan;