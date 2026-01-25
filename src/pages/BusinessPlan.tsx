import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BusinessPlanGenerator from '@/components/business-plan/BusinessPlanGenerator';
import BusinessPlanViewer from '@/components/business-plan/BusinessPlanViewer';
import { ArrowLeft, Plus, FileText, Calendar, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { BusinessPlanListSkeleton } from '@/components/skeletons';

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

interface FullBusinessPlan extends BusinessPlan {
  executive_summary: string;
  market_analysis: string;
  competitive_analysis: string;
  marketing_strategy: string;
  operations_plan: string;
  financial_projections: string;
}

const BusinessPlan = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<FullBusinessPlan | null>(null);
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
    setEditingPlan(null);
    setViewMode('viewer');
    loadBusinessPlans(); // Refresh the list
  };

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setEditingPlan(null);
    setViewMode('viewer');
  };

  const handleEditPlan = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;

      setEditingPlan(data as FullBusinessPlan);
      setViewMode('generator');
    } catch (error: any) {
      console.error('Error loading plan for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load business plan for editing",
        variant: "destructive"
      });
    }
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
    return <BusinessPlanListSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant border text-center overflow-hidden">
            <div className="bg-primary/5 p-8">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Companies Found</h2>
              <p className="text-muted-foreground mb-6">
                You need to create a company first before generating business plans.
              </p>
              <Button onClick={() => window.location.href = '/onboarding'} size="lg" className="bg-primary-gradient hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Complete Company Setup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
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
        
        {viewMode === 'list' && (
          <Button 
            onClick={() => {
              setEditingPlan(null);
              setViewMode('generator');
            }}
            size="lg"
            className="bg-primary-gradient hover:opacity-90 shadow-elegant ml-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        )}
      </div>
      {viewMode === 'list' && (
        <div className="space-y-6">
          {businessPlans.length === 0 ? (
            <Card className="shadow-soft border text-center overflow-hidden">
              <div className="bg-primary/5 p-12">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <FileText className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Business Plans Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Create your first AI-powered business plan to get started with investor outreach and strategic planning.
                </p>
                <Button 
                  onClick={() => setViewMode('generator')}
                  size="lg"
                  className="bg-primary-gradient hover:opacity-90 shadow-elegant"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First Business Plan
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className="shadow-soft border hover:shadow-elegant transition-all duration-300 cursor-pointer hover-scale group"
                  onClick={() => handleViewPlan(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-lg leading-tight line-clamp-1">{plan.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            v{plan.version}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            {plan.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2 text-sm">
                      {plan.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(plan.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">{formatCurrency(plan.funding_requirements)}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 transition-colors">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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
          editingPlan={editingPlan}
        />
      )}

      {viewMode === 'viewer' && selectedPlanId && (
        <BusinessPlanViewer 
          planId={selectedPlanId}
          onEdit={() => handleEditPlan(selectedPlanId)}
          onBack={() => {
            setViewMode('list');
            setSelectedPlanId(null);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
};

export default BusinessPlan;