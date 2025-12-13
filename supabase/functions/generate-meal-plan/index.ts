import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schema for strict input validation
const PatientDataSchema = z.object({
  name: z.string()
    .min(1, "Patient name is required")
    .max(100, "Patient name too long")
    .transform(s => s.trim()),
  age: z.number().int().min(0).max(150).nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  weight: z.number().min(1).max(500).nullable(),
  height: z.number().min(30).max(300).nullable(),
  goal: z.string().max(100).nullable(),
  activityLevel: z.string().max(50).nullable(),
  allergies: z.array(z.string().max(100)).max(20).default([]),
  dietaryRestrictions: z.array(z.string().max(100)).max(20).default([]),
  medicalConditions: z.string().max(500).nullable(),
  targetCalories: z.number().int().min(500).max(10000).nullable(),
  additionalNotes: z.string().max(1000).default("")
    .transform(s => s.trim()),
});

// Sanitize text to prevent prompt injection
function sanitizeText(text: string): string {
  if (!text) return "";
  // Remove potential command overrides and excessive repetition
  return text
    .replace(/\b(ignore|forget|disregard|override|system|assistant|user)[\s:]+/gi, "")
    .replace(/(.)\1{10,}/g, "$1$1$1") // Limit repeated chars
    .slice(0, 1000);
}

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

    const validationResult = PatientDataSchema.safeParse(rawBody.patientData);
    
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

    const patientData = validationResult.data;

    // Sanitize text fields to prevent prompt injection
    patientData.additionalNotes = sanitizeText(patientData.additionalNotes);
    if (patientData.medicalConditions) {
      patientData.medicalConditions = sanitizeText(patientData.medicalConditions);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    console.log('Generating meal plan for patient:', patientData.name);

    // Build the prompt with TACO table reference
    const systemPrompt = `Você é um nutricionista especializado em criar cardápios alimentares personalizados.

IMPORTANTE: Você deve usar a Tabela Brasileira de Composição de Alimentos (TACO) como referência para todos os valores nutricionais. A Tabela TACO é a principal referência de composição nutricional de alimentos consumidos no Brasil.

Ao criar o cardápio:
1. Use alimentos comuns na dieta brasileira
2. Os valores de calorias, proteínas, carboidratos e gorduras devem ser baseados na Tabela TACO
3. As porções devem ser em medidas caseiras (colher de sopa, xícara, unidade, fatia, etc.)
4. Considere as restrições alimentares e alergias do paciente
5. Adapte o cardápio ao objetivo nutricional do paciente

Você DEVE retornar APENAS um objeto JSON válido, sem nenhum texto adicional, no seguinte formato exato:
{
  "meals": [
    {
      "name": "Café da Manhã",
      "time": "07:00",
      "items": [
        {
          "food": "Nome do alimento",
          "portion": "Porção em medida caseira",
          "calories": 150,
          "protein": 8,
          "carbs": 20,
          "fat": 5
        }
      ],
      "totalCalories": 350
    }
  ],
  "totalCalories": 2000,
  "macros": {
    "protein": 120,
    "carbs": 250,
    "fat": 65
  },
  "notes": "Observações gerais sobre o cardápio"
}

As refeições devem incluir: Café da Manhã, Lanche da Manhã, Almoço, Lanche da Tarde, Jantar, e opcionalmente Ceia.`;

    const userPrompt = `Crie um cardápio alimentar diário personalizado para o seguinte paciente:

DADOS DO PACIENTE:
- Nome: ${patientData.name}
${patientData.age ? `- Idade: ${patientData.age} anos` : ''}
${patientData.gender ? `- Sexo: ${patientData.gender === 'male' ? 'Masculino' : patientData.gender === 'female' ? 'Feminino' : 'Outro'}` : ''}
${patientData.weight ? `- Peso: ${patientData.weight} kg` : ''}
${patientData.height ? `- Altura: ${patientData.height} cm` : ''}
${patientData.goal ? `- Objetivo: ${patientData.goal}` : ''}
${patientData.activityLevel ? `- Nível de Atividade: ${patientData.activityLevel}` : ''}
${patientData.targetCalories ? `- Meta de Calorias: ${patientData.targetCalories} kcal/dia` : ''}

${patientData.allergies.length > 0 ? `ALERGIAS (EVITAR COMPLETAMENTE): ${patientData.allergies.join(', ')}` : ''}
${patientData.dietaryRestrictions.length > 0 ? `RESTRIÇÕES ALIMENTARES: ${patientData.dietaryRestrictions.join(', ')}` : ''}
${patientData.medicalConditions ? `CONDIÇÕES MÉDICAS: ${patientData.medicalConditions}` : ''}
${patientData.additionalNotes ? `INSTRUÇÕES ADICIONAIS: ${patientData.additionalNotes}` : ''}

Use a Tabela TACO como referência para os valores nutricionais. Retorne APENAS o JSON, sem texto adicional.`;

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
    let mealPlan;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse meal plan from AI response');
    }

    console.log('Meal plan generated successfully');

    return new Response(
      JSON.stringify({
        mealPlan,
        totalCalories: mealPlan.totalCalories || patientData.targetCalories,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-meal-plan:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate meal plan' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
