import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Edit, 
  Share, 
  TrendingUp, 
  Users, 
  Target,
  DollarSign,
  Settings,
  Eye,
  Calendar
} from 'lucide-react';

interface BusinessPlan {
  id: string;
  title: string;
  description: string;
  version: number;
  status: string;
  executive_summary: string;
  market_analysis: string;
  competitive_analysis: string;
  marketing_strategy: string;
  operations_plan: string;
  financial_projections: string;
  funding_requirements: number | null;
  created_at: string;
  updated_at: string;
}

interface BusinessPlanViewerProps {
  planId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

const BusinessPlanViewer = ({ planId, onEdit, onBack }: BusinessPlanViewerProps) => {
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessPlan();
  }, [planId]);

  const loadBusinessPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        throw error;
      }

      setBusinessPlan(data);
    } catch (error: any) {
      console.error('Error loading business plan:', error);
      toast({
        title: "Error",
        description: "Failed to load business plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    // TODO: Implement PDF generation
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    });
  };

  const sharePlan = () => {
    // TODO: Implement sharing functionality
    toast({
      title: "Coming Soon",
      description: "Sharing functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business plan...</p>
        </div>
      </div>
    );
  }

  if (!businessPlan) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Business Plan Not Found</h3>
        <p className="text-muted-foreground mb-4">
          The business plan you're looking for doesn't exist or you don't have permission to view it.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>
    );
  }

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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{businessPlan.title}</CardTitle>
                <Badge variant={businessPlan.status === 'active' ? 'default' : 'secondary'}>
                  v{businessPlan.version}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {businessPlan.status}
                </Badge>
              </div>
              
              <CardDescription className="text-base">
                {businessPlan.description}
              </CardDescription>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {formatDate(businessPlan.created_at)}
                </div>
                
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Funding Goal: {formatCurrency(businessPlan.funding_requirements)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              
              <Button variant="outline" size="sm" onClick={sharePlan}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {onEdit && (
                <Button size="sm" onClick={onEdit} className="bg-primary-gradient hover:opacity-90">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Plan Content */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardContent className="p-0">
          <Tabs defaultValue="executive-summary" className="w-full">
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="executive-summary" className="text-xs">
                  <Eye className="h-4 w-4 mr-1" />
                  Executive
                </TabsTrigger>
                <TabsTrigger value="market-analysis" className="text-xs">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Market
                </TabsTrigger>
                <TabsTrigger value="competitive-analysis" className="text-xs">
                  <Target className="h-4 w-4 mr-1" />
                  Competition
                </TabsTrigger>
                <TabsTrigger value="marketing-strategy" className="text-xs">
                  <Users className="h-4 w-4 mr-1" />
                  Marketing
                </TabsTrigger>
                <TabsTrigger value="operations" className="text-xs">
                  <Settings className="h-4 w-4 mr-1" />
                  Operations
                </TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Financial
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="executive-summary" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Executive Summary
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.executive_summary}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="market-analysis" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Analysis
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.market_analysis}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="competitive-analysis" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Competitive Analysis
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.competitive_analysis}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="marketing-strategy" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Marketing Strategy
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.marketing_strategy}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Operations Plan
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.operations_plan}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financial Projections
                  </h3>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {businessPlan.financial_projections}
                      </p>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessPlanViewer;