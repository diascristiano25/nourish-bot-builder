import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const RecipeInputSchema = z.object({
  ingredients: z.string().max(1000, 'Ingredientes muito longos').nullable().optional()
    .transform(val => val ? sanitizeText(val) : null),
  servings: z.union([z.string(), z.number()]).nullable().optional()
    .transform(val => {
      if (val === null || val === undefined) return null;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num < 1 || num > 50) return null;
      return num;
    }),
  dietary_restrictions: z.string().max(500, 'Restrições muito longas').nullable().optional()
    .transform(val => val ? sanitizeText(val) : null),
  goal: z.string().max(200, 'Objetivo muito longo').nullable().optional()
    .transform(val => val ? sanitizeText(val) : null),
  notes: z.string().max(1000, 'Notas muito longas').nullable().optional()
    .transform(val => val ? sanitizeText(val) : null),
});

// Sanitize text to prevent prompt injection
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    // Remove potential prompt injection patterns
    .replace(/\b(ignore|forget|disregard|override|system|assistant|user|prompt)\s+(all|previous|above|instructions|everything)/gi, "")
    .replace(/```/g, "") // Remove code blocks
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .trim()
    .slice(0, 1000); // Hard limit
}

serve(async (req) => {
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
    // === END AUTH GUARD ===

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = RecipeInputSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validationResult.error.errors.map(e => e.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ingredients, servings, dietary_restrictions, goal, notes } = validationResult.data;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating recipe with validated params:', { 
      ingredients: ingredients?.slice(0, 50), // Log truncated for safety
      servings, 
      dietary_restrictions: dietary_restrictions?.slice(0, 50), 
      goal: goal?.slice(0, 50), 
      notes: notes?.slice(0, 50) 
    });

    const systemPrompt = `Você é um nutricionista especialista em criar receitas saudáveis e nutritivas.
Você deve criar receitas detalhadas com base nas informações fornecidas pelo usuário.
SEMPRE responda em português brasileiro.
SEMPRE use a Tabela TACO (Tabela Brasileira de Composição de Alimentos) como referência para os valores nutricionais.

Você DEVE responder APENAS com um JSON válido no seguinte formato, sem markdown ou texto adicional:
{
  "name": "Nome da Receita",
  "ingredients": ["ingrediente 1 - quantidade", "ingrediente 2 - quantidade"],
  "instructions": "Modo de preparo detalhado passo a passo",
  "servings": "número de porções",
  "prep_time": "tempo de preparo",
  "macros": {
    "kcal": número,
    "protein": número em gramas,
    "carb": número em gramas,
    "fat": número em gramas
  },
  "tips": "Dicas nutricionais ou variações"
}`;

    const userPrompt = `Crie uma receita saudável com as seguintes especificações:

${ingredients ? `Ingredientes principais: ${ingredients}` : ''}
${servings ? `Número de porções: ${servings}` : ''}
${dietary_restrictions ? `Restrições alimentares: ${dietary_restrictions}` : ''}
${goal ? `Objetivo nutricional: ${goal}` : ''}
${notes ? `Observações adicionais: ${notes}` : ''}

Crie uma receita nutritiva, saborosa e prática. Os valores de macros devem ser POR PORÇÃO.`;

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
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI Response received, parsing...');

    // Parse the JSON response
    let recipe;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipe = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Falha ao processar resposta da IA');
    }

    return new Response(
      JSON.stringify({ recipe }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar receita';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
