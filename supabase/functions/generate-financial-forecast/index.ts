import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { historicalData, periods, assumptions, companyInfo } = await req.json();
    
    console.log('Generating financial forecast with AI');

    const systemPrompt = `You are an expert financial analyst specializing in startup and business forecasting. 
Your role is to generate realistic financial projections based on historical data and growth assumptions.`;

    const userPrompt = `Generate a detailed ${periods}-month financial forecast based on the following:

HISTORICAL DATA:
${JSON.stringify(historicalData, null, 2)}

GROWTH ASSUMPTIONS:
- Revenue Growth: ${assumptions.revenueGrowth}% per month
- Expense Growth: ${assumptions.expenseGrowth}% per month
- Customer Growth: ${assumptions.customerGrowth}% per month

COMPANY CONTEXT:
${JSON.stringify(companyInfo, null, 2)}

Provide:
1. Month-by-month projections for the next ${periods} months
2. Key insights about the forecast
3. Risk factors to consider
4. Recommendations for financial health

Return the response in this exact JSON structure:
{
  "projections": [
    {
      "period": 1,
      "revenue": number,
      "expenses": number,
      "gross_profit": number,
      "net_profit": number,
      "cash_flow": number,
      "monthly_recurring_revenue": number,
      "burn_rate": number,
      "runway_months": number
    }
  ],
  "insights": [
    {
      "type": "growth|profitability|warning|opportunity",
      "title": "string",
      "value": "string",
      "description": "string",
      "positive": boolean
    }
  ],
  "risks": ["string"],
  "recommendations": ["string"]
}`;

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
        max_completion_tokens: 16000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const forecast = JSON.parse(data.choices[0].message.content);

    console.log('Forecast generated successfully');

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-financial-forecast function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
