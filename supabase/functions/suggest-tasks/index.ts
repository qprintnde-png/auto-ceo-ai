import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { companyId, businessPlanId, context } = await req.json();

    let companyInfo = '';
    let businessPlanInfo = '';

    // Fetch company details
    const { data: company } = await supabase
      .from('companies')
      .select('name, industry, stage, description')
      .eq('id', companyId)
      .single();

    if (company) {
      companyInfo = `Company: ${company.name}\nIndustry: ${company.industry}\nStage: ${company.stage}\nDescription: ${company.description || 'N/A'}`;
    }

    // Fetch business plan if provided
    if (businessPlanId) {
      const { data: businessPlan } = await supabase
        .from('business_plans')
        .select('title, description, executive_summary')
        .eq('id', businessPlanId)
        .single();

      if (businessPlan) {
        businessPlanInfo = `Business Plan: ${businessPlan.title}\nDescription: ${businessPlan.description}`;
      }
    }

    const systemPrompt = `You are an expert project manager and business consultant. Based on the provided company and business plan information, suggest actionable tasks that will help the company achieve its goals. Consider the company's stage, industry, and objectives.`;

    const userPrompt = `${companyInfo}

${businessPlanInfo}

${context ? `Additional context: ${context}` : ''}

Suggest 5 actionable tasks that this company should prioritize. For each task, provide a title, appropriate priority level (low, medium, high, urgent), and a relevant category.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tasks",
              description: "Return 5 actionable task suggestions.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                        category: { type: "string" }
                      },
                      required: ["title", "description", "priority", "category"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function.arguments) {
      throw new Error('No task suggestions generated');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error suggesting tasks:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to suggest tasks'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
