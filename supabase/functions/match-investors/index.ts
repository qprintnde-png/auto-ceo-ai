import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Company {
  id: string;
  name: string;
  industry: string;
  stage: string;
  funding_goal: number;
  location: string;
  description: string;
}

interface Investor {
  id: string;
  name: string;
  firm_name: string;
  investor_type: string;
  industry_focus: string[];
  investment_stage: string[];
  geographic_focus: string[];
  min_investment: number;
  max_investment: number;
  investment_criteria: string;
}

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

    const { company_id } = await req.json();

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .eq('owner_id', user.user.id)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found or unauthorized');
    }

    // Get all active investors
    const { data: investors, error: investorsError } = await supabaseClient
      .from('investors')
      .select('*')
      .eq('is_active', true);

    if (investorsError) {
      throw new Error('Failed to fetch investors');
    }

    // Calculate match scores
    const matches = investors.map((investor: Investor) => {
      let score = 0;
      const reasons = [];

      // Industry match (30% weight)
      if (investor.industry_focus?.includes(company.industry)) {
        score += 30;
        reasons.push(`Invests in ${company.industry}`);
      }

      // Stage match (25% weight)
      if (investor.investment_stage?.includes(company.stage)) {
        score += 25;
        reasons.push(`Invests in ${company.stage} stage`);
      }

      // Geographic match (15% weight)
      if (investor.geographic_focus?.some(geo => 
        company.location?.toLowerCase().includes(geo.toLowerCase())
      )) {
        score += 15;
        reasons.push('Geographic alignment');
      }

      // Investment amount match (20% weight)
      if (company.funding_goal >= investor.min_investment && 
          company.funding_goal <= investor.max_investment) {
        score += 20;
        reasons.push('Investment amount fits criteria');
      }

      // Keyword matching in criteria and description (10% weight)
      const keywords = company.description?.toLowerCase().split(' ') || [];
      const criteriaText = investor.investment_criteria?.toLowerCase() || '';
      const keywordMatches = keywords.filter(keyword => 
        keyword.length > 3 && criteriaText.includes(keyword)
      ).length;
      
      if (keywordMatches > 0) {
        score += Math.min(10, keywordMatches * 2);
        reasons.push('Keywords match investment criteria');
      }

      return {
        investor,
        match_score: Math.round(score),
        reasons
      };
    })
    .filter(match => match.match_score > 20) // Only return matches with score > 20
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20); // Top 20 matches

    // Store matches in database
    for (const match of matches) {
      const { error: insertError } = await supabaseClient
        .from('investor_matches')
        .upsert({
          company_id: company.id,
          investor_id: match.investor.id,
          match_score: match.match_score,
          status: 'potential'
        }, {
          onConflict: 'company_id,investor_id'
        });

      if (insertError) {
        console.error('Error storing match:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ matches }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in match-investors function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});