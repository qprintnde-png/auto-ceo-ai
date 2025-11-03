import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, Edit } from 'lucide-react';

interface BusinessPlan {
  id: string;
  title: string;
  description: string;
  executive_summary: string;
  market_analysis: string;
  competitive_analysis: string;
  marketing_strategy: string;
  operations_plan: string;
  financial_projections: string;
  funding_requirements: number | null;
}

interface BusinessPlanGeneratorProps {
  companyId: string;
  onPlanGenerated: (planId: string) => void;
  editingPlan?: BusinessPlan | null;
}

const businessIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  targetMarket: z.string().min(10, 'Target market must be at least 10 characters'),
  problemSolved: z.string().min(20, 'Problem statement must be at least 20 characters'),
  uniqueValue: z.string().min(20, 'Unique value proposition must be at least 20 characters'),
  fundingRequirements: z.string().min(1, 'Funding requirements are required'),
  competitiveAdvantage: z.string().optional(),
  revenueModel: z.string().optional(),
});

const BusinessPlanGenerator = ({ companyId, onPlanGenerated, editingPlan }: BusinessPlanGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof businessIdeaSchema>>({
    resolver: zodResolver(businessIdeaSchema),
    defaultValues: {
      title: editingPlan?.title || '',
      description: editingPlan?.description || '',
      industry: '',
      targetMarket: '',
      problemSolved: '',
      uniqueValue: '',
      fundingRequirements: editingPlan?.funding_requirements?.toString() || '',
      competitiveAdvantage: '',
      revenueModel: '',
    },
  });

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        title: editingPlan.title,
        description: editingPlan.description,
        industry: '',
        targetMarket: '',
        problemSolved: '',
        uniqueValue: '',
        fundingRequirements: editingPlan.funding_requirements?.toString() || '',
        competitiveAdvantage: '',
        revenueModel: '',
      });
    }
  }, [editingPlan, form]);

  const onSubmit = async (values: z.infer<typeof businessIdeaSchema>) => {
    setIsGenerating(true);

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('business_plans')
          .update({
            title: values.title,
            description: values.description,
            funding_requirements: parseFloat(values.fundingRequirements),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: "Business Plan Updated!",
          description: "Your business plan has been updated successfully.",
        });

        onPlanGenerated(editingPlan.id);
      } else {
        // Generate new plan
        const { data, error } = await supabase.functions.invoke('generate-business-plan', {
          body: {
            companyId,
            businessIdea: values,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        toast({
          title: "Business Plan Generated!",
          description: "Your AI-powered business plan has been created successfully.",
        });

        onPlanGenerated(data.businessPlanId);
      }
    } catch (error: any) {
      console.error('Error with business plan:', error);
      toast({
        title: editingPlan ? "Update Failed" : "Generation Failed",
        description: error.message || `Failed to ${editingPlan ? 'update' : 'generate'} business plan. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-elegant border max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl flex items-center gap-2">
          {editingPlan ? <Edit className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />}
          {editingPlan ? 'Edit Business Plan' : 'AI Business Plan Generator'}
        </CardTitle>
        <CardDescription>
          {editingPlan 
            ? 'Update your business plan details' 
            : 'Fill in the details about your business idea to generate a comprehensive plan'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Plan Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SaaS Platform for Small Businesses" {...field} />
                      </FormControl>
                      <FormDescription>A clear, concise title for your business plan</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business in 2-3 sentences..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>A brief overview of what your business does</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="services">Professional Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Problem & Solution */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Problem & Solution</h3>
                
                <FormField
                  control={form.control}
                  name="problemSolved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What Problem Are You Solving? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the problem your business addresses..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Clearly define the pain point your business solves</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uniqueValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unique Value Proposition *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What makes your solution unique and better?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Explain what sets you apart from alternatives</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Market & Competition */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Market & Competition</h3>
                
                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Who are your ideal customers? Be specific..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Define your target audience demographics and characteristics</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitiveAdvantage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitive Advantage</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What advantages do you have over competitors?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Your unique strengths and barriers to entry</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Model */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Business Model</h3>
                
                <FormField
                  control={form.control}
                  name="revenueModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Model</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How will you make money? (subscriptions, one-time sales, etc.)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Explain your pricing strategy and revenue streams</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fundingRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Requirements *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500000" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Total amount of funding needed (in USD)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={isGenerating}
                className="w-full bg-primary-gradient hover:opacity-90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingPlan ? 'Updating...' : 'Generating Business Plan...'}
                  </>
                ) : (
                  <>
                    {editingPlan ? <Edit className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {editingPlan ? 'Update Business Plan' : 'Generate Business Plan'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BusinessPlanGenerator;
