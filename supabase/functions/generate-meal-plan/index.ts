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
      console.log('Request body keys:', Object.keys(rawBody));
      console.log('Request body sample:', {
        name: rawBody.name,
        hasAge: !!rawBody.age,
        hasWeight: !!rawBody.weight,
        hasTargetCalories: !!rawBody.targetCalories,
        allergiesCount: rawBody.allergies?.length || 0,
        restrictionsCount: rawBody.dietaryRestrictions?.length || 0
      });
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

    console.log('Validated patient data:', {
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      weight: patientData.weight,
      height: patientData.height,
      targetCalories: patientData.targetCalories,
      goal: patientData.goal,
      activityLevel: patientData.activityLevel,
      allergiesCount: patientData.allergies.length,
      restrictionsCount: patientData.dietaryRestrictions.length,
      hasMedicalConditions: !!patientData.medicalConditions,
      hasAdditionalNotes: !!patientData.additionalNotes
    });

    // Sanitize text fields to prevent prompt injection
    patientData.additionalNotes = sanitizeText(patientData.additionalNotes);
    if (patientData.medicalConditions) {
      patientData.medicalConditions = sanitizeText(patientData.medicalConditions);
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

    // Use Anthropic Claude API
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    console.log('Calling Anthropic Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      }),
    });

    console.log('Anthropic response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch {
        errorDetail = errorText;
      }

      console.error('Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorDetail: errorDetail
      });

      if (response.status === 429) {
        console.error('Rate limit hit - check Anthropic usage dashboard');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 401) {
        console.error('Anthropic authentication failed - verify API key');
        return new Response(
          JSON.stringify({ error: 'AI service authentication failed. Please contact support.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Anthropic API failed: ${response.status} - ${JSON.stringify(errorDetail)}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');
    console.log('Anthropic response structure:', {
      hasContent: !!aiResponse.content,
      contentLength: aiResponse.content?.length,
      contentType: aiResponse.content?.[0]?.type,
      hasText: !!aiResponse.content?.[0]?.text,
      textLength: aiResponse.content?.[0]?.text?.length,
      stopReason: aiResponse.stop_reason,
      model: aiResponse.model,
      usage: aiResponse.usage
    });

    // Extract content from Anthropic response format
    const content = aiResponse.content?.[0]?.text;

    if (!content) {
      console.error('Unexpected Anthropic response:', JSON.stringify(aiResponse));
      throw new Error('No content in Anthropic response');
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
    const timestamp = new Date().toISOString();
    console.error('Error in generate-meal-plan:', {
      timestamp,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      errorDetails: error
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
