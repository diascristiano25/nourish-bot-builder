import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schema for input validation
const MealPlanSchema = z.object({
  meals: z.array(z.object({
    name: z.string(),
    time: z.string().optional(),
    items: z.array(z.object({
      food: z.string(),
      portion: z.string(),
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
    })),
    totalCalories: z.number().optional(),
  })),
  totalCalories: z.number().optional(),
  macros: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTH GUARD ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create Supabase client with user's token to verify auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // === INPUT VALIDATION ===
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = MealPlanSchema.safeParse(rawBody.mealPlan);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mealPlan = validationResult.data;
    const daysMultiplier = rawBody.days || 7;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    console.log('Generating grocery list from meal plan...');

    // Build the prompt
    const systemPrompt = `Você é um assistente especializado em criar listas de compras organizadas para cardápios nutricionais.

Sua tarefa é analisar um cardápio diário e gerar uma lista de compras consolidada.

REGRAS IMPORTANTES:
1. Extraia TODOS os ingredientes/alimentos do cardápio
2. Agrupe quantidades duplicadas (ex: se "Arroz integral 100g" aparece 2x, consolide para "Arroz integral: 200g")
3. Multiplique as quantidades pelo número de dias especificado
4. Agrupe os itens por seção de supermercado brasileiro:
   - 🥬 Hortifrúti (frutas, verduras, legumes)
   - 🥩 Açougue (carnes, frangos, peixes frescos)
   - 🧀 Laticínios (leites, queijos, iogurtes)
   - 🥖 Padaria (pães, bolos)
   - 🫘 Mercearia (grãos, cereais, enlatados, temperos, óleos)
   - ❄️ Congelados
   - 🥤 Bebidas
   - 📦 Outros

IMPORTANTE: Retorne APENAS um JSON válido no seguinte formato:
{
  "categories": [
    {
      "name": "Hortifrúti",
      "emoji": "🥬",
      "items": [
        { "name": "Banana", "quantity": "14 unidades" },
        { "name": "Alface", "quantity": "2 maços" }
      ]
    }
  ],
  "totalItems": 25
}

Converta porções em medidas práticas de supermercado (ex: "2 fatias de pão" x 7 dias = "1 pacote de pão de forma").
Seja inteligente ao consolidar - considere embalagens típicas do mercado brasileiro.`;

    const mealPlanText = mealPlan.meals.map(meal => {
      const items = meal.items.map(item => `- ${item.food}: ${item.portion}`).join('\n');
      return `${meal.name}:\n${items}`;
    }).join('\n\n');

    const userPrompt = `Analise este cardápio DIÁRIO e gere uma lista de compras para ${daysMultiplier} dias:

${mealPlanText}

Consolide os ingredientes, multiplique por ${daysMultiplier} dias, e organize por seção do supermercado. Retorne APENAS o JSON.`;

    console.log('Calling AI gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let groceryList;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        groceryList = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse grocery list from AI response');
    }

    console.log('Grocery list generated successfully with', groceryList.totalItems, 'items');

    return new Response(
      JSON.stringify({
        groceryList,
        days: daysMultiplier,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-grocery-list:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate grocery list' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
