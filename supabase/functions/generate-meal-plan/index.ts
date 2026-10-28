import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Modelflare API config (OpenAI-compatible endpoint)
// API key is read from Supabase Edge Function secrets — set it once with:
//   supabase secrets set MODELFLARE_API_KEY=sk-yvhM5XiFjVUBWWumcIHiKZpT10ZUUCj46BTgVk9iqbQ8c6O3
const MODELFLARE_API_KEY = Deno.env.get('MODELFLARE_API_KEY') || '';
const MODELFLARE_BASE_URL = 'https://modelflare.dev/v1';
// Try models in order — many OpenAI-compatible proxies require the provider prefix (google/).
// If the first fails with a model-not-found error, we fall back to the next.
const GEMINI_MODELS = [
  'google/gemini-2.0-flash',
  'gemini-2.0-flash',
  'google/gemini-1.5-flash',
  'gemini-1.5-flash',
];

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
  return text
    .replace(/\b(ignore|forget|disregard|override|system|assistant|user)[\s:]+/gi, "")
    .replace(/(.)\1{10,}/g, "$1$1$1")
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
      console.log('Request body keys:', Object.keys(rawBody));
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = PatientDataSchema.safeParse(rawBody);

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

    // Sanitize text fields
    patientData.additionalNotes = sanitizeText(patientData.additionalNotes);
    if (patientData.medicalConditions) {
      patientData.medicalConditions = sanitizeText(patientData.medicalConditions);
    }

    console.log('Generating meal plan for patient:', patientData.name);

    // Build the prompt
    const systemPrompt = `Você é um nutricionista especializado em criar cardápios alimentares personalizados para pacientes brasileiros.

REGRAS OBRIGATÓRIAS:
1. Use alimentos comuns na dieta brasileira
2. Valores nutricionais baseados na Tabela TACO (Tabela Brasileira de Composição de Alimentos)
3. Porções em medidas caseiras (colher de sopa, xícara, unidade, fatia, etc.)
4. Respeite TODAS as restrições alimentares e alergias
5. Adapte ao objetivo nutricional do paciente

FORMATO DE RESPOSTA: Retorne APENAS um objeto JSON válido, sem nenhum texto adicional, markdown ou explicação. Formato exato:
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

Use a Tabela TACO como referência. Retorne APENAS o JSON válido, sem texto adicional.`;

    // === CALL MODELFLARE API (OpenAI-compatible with Gemini) ===
    // Try models in sequence — many proxies require provider prefix (google/).
    // If one fails with model-not-found, fall back to the next.
    console.log('Calling Modelflare API with Gemini model fallback chain...');

    let aiResponse: any = null;
    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      console.log(`Trying model: ${model}`);
      try {
        const response = await fetch(`${MODELFLARE_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MODELFLARE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        console.log(`Model ${model} response status:`, response.status);

        if (response.ok) {
          aiResponse = await response.json();
          console.log(`AI response received using model: ${model}`);
          break; // Success — exit the loop
        }

        const errorText = await response.text();
        let errorDetail;
        try { errorDetail = JSON.parse(errorText); } catch { errorDetail = errorText; }

        console.error(`Model ${model} failed:`, { status: response.status, errorDetail });
        lastError = { status: response.status, errorDetail };

        // 429 = rate limit — stop trying, return immediately
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Limite de requisições atingido. Aguarde alguns minutos e tente novamente.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 401 = auth error — stop trying, return immediately
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: 'Erro de autenticação com o serviço de IA. Verifique a chave API.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // For other errors (e.g. 404 model not found), try the next model
      } catch (fetchError) {
        console.error(`Fetch error for model ${model}:`, fetchError);
        lastError = fetchError;
        // Continue to next model
      }
    }

    if (!aiResponse) {
      console.error('All models failed. Last error:', lastError);
      throw new Error(`Todos os modelos de IA falharam. Último erro: ${JSON.stringify(lastError)}`);
    }

    // Extract content from OpenAI-compatible response format
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error('Unexpected Modelflare response:', JSON.stringify(aiResponse));
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let mealPlan;
    try {
      // Try to extract JSON from the response (in case there's extra text/markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.slice(0, 500));
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
    const timestamp = new Date().toISOString();
    console.error('Error in generate-meal-plan:', {
      timestamp,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate meal plan',
        timestamp
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});