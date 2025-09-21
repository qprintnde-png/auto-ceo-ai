import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequirement {
  title: string;
  department: string;
  skills: string[];
  experience_level: string;
  employment_type: string;
  budget_min?: number;
  budget_max?: number;
  description: string;
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

    const { job_requirement } = await req.json();
    const jobReq: JobRequirement = job_requirement;

    // Generate AI-powered candidate recommendations using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI hiring assistant that helps match the best candidates for job requirements. 
            Generate realistic candidate profiles that would be perfect matches for the given job requirement.
            
            For each candidate, provide:
            - Full name
            - Email (realistic but fake)
            - Location
            - Years of experience
            - Key skills (from the job requirements)
            - Brief bio/summary
            - Hourly rate or salary expectation
            - Portfolio/LinkedIn URL (realistic but fake)
            - Match score (0-100%)
            - Why they're a good fit
            
            Return exactly 5 candidates as a JSON array with these fields:
            name, email, location, years_experience, skills, bio, hourly_rate, portfolio_url, linkedin_url, match_score, fit_reason`
          },
          {
            role: 'user',
            content: `Find the best candidates for this job:
            
            Title: ${jobReq.title}
            Department: ${jobReq.department}
            Skills Required: ${jobReq.skills.join(', ')}
            Experience Level: ${jobReq.experience_level}
            Employment Type: ${jobReq.employment_type}
            Budget: ${jobReq.budget_min ? `$${jobReq.budget_min} - $${jobReq.budget_max}` : 'Not specified'}
            Description: ${jobReq.description}
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('Failed to generate candidate recommendations');
    }

    const openaiData = await openaiResponse.json();
    const candidates = JSON.parse(openaiData.choices[0].message.content);

    // Add some additional matching logic
    const enhancedCandidates = candidates.map((candidate: any) => ({
      ...candidate,
      id: crypto.randomUUID(),
      availability: ['Immediate', 'Within 2 weeks', 'Within 1 month'][Math.floor(Math.random() * 3)],
      response_time: `${Math.floor(Math.random() * 24) + 1} hours`,
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      completed_projects: Math.floor(Math.random() * 50) + 5,
      success_rate: (85 + Math.random() * 15).toFixed(0) + '%',
      last_active: ['Online now', '2 hours ago', '1 day ago', 'Last week'][Math.floor(Math.random() * 4)]
    }));

    // Sort by match score
    enhancedCandidates.sort((a: any, b: any) => b.match_score - a.match_score);

    return new Response(
      JSON.stringify({ 
        candidates: enhancedCandidates,
        job_requirement: jobReq,
        generated_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in find-candidates function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});