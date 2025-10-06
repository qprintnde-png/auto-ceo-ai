import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    const { company_id, investor_id, tone = 'professional' } = await req.json();

    // Get company and business plan details
    const { data: company } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .eq('owner_id', user.user.id)
      .single();

    const { data: investor } = await supabaseClient
      .from('investors')
      .select('*')
      .eq('id', investor_id)
      .single();

    const { data: businessPlan } = await supabaseClient
      .from('business_plans')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (!company || !investor) {
      throw new Error('Company or investor not found');
    }

    // Generate pitch email using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert at writing compelling investor pitch emails. Generate a personalized email that:
            - Has a compelling subject line
            - Opens with a personalized hook based on the investor's focus
            - Clearly presents the business opportunity
            - Highlights key metrics and traction
            - Includes a clear call to action
            - Maintains a ${tone} tone
            - Is concise but compelling (under 300 words)
            
            Format the response as JSON with "subject" and "body" fields.`
          },
          {
            role: 'user',
            content: `Write a pitch email for:
            
            Company: ${company.name}
            Industry: ${company.industry}
            Stage: ${company.stage}
            Description: ${company.description}
            Funding Goal: $${company.funding_goal?.toLocaleString()}
            Location: ${company.location}
            
            Investor: ${investor.name}
            Firm: ${investor.firm_name || 'Independent'}
            Type: ${investor.investor_type}
            Industry Focus: ${investor.industry_focus?.join(', ')}
            Investment Stage: ${investor.investment_stage?.join(', ')}
            Investment Criteria: ${investor.investment_criteria}
            
            Founder: ${profile?.first_name} ${profile?.last_name}
            
            ${businessPlan ? `Executive Summary: ${businessPlan.executive_summary?.substring(0, 500)}...` : ''}
            `
          }
        ],
        max_completion_tokens: 800,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`Failed to generate pitch email: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const emailContent = JSON.parse(openaiData.choices[0].message.content);

    return new Response(
      JSON.stringify({
        subject: emailContent.subject,
        body: emailContent.body,
        investor_name: investor.name,
        investor_email: investor.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-pitch-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});