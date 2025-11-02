import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lightbulb, Target, Users, DollarSign, Rocket, Building2, TrendingUp, Award, HelpCircle, Save } from 'lucide-react';

interface BusinessIdeaForm {
  companyName: string;
  industry: string;
  targetMarket: string;
  businessModel: string;
  problemStatement: string;
  solution: string;
  uniqueSellingProposition: string;
  fundingGoal: string;
  timeframe: string;
  additionalContext: string;
  marketSize: string;
  competitors: string;
  competitiveAdvantage: string;
  foundersBackground: string;
  teamSize: string;
  keyHires: string;
  productStage: string;
  features: string;
  pricingStrategy: string;
  customerAcquisition: string;
  marketingChannels: string;
  salesStrategy: string;
  revenueModel: string;
  monthlyRevenue: string;
  burnRate: string;
  breakEven: string;
}

interface BusinessPlanGeneratorProps {
  companyId: string;
  onPlanGenerated: (planId: string) => void;
}

const BusinessPlanGenerator = ({ companyId, onPlanGenerated }: BusinessPlanGeneratorProps) => {
  const [formData, setFormData] = useState<BusinessIdeaForm>({
    companyName: '',
    industry: '',
    targetMarket: '',
    businessModel: '',
    problemStatement: '',
    solution: '',
    uniqueSellingProposition: '',
    fundingGoal: '',
    timeframe: '',
    additionalContext: '',
    marketSize: '',
    competitors: '',
    competitiveAdvantage: '',
    foundersBackground: '',
    teamSize: '',
    keyHires: '',
    productStage: '',
    features: '',
    pricingStrategy: '',
    customerAcquisition: '',
    marketingChannels: '',
    salesStrategy: '',
    revenueModel: '',
    monthlyRevenue: '',
    burnRate: '',
    breakEven: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('basics');
  const { session } = useAuth();
  const { toast } = useToast();

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`business-plan-draft-${companyId}`);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [companyId]);

  const updateFormData = (field: keyof BusinessIdeaForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['companyName', 'industry', 'targetMarket', 'businessModel', 'problemStatement', 'solution'];
    return required.every(field => formData[field as keyof BusinessIdeaForm].trim() !== '');
  };

  const getCompletionPercentage = () => {
    const allFields = Object.keys(formData);
    const filledFields = allFields.filter(key => formData[key as keyof BusinessIdeaForm].trim() !== '');
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(`business-plan-draft-${companyId}`, JSON.stringify(formData));
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateBusinessPlan = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields in the Basics and Problem tabs",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const businessIdea = {
        ...formData,
        fundingGoal: formData.fundingGoal ? parseFloat(formData.fundingGoal) : undefined
      };

      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: {
          businessIdea,
          companyId
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to generate business plan');
      }

      // Clear draft after successful generation
      localStorage.removeItem(`business-plan-draft-${companyId}`);

      toast({
        title: "Business Plan Generated!",
        description: "Your comprehensive business plan has been created successfully."
      });

      onPlanGenerated(data.businessPlan.id);

    } catch (error: any) {
      console.error('Business plan generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate business plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const FieldTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <HelpCircle className="h-3 w-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-executive-gradient text-white text-sm font-medium mb-2">
            <Lightbulb className="h-4 w-4" />
            AI-Powered Business Planning
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-executive-gradient">
            Create Your Business Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your business idea into a comprehensive, investor-ready business plan with AI assistance
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Badge variant="outline" className="px-3 py-1">
              {getCompletionPercentage()}% Complete
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={saveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
          </div>
        </div>

        {isGenerating && (
          <Card className="shadow-card border overflow-hidden">
            <div className="bg-primary/5 p-10">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Generating Your Business Plan</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Our AI is analyzing your business idea and creating comprehensive sections...
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="w-full max-w-md mx-auto h-3" />
                  <p className="text-sm font-medium text-primary">{progress}% Complete</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {!isGenerating && (
          <Card className="shadow-card border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="border-b bg-muted/30">
                <TabsList className="grid w-full grid-cols-6 h-auto">
                  <TabsTrigger value="basics" className="flex flex-col gap-1 py-3">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs">Basics</span>
                  </TabsTrigger>
                  <TabsTrigger value="problem" className="flex flex-col gap-1 py-3">
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-xs">Problem</span>
                  </TabsTrigger>
                  <TabsTrigger value="market" className="flex flex-col gap-1 py-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Market</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="product" className="flex flex-col gap-1 py-3">
                    <Award className="h-4 w-4" />
                    <span className="text-xs">Product</span>
                  </TabsTrigger>
                  <TabsTrigger value="financials" className="flex flex-col gap-1 py-3">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Financials</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                {/* Basics Tab */}
                <TabsContent value="basics" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Company Overview</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your company and core business concept
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        <FieldTooltip content="The official name of your company or startup">
                          Company Name *
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">
                        <FieldTooltip content="The primary industry or sector your business operates in">
                          Industry *
                        </FieldTooltip>
                      </Label>
                      <Select 
                        value={formData.industry} 
                        onValueChange={(value) => updateFormData('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail & E-commerce</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="sustainability">Sustainability</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetMarket">
                        <FieldTooltip content="Who are your ideal customers? Be specific about demographics, company size, etc.">
                          Target Market *
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="targetMarket"
                        value={formData.targetMarket}
                        onChange={(e) => updateFormData('targetMarket', e.target.value)}
                        placeholder="e.g., Small businesses, millennials, healthcare providers"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessModel">
                        <FieldTooltip content="How will your business make money?">
                          Business Model *
                        </FieldTooltip>
                      </Label>
                      <Select 
                        value={formData.businessModel} 
                        onValueChange={(value) => updateFormData('businessModel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saas">SaaS (Software as a Service)</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="freemium">Freemium</SelectItem>
                          <SelectItem value="e-commerce">E-commerce</SelectItem>
                          <SelectItem value="consulting">Consulting/Services</SelectItem>
                          <SelectItem value="licensing">Licensing</SelectItem>
                          <SelectItem value="advertising">Advertising</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fundingGoal">
                        <FieldTooltip content="The amount of funding you're seeking to raise">
                          Funding Goal (USD)
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="fundingGoal"
                        type="number"
                        value={formData.fundingGoal}
                        onChange={(e) => updateFormData('fundingGoal', e.target.value)}
                        placeholder="e.g., 100000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">
                        <FieldTooltip content="Your expected timeline for execution">
                          Timeline
                        </FieldTooltip>
                      </Label>
                      <Select 
                        value={formData.timeframe} 
                        onValueChange={(value) => updateFormData('timeframe', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="1-year">1 Year</SelectItem>
                          <SelectItem value="2-years">2 Years</SelectItem>
                          <SelectItem value="3-years">3+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Problem & Solution Tab */}
                <TabsContent value="problem" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Problem & Solution</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Define the problem you're solving and your unique solution
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemStatement">
                      <FieldTooltip content="Clearly describe the specific problem your target market faces">
                        Problem Statement *
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="problemStatement"
                      value={formData.problemStatement}
                      onChange={(e) => updateFormData('problemStatement', e.target.value)}
                      placeholder="Describe the specific problem your target market faces..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solution">
                      <FieldTooltip content="Explain how your product/service solves this problem">
                        Your Solution *
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="solution"
                      value={formData.solution}
                      onChange={(e) => updateFormData('solution', e.target.value)}
                      placeholder="Explain how your product/service solves this problem..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uniqueSellingProposition">
                      <FieldTooltip content="What makes your solution unique and better than alternatives?">
                        Unique Selling Proposition
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="uniqueSellingProposition"
                      value={formData.uniqueSellingProposition}
                      onChange={(e) => updateFormData('uniqueSellingProposition', e.target.value)}
                      placeholder="What makes your solution unique and better than alternatives?"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Market & Competition Tab */}
                <TabsContent value="market" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Market & Competition</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Provide insights about your market size and competitive landscape
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketSize">
                      <FieldTooltip content="Estimate the total addressable market (TAM) and serviceable market (SAM)">
                        Market Size
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="marketSize"
                      value={formData.marketSize}
                      onChange={(e) => updateFormData('marketSize', e.target.value)}
                      placeholder="Describe the market size, growth rate, and potential..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitors">
                      <FieldTooltip content="List your main competitors and their offerings">
                        Competitors
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="competitors"
                      value={formData.competitors}
                      onChange={(e) => updateFormData('competitors', e.target.value)}
                      placeholder="Who are your main competitors? What do they offer?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitiveAdvantage">
                      <FieldTooltip content="What gives you an edge over the competition?">
                        Competitive Advantage
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="competitiveAdvantage"
                      value={formData.competitiveAdvantage}
                      onChange={(e) => updateFormData('competitiveAdvantage', e.target.value)}
                      placeholder="What advantages do you have over competitors?"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerAcquisition">
                        <FieldTooltip content="How will you acquire customers?">
                          Customer Acquisition
                        </FieldTooltip>
                      </Label>
                      <Textarea
                        id="customerAcquisition"
                        value={formData.customerAcquisition}
                        onChange={(e) => updateFormData('customerAcquisition', e.target.value)}
                        placeholder="Your customer acquisition strategy..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketingChannels">
                        <FieldTooltip content="Which marketing channels will you use?">
                          Marketing Channels
                        </FieldTooltip>
                      </Label>
                      <Textarea
                        id="marketingChannels"
                        value={formData.marketingChannels}
                        onChange={(e) => updateFormData('marketingChannels', e.target.value)}
                        placeholder="Social media, SEO, paid ads, partnerships..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Team & Leadership</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share information about your founding team and hiring plans
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foundersBackground">
                      <FieldTooltip content="Background, expertise, and relevant experience of founders">
                        Founders' Background
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="foundersBackground"
                      value={formData.foundersBackground}
                      onChange={(e) => updateFormData('foundersBackground', e.target.value)}
                      placeholder="Describe the background and expertise of founding team members..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">
                        <FieldTooltip content="Current team size and structure">
                          Current Team Size
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="teamSize"
                        value={formData.teamSize}
                        onChange={(e) => updateFormData('teamSize', e.target.value)}
                        placeholder="e.g., 5 full-time, 2 part-time"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyHires">
                        <FieldTooltip content="Critical roles you need to fill">
                          Key Hires Needed
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="keyHires"
                        value={formData.keyHires}
                        onChange={(e) => updateFormData('keyHires', e.target.value)}
                        placeholder="e.g., CTO, Sales Director, Marketing Manager"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Product Tab */}
                <TabsContent value="product" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Product & Service</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Details about your product development and offerings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productStage">
                      <FieldTooltip content="What stage is your product in?">
                        Product Stage
                      </FieldTooltip>
                    </Label>
                    <Select 
                      value={formData.productStage} 
                      onValueChange={(value) => updateFormData('productStage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea Stage</SelectItem>
                        <SelectItem value="prototype">Prototype</SelectItem>
                        <SelectItem value="mvp">MVP/Beta</SelectItem>
                        <SelectItem value="launched">Launched</SelectItem>
                        <SelectItem value="scaling">Scaling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">
                      <FieldTooltip content="Key features and functionality of your product/service">
                        Key Features
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => updateFormData('features', e.target.value)}
                      placeholder="List and describe the main features of your product or service..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricingStrategy">
                      <FieldTooltip content="How will you price your product/service?">
                        Pricing Strategy
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="pricingStrategy"
                      value={formData.pricingStrategy}
                      onChange={(e) => updateFormData('pricingStrategy', e.target.value)}
                      placeholder="Describe your pricing tiers, models, and strategy..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesStrategy">
                      <FieldTooltip content="How will you sell your product?">
                        Sales Strategy
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="salesStrategy"
                      value={formData.salesStrategy}
                      onChange={(e) => updateFormData('salesStrategy', e.target.value)}
                      placeholder="Direct sales, partnerships, self-service, etc..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Financial Projections</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Provide financial estimates and projections
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenueModel">
                      <FieldTooltip content="How will you generate revenue?">
                        Revenue Model
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="revenueModel"
                      value={formData.revenueModel}
                      onChange={(e) => updateFormData('revenueModel', e.target.value)}
                      placeholder="Describe your revenue streams and pricing model..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRevenue">
                        <FieldTooltip content="Current or projected monthly revenue">
                          Monthly Revenue (USD)
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="monthlyRevenue"
                        type="number"
                        value={formData.monthlyRevenue}
                        onChange={(e) => updateFormData('monthlyRevenue', e.target.value)}
                        placeholder="Current or projected"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="burnRate">
                        <FieldTooltip content="How much are you spending per month?">
                          Monthly Burn Rate (USD)
                        </FieldTooltip>
                      </Label>
                      <Input
                        id="burnRate"
                        type="number"
                        value={formData.burnRate}
                        onChange={(e) => updateFormData('burnRate', e.target.value)}
                        placeholder="Monthly expenses"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breakEven">
                      <FieldTooltip content="When do you expect to break even?">
                        Break-Even Timeline
                      </FieldTooltip>
                    </Label>
                    <Input
                      id="breakEven"
                      value={formData.breakEven}
                      onChange={(e) => updateFormData('breakEven', e.target.value)}
                      placeholder="e.g., 18 months from funding"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalContext">
                      <FieldTooltip content="Any additional financial information or context">
                        Additional Financial Context
                      </FieldTooltip>
                    </Label>
                    <Textarea
                      id="additionalContext"
                      value={formData.additionalContext}
                      onChange={(e) => updateFormData('additionalContext', e.target.value)}
                      placeholder="Any additional information that would help generate a better business plan..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>

            <CardContent className="border-t bg-muted/20 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                * Required fields must be filled before generating
              </p>
              <Button 
                onClick={generateBusinessPlan}
                size="lg"
                className="bg-executive-gradient hover:opacity-90 shadow-card px-8 py-5"
                disabled={!validateForm()}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Generate Business Plan with AI
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default BusinessPlanGenerator;
