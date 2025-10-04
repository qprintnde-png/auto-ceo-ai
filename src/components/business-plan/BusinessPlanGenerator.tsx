import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lightbulb, Target, Users, DollarSign, Rocket } from 'lucide-react';

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
    additionalContext: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { session } = useAuth();
  const { toast } = useToast();

  const updateFormData = (field: keyof BusinessIdeaForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['companyName', 'industry', 'targetMarket', 'businessModel', 'problemStatement', 'solution'];
    return required.every(field => formData[field as keyof BusinessIdeaForm].trim() !== '');
  };

  const generateBusinessPlan = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <Lightbulb className="h-4 w-4" />
          AI-Powered Business Planning
        </div>
        <h1 className="text-4xl font-bold">
          Create Your Business Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your business idea into a comprehensive, investor-ready business plan with AI assistance
        </p>
      </div>

      {isGenerating && (
        <Card className="shadow-elegant border overflow-hidden">
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
        <div className="grid gap-6">
          {/* Company Overview */}
          <Card className="shadow-soft border hover:shadow-elegant transition-all">{/* ... keep existing code */}
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <CardTitle>Company Overview</CardTitle>
              </div>
              <CardDescription>
                Tell us about your company and core business concept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
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
                  <Label htmlFor="targetMarket">Target Market *</Label>
                  <Input
                    id="targetMarket"
                    value={formData.targetMarket}
                    onChange={(e) => updateFormData('targetMarket', e.target.value)}
                    placeholder="e.g., Small businesses, millennials, healthcare providers"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessModel">Business Model *</Label>
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
            </CardContent>
          </Card>

          {/* Problem & Solution */}
          <Card className="shadow-soft border hover:shadow-elegant transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Problem & Solution</CardTitle>
              </div>
              <CardDescription>
                Define the problem you're solving and your unique solution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  value={formData.problemStatement}
                  onChange={(e) => updateFormData('problemStatement', e.target.value)}
                  placeholder="Describe the specific problem your target market faces..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="solution">Your Solution *</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => updateFormData('solution', e.target.value)}
                  placeholder="Explain how your product/service solves this problem..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="uniqueSellingProposition">Unique Selling Proposition</Label>
                <Textarea
                  id="uniqueSellingProposition"
                  value={formData.uniqueSellingProposition}
                  onChange={(e) => updateFormData('uniqueSellingProposition', e.target.value)}
                  placeholder="What makes your solution unique and better than alternatives?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Goals */}
          <Card className="shadow-soft border hover:shadow-elegant transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Business Goals</CardTitle>
              </div>
              <CardDescription>
                Share your funding goals and timeline expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Funding Goal (USD)</Label>
                  <Input
                    id="fundingGoal"
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(e) => updateFormData('fundingGoal', e.target.value)}
                    placeholder="e.g., 100000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeline</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="additionalContext">Additional Context</Label>
                <Textarea
                  id="additionalContext"
                  value={formData.additionalContext}
                  onChange={(e) => updateFormData('additionalContext', e.target.value)}
                  placeholder="Any additional information that would help generate a better business plan..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={generateBusinessPlan}
              size="lg"
              className="bg-primary-gradient hover:opacity-90 shadow-elegant px-10 py-6 text-lg"
              disabled={!validateForm()}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Generate Business Plan with AI
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPlanGenerator;