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

    const { candidate, job_requirement, message_type = 'outreach' } = await req.json();

    // Generate personalized outreach message using OpenAI
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
            content: `You are an expert recruiter writing personalized outreach messages to candidates. 
            Create professional, engaging messages that:
            - Address the candidate by name
            - Reference their specific skills and experience
            - Explain why they're a great fit for the role
            - Include key details about the opportunity
            - Have a clear call to action
            - Maintain a professional but friendly tone
            
            Message types:
            - outreach: Initial contact message
            - interview_invite: Invitation to interview
            - offer: Job offer message
            - follow_up: Follow-up message
            
            Return JSON with "subject" and "body" fields.`
          },
          {
            role: 'user',
            content: `Write a ${message_type} message for:
            
            Candidate: ${candidate.name}
            Email: ${candidate.email}
            Skills: ${candidate.skills?.join(', ')}
            Experience: ${candidate.years_experience} years
            Match Score: ${candidate.match_score}%
            Bio: ${candidate.bio}
            
            Job: ${job_requirement.title}
            Department: ${job_requirement.department}
            Skills Required: ${job_requirement.skills?.join(', ')}
            Employment Type: ${job_requirement.employment_type}
            Description: ${job_requirement.description}
            ${job_requirement.budget_min ? `Budget: $${job_requirement.budget_min} - $${job_requirement.budget_max}` : ''}
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('Failed to generate outreach message');
    }

    const openaiData = await openaiResponse.json();
    const messageContent = JSON.parse(openaiData.choices[0].message.content);

    return new Response(
      JSON.stringify({
        subject: messageContent.subject,
        body: messageContent.body,
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        message_type,
        generated_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-outreach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});