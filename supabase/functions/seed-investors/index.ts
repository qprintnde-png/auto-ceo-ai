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

    const sampleInvestors = [
      {
        name: "Sarah Chen",
        firm_name: "TechVentures Capital",
        investor_type: "VC",
        industry_focus: ["SaaS", "AI/ML", "FinTech"],
        investment_stage: ["Seed", "Series A"],
        geographic_focus: ["North America", "Europe"],
        min_investment: 500000,
        max_investment: 5000000,
        email: "sarah.chen@techventures.com",
        linkedin_url: "https://linkedin.com/in/sarahchen",
        bio: "15+ years in venture capital, focused on early-stage B2B SaaS companies. Former COO at leading enterprise software company.",
        investment_criteria: "Looking for B2B SaaS companies with strong product-market fit, recurring revenue, and clear path to $10M+ ARR.",
        portfolio_size: 25,
        notable_investments: ["CloudSync", "DataFlow", "AI Insights"],
        is_active: true,
        is_verified: true
      },
      {
        name: "Michael Rodriguez",
        firm_name: "GreenTech Partners",
        investor_type: "VC",
        industry_focus: ["CleanTech", "Sustainability", "Energy"],
        investment_stage: ["Series A", "Series B"],
        geographic_focus: ["Global"],
        min_investment: 2000000,
        max_investment: 15000000,
        email: "m.rodriguez@greentechpartners.com",
        linkedin_url: "https://linkedin.com/in/mrodriguez",
        bio: "Impact investor specializing in sustainable technology and clean energy solutions.",
        investment_criteria: "Climate tech companies with measurable environmental impact and strong unit economics.",
        portfolio_size: 18,
        notable_investments: ["SolarNext", "EcoFlow", "GreenGrid"],
        is_active: true,
        is_verified: true
      },
      {
        name: "Jennifer Park",
        firm_name: null,
        investor_type: "Angel",
        industry_focus: ["HealthTech", "EdTech", "Consumer"],
        investment_stage: ["Pre-Seed", "Seed"],
        geographic_focus: ["North America"],
        min_investment: 50000,
        max_investment: 250000,
        email: "jennifer.park@gmail.com",
        linkedin_url: "https://linkedin.com/in/jenniferpark",
        bio: "Serial entrepreneur and angel investor. Exited two startups. Passionate about health and education tech.",
        investment_criteria: "Pre-seed companies with strong founding teams and innovative solutions in health or education.",
        portfolio_size: 12,
        notable_investments: ["HealthHub", "LearnFast", "WellnessAI"],
        is_active: true,
        is_verified: true
      },
      {
        name: "David Thompson",
        firm_name: "Frontier Ventures",
        investor_type: "VC",
        industry_focus: ["Enterprise", "Infrastructure", "DevTools"],
        investment_stage: ["Series A", "Series B", "Growth"],
        geographic_focus: ["North America", "Europe", "Asia"],
        min_investment: 5000000,
        max_investment: 25000000,
        email: "david@frontiervc.com",
        linkedin_url: "https://linkedin.com/in/davidthompson",
        bio: "Former CTO turned investor. Deep expertise in enterprise infrastructure and developer tools.",
        investment_criteria: "Developer-first companies with strong open-source communities or infrastructure plays with clear ROI.",
        portfolio_size: 32,
        notable_investments: ["CloudOps", "DevStack", "APIHub"],
        is_active: true,
        is_verified: true
      },
      {
        name: "Aisha Patel",
        firm_name: "Catalyst Fund",
        investor_type: "VC",
        industry_focus: ["FinTech", "Blockchain", "Payments"],
        investment_stage: ["Seed", "Series A"],
        geographic_focus: ["Global"],
        min_investment: 1000000,
        max_investment: 8000000,
        email: "aisha@catalystfund.io",
        linkedin_url: "https://linkedin.com/in/aishapatel",
        bio: "Fintech expert with background in traditional finance and blockchain. Focused on financial inclusion.",
        investment_criteria: "Fintech companies leveraging technology to improve financial access and reduce friction in payments.",
        portfolio_size: 22,
        notable_investments: ["PayGlobal", "ChainFinance", "CryptoWallet"],
        is_active: true,
        is_verified: true
      },
      {
        name: "Robert Chang",
        firm_name: "Innovation Capital",
        investor_type: "VC",
        industry_focus: ["AI/ML", "Robotics", "DeepTech"],
        investment_stage: ["Series A", "Series B"],
        geographic_focus: ["North America", "Asia"],
        min_investment: 3000000,
        max_investment: 20000000,
        email: "robert.chang@innovationcap.com",
        linkedin_url: "https://linkedin.com/in/robertchang",
        bio: "PhD in Computer Science. Investing in cutting-edge AI and robotics companies.",
        investment_criteria: "Deep tech companies with proprietary technology and strong IP in AI, robotics, or automation.",
        portfolio_size: 15,
        notable_investments: ["RoboTech", "NeuralNet", "AutoDrive"],
        is_active: true,
        is_verified: true
      }
    ];

    const { data, error } = await supabaseClient
      .from('investors')
      .upsert(sampleInvestors, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error seeding investors:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        message: `Successfully seeded ${data.length} investors` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in seed-investors function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
