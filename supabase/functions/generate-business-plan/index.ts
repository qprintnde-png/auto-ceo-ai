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
  marketSize?: string;
  competitors?: string;
  competitiveAdvantage?: string;
  foundersBackground?: string;
  teamSize?: string;
  keyHires?: string;
  productStage?: string;
  features?: string;
  pricingStrategy?: string;
  customerAcquisition?: string;
  marketingChannels?: string;
  salesStrategy?: string;
  revenueModel?: string;
  monthlyRevenue?: string;
  burnRate?: string;
  breakEven?: string;
}

interface BusinessPlanSections {
  executiveSummary: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingStrategy: string;
  operationsPlan: string;
  financialProjections: string;
}

interface SectionResult {
  section: keyof BusinessPlanSections;
  content: string;
  latencyMs: number;
  fromCache: boolean;
}

interface GenerationMetrics {
  totalTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
  sectionMetrics: Record<string, { latencyMs: number; success: boolean; fromCache: boolean }>;
}

// Simple hash function for cache keys
async function hashInput(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
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

    const { businessIdea, companyId, skipCache = false }: { 
      businessIdea: BusinessIdeaInput; 
      companyId: string;
      skipCache?: boolean;
    } = await req.json();

    console.log('Generating business plan for:', businessIdea.companyName);
    console.log('Using parallel processing with Promise.allSettled...');
    console.log('Cache enabled:', !skipCache);

    // Generate all sections in parallel with caching
    const { sections, metrics } = await generateBusinessPlanSectionsParallel(
      supabase,
      lovableApiKey, 
      businessIdea,
      !skipCache
    );

    const totalTimeMs = Date.now() - startTime;
    console.log(`Total generation time: ${totalTimeMs}ms`);
    console.log(`Cache hits: ${metrics.cacheHits}/${metrics.cacheHits + metrics.cacheMisses}`);
    console.log('Section metrics:', JSON.stringify(metrics.sectionMetrics, null, 2));

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
        status: 'draft',
        ai_generated: true
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
      message: 'Business plan generated successfully',
      metrics: {
        totalTimeMs,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        sectionMetrics: metrics.sectionMetrics
      }
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

// Check cache for existing response
async function checkCache(
  supabase: any,
  inputHash: string,
  sectionType: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cached_sections')
      .select('id, content')
      .eq('input_hash', inputHash)
      .eq('section_type', sectionType)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Increment hit count asynchronously (don't await)
    supabase
      .from('cached_sections')
      .update({ hit_count: data.hit_count + 1 })
      .eq('id', data.id)
      .then(() => {});

    return data.content;
  } catch {
    return null;
  }
}

// Store response in cache
async function storeInCache(
  supabase: any,
  inputHash: string,
  sectionType: string,
  aiProvider: string,
  content: string
): Promise<void> {
  try {
    await supabase
      .from('cached_sections')
      .upsert({
        input_hash: inputHash,
        section_type: sectionType,
        ai_provider: aiProvider,
        content: content,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        hit_count: 0
      }, { onConflict: 'input_hash' });
  } catch (error) {
    console.warn('Failed to store in cache:', error);
  }
}

// Helper function to generate a single section with timing and caching
async function generateSection(
  supabase: any,
  apiKey: string,
  sectionName: keyof BusinessPlanSections,
  prompt: string,
  useCache: boolean
): Promise<SectionResult> {
  const startTime = Date.now();
  const inputHash = await hashInput(`${sectionName}:${prompt}`);
  
  // Check cache first
  if (useCache) {
    const cachedContent = await checkCache(supabase, inputHash, sectionName);
    if (cachedContent) {
      console.log(`Cache HIT for ${sectionName}`);
      return {
        section: sectionName,
        content: cachedContent,
        latencyMs: Date.now() - startTime,
        fromCache: true
      };
    }
    console.log(`Cache MISS for ${sectionName}`);
  }
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
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
    console.error(`Lovable AI API error for ${sectionName}:`, response.status, errorText);
    throw new Error(`Lovable AI API error for ${sectionName}: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const latencyMs = Date.now() - startTime;
  
  console.log(`Section ${sectionName} generated in ${latencyMs}ms`);
  
  // Store in cache asynchronously
  if (useCache) {
    storeInCache(supabase, inputHash, sectionName, 'gemini-2.5-flash', content);
  }
  
  return {
    section: sectionName,
    content,
    latencyMs,
    fromCache: false
  };
}

// Build section prompts
function buildSectionPrompts(businessIdea: BusinessIdeaInput): Record<keyof BusinessPlanSections, string> {
  return {
    executiveSummary: `Create a compelling executive summary for a business plan with these details:
    
    Company: ${businessIdea.companyName}
    Industry: ${businessIdea.industry}
    Target Market: ${businessIdea.targetMarket}
    Business Model: ${businessIdea.businessModel}
    Problem: ${businessIdea.problemStatement}
    Solution: ${businessIdea.solution}
    USP: ${businessIdea.uniqueSellingProposition}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    ${businessIdea.marketSize ? `Market Size: ${businessIdea.marketSize}` : ''}
    ${businessIdea.productStage ? `Product Stage: ${businessIdea.productStage}` : ''}
    ${businessIdea.foundersBackground ? `Team Background: ${businessIdea.foundersBackground}` : ''}
    ${businessIdea.monthlyRevenue ? `Monthly Revenue: $${businessIdea.monthlyRevenue}` : ''}
    
    The executive summary should be 300-500 words and include: company overview, market opportunity, competitive advantage, financial highlights, and funding requirements.`,

    marketAnalysis: `Conduct a comprehensive market analysis for ${businessIdea.companyName} in the ${businessIdea.industry} industry targeting ${businessIdea.targetMarket}.
    
    ${businessIdea.marketSize ? `Market Size Information: ${businessIdea.marketSize}` : ''}
    ${businessIdea.customerAcquisition ? `Customer Acquisition Strategy: ${businessIdea.customerAcquisition}` : ''}
    ${businessIdea.marketingChannels ? `Marketing Channels: ${businessIdea.marketingChannels}` : ''}
    
    Include:
    1. Market size and growth projections
    2. Target customer demographics and psychographics
    3. Market trends and drivers
    4. Customer pain points and needs
    5. Market segmentation
    6. Barriers to entry
    
    Make it specific to the ${businessIdea.industry} industry and provide realistic data and insights.`,

    competitiveAnalysis: `Analyze the competitive landscape for ${businessIdea.companyName} in the ${businessIdea.industry} industry.
    
    Business Model: ${businessIdea.businessModel}
    Unique Selling Proposition: ${businessIdea.uniqueSellingProposition}
    ${businessIdea.competitors ? `Known Competitors: ${businessIdea.competitors}` : ''}
    ${businessIdea.competitiveAdvantage ? `Our Competitive Advantages: ${businessIdea.competitiveAdvantage}` : ''}
    
    Include:
    1. Direct and indirect competitors
    2. Competitive positioning matrix
    3. Competitor strengths and weaknesses
    4. Market share analysis
    5. Competitive advantages and differentiation
    6. Potential threats and opportunities
    
    Focus on how ${businessIdea.companyName} can differentiate itself in this market.`,

    marketingStrategy: `Develop a comprehensive marketing strategy for ${businessIdea.companyName}.
    
    Target Market: ${businessIdea.targetMarket}
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    ${businessIdea.customerAcquisition ? `Customer Acquisition: ${businessIdea.customerAcquisition}` : ''}
    ${businessIdea.marketingChannels ? `Marketing Channels: ${businessIdea.marketingChannels}` : ''}
    ${businessIdea.salesStrategy ? `Sales Strategy: ${businessIdea.salesStrategy}` : ''}
    
    Include:
    1. Marketing mix (4Ps: Product, Price, Place, Promotion)
    2. Customer acquisition strategy
    3. Digital marketing channels and tactics
    4. Brand positioning and messaging
    5. Sales strategy and process
    6. Customer retention and growth strategies
    7. Marketing budget allocation and ROI expectations`,

    operationsPlan: `Create a detailed operations plan for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    ${businessIdea.productStage ? `Product Stage: ${businessIdea.productStage}` : ''}
    ${businessIdea.teamSize ? `Current Team Size: ${businessIdea.teamSize}` : ''}
    ${businessIdea.keyHires ? `Key Hires Needed: ${businessIdea.keyHires}` : ''}
    ${businessIdea.foundersBackground ? `Team Background: ${businessIdea.foundersBackground}` : ''}
    ${businessIdea.features ? `Key Features: ${businessIdea.features}` : ''}
    
    Include:
    1. Operational workflow and processes
    2. Technology requirements and infrastructure
    3. Staffing and organizational structure
    4. Key partnerships and suppliers
    5. Quality control and assurance
    6. Scalability considerations
    7. Risk management and contingency planning
    
    Make it specific to the ${businessIdea.industry} industry and business model.`,

    financialProjections: `Create comprehensive financial projections for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Target Market: ${businessIdea.targetMarket}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    ${businessIdea.revenueModel ? `Revenue Model: ${businessIdea.revenueModel}` : ''}
    ${businessIdea.pricingStrategy ? `Pricing Strategy: ${businessIdea.pricingStrategy}` : ''}
    ${businessIdea.monthlyRevenue ? `Current Monthly Revenue: $${businessIdea.monthlyRevenue}` : ''}
    ${businessIdea.burnRate ? `Monthly Burn Rate: $${businessIdea.burnRate}` : ''}
    ${businessIdea.breakEven ? `Break-Even Timeline: ${businessIdea.breakEven}` : ''}
    
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
  };
}

// Generate all sections in parallel using Promise.allSettled with caching
async function generateBusinessPlanSectionsParallel(
  supabase: any,
  apiKey: string,
  businessIdea: BusinessIdeaInput,
  useCache: boolean
): Promise<{ sections: BusinessPlanSections; metrics: GenerationMetrics }> {
  const prompts = buildSectionPrompts(businessIdea);
  const sectionNames = Object.keys(prompts) as (keyof BusinessPlanSections)[];
  
  console.log(`Starting parallel generation of ${sectionNames.length} sections...`);
  const parallelStartTime = Date.now();

  // Execute all section generations in parallel
  const results = await Promise.allSettled(
    sectionNames.map(section => 
      generateSection(supabase, apiKey, section, prompts[section], useCache)
    )
  );

  const parallelEndTime = Date.now();
  console.log(`All parallel requests completed in ${parallelEndTime - parallelStartTime}ms`);

  // Process results and build sections object
  const sections: Partial<BusinessPlanSections> = {};
  const sectionMetrics: Record<string, { latencyMs: number; success: boolean; fromCache: boolean }> = {};
  const errors: string[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  results.forEach((result, index) => {
    const sectionName = sectionNames[index];
    
    if (result.status === 'fulfilled') {
      sections[sectionName] = result.value.content;
      sectionMetrics[sectionName] = {
        latencyMs: result.value.latencyMs,
        success: true,
        fromCache: result.value.fromCache
      };
      if (result.value.fromCache) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    } else {
      console.error(`Failed to generate ${sectionName}:`, result.reason);
      errors.push(`${sectionName}: ${result.reason.message || 'Unknown error'}`);
      sectionMetrics[sectionName] = {
        latencyMs: 0,
        success: false,
        fromCache: false
      };
      cacheMisses++;
      // Provide a fallback message for failed sections
      sections[sectionName] = `[This section could not be generated. Please try regenerating the business plan or contact support if the issue persists.]`;
    }
  });

  // If all sections failed, throw an error
  if (errors.length === sectionNames.length) {
    throw new Error(`All sections failed to generate: ${errors.join('; ')}`);
  }

  // Log summary
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Generation complete: ${successCount}/${sectionNames.length} sections successful`);
  console.log(`Cache performance: ${cacheHits} hits, ${cacheMisses} misses`);
  
  if (errors.length > 0) {
    console.warn(`Some sections failed: ${errors.join('; ')}`);
  }

  return {
    sections: sections as BusinessPlanSections,
    metrics: {
      totalTimeMs: parallelEndTime - parallelStartTime,
      cacheHits,
      cacheMisses,
      sectionMetrics
    }
  };
}
