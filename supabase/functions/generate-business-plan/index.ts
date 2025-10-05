import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessIdeaInput {
  companyName: string;
  industry: string;
  targetMarket: string;
  businessModel: string;
  problemStatement: string;
  solution: string;
  uniqueSellingProposition: string;
  fundingGoal?: number;
  timeframe?: string;
  additionalContext?: string;
}

interface BusinessPlanSections {
  executiveSummary: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingStrategy: string;
  operationsPlan: string;
  financialProjections: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { businessIdea, companyId }: { businessIdea: BusinessIdeaInput; companyId: string } = await req.json();

    console.log('Generating business plan for:', businessIdea.companyName);

    // Generate each section of the business plan
    const sections = await generateBusinessPlanSections(openAIApiKey, businessIdea);

    // Save the business plan to database
    const { data: businessPlan, error: insertError } = await supabase
      .from('business_plans')
      .insert({
        company_id: companyId,
        title: `${businessIdea.companyName} Business Plan`,
        description: `AI-generated business plan for ${businessIdea.companyName}`,
        executive_summary: sections.executiveSummary,
        market_analysis: sections.marketAnalysis,
        competitive_analysis: sections.competitiveAnalysis,
        marketing_strategy: sections.marketingStrategy,
        operations_plan: sections.operationsPlan,
        financial_projections: sections.financialProjections,
        funding_requirements: businessIdea.fundingGoal || null,
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save business plan');
    }

    console.log('Business plan generated successfully:', businessPlan.id);

    return new Response(JSON.stringify({ 
      businessPlan,
      message: 'Business plan generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating business plan:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate business plan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateBusinessPlanSections(
  apiKey: string,
  businessIdea: BusinessIdeaInput
): Promise<BusinessPlanSections> {
  
  const generateSection = async (sectionName: string, prompt: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert business consultant and strategist with 20+ years of experience helping startups create comprehensive business plans. Provide detailed, actionable, and professional content that could be used in a real business plan presentation to investors.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error for ${sectionName}:`, response.status, errorText);
      throw new Error(`OpenAI API error for ${sectionName}: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Generate Executive Summary
  const executiveSummary = await generateSection('Executive Summary', 
    `Create a compelling executive summary for a business plan with these details:
    
    Company: ${businessIdea.companyName}
    Industry: ${businessIdea.industry}
    Target Market: ${businessIdea.targetMarket}
    Business Model: ${businessIdea.businessModel}
    Problem: ${businessIdea.problemStatement}
    Solution: ${businessIdea.solution}
    USP: ${businessIdea.uniqueSellingProposition}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    
    The executive summary should be 300-500 words and include: company overview, market opportunity, competitive advantage, financial highlights, and funding requirements.`
  );

  // Generate Market Analysis
  const marketAnalysis = await generateSection('Market Analysis',
    `Conduct a comprehensive market analysis for ${businessIdea.companyName} in the ${businessIdea.industry} industry targeting ${businessIdea.targetMarket}.
    
    Include:
    1. Market size and growth projections
    2. Target customer demographics and psychographics
    3. Market trends and drivers
    4. Customer pain points and needs
    5. Market segmentation
    6. Barriers to entry
    
    Make it specific to the ${businessIdea.industry} industry and provide realistic data and insights.`
  );

  // Generate Competitive Analysis
  const competitiveAnalysis = await generateSection('Competitive Analysis',
    `Analyze the competitive landscape for ${businessIdea.companyName} in the ${businessIdea.industry} industry.
    
    Business Model: ${businessIdea.businessModel}
    Unique Selling Proposition: ${businessIdea.uniqueSellingProposition}
    
    Include:
    1. Direct and indirect competitors
    2. Competitive positioning matrix
    3. Competitor strengths and weaknesses
    4. Market share analysis
    5. Competitive advantages and differentiation
    6. Potential threats and opportunities
    
    Focus on how ${businessIdea.companyName} can differentiate itself in this market.`
  );

  // Generate Marketing Strategy
  const marketingStrategy = await generateSection('Marketing Strategy',
    `Develop a comprehensive marketing strategy for ${businessIdea.companyName}.
    
    Target Market: ${businessIdea.targetMarket}
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    
    Include:
    1. Marketing mix (4Ps: Product, Price, Place, Promotion)
    2. Customer acquisition strategy
    3. Digital marketing channels and tactics
    4. Brand positioning and messaging
    5. Sales strategy and process
    6. Customer retention and growth strategies
    7. Marketing budget allocation and ROI expectations`
  );

  // Generate Operations Plan
  const operationsPlan = await generateSection('Operations Plan',
    `Create a detailed operations plan for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    
    Include:
    1. Operational workflow and processes
    2. Technology requirements and infrastructure
    3. Staffing and organizational structure
    4. Key partnerships and suppliers
    5. Quality control and assurance
    6. Scalability considerations
    7. Risk management and contingency planning
    
    Make it specific to the ${businessIdea.industry} industry and business model.`
  );

  // Generate Financial Projections
  const financialProjections = await generateSection('Financial Projections',
    `Create comprehensive financial projections for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Target Market: ${businessIdea.targetMarket}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    
    Include:
    1. Revenue model and pricing strategy
    2. 3-year financial projections (P&L, Cash Flow, Balance Sheet)
    3. Key financial metrics and KPIs
    4. Break-even analysis
    5. Funding requirements and use of funds
    6. Revenue assumptions and growth drivers
    7. Cost structure and expense breakdown
    8. Sensitivity analysis and scenarios
    
    Provide realistic numbers based on industry benchmarks for ${businessIdea.industry}.`
  );

  return {
    executiveSummary,
    marketAnalysis,
    competitiveAnalysis,
    marketingStrategy,
    operationsPlan,
    financialProjections
  };
}