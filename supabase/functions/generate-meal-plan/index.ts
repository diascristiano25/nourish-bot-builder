import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { findViolations, buildRestrictionGuidance, formatViolations } from "./diet-guard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Modelflare API config (OpenAI-compatible endpoint)
// API key is read from Supabase Edge Function secrets — set it once with:
//   supabase secrets set MODELFLARE_API_KEY=<your-modelflare-api-key>
const MODELFLARE_API_KEY = Deno.env.get('MODELFLARE_API_KEY') || '';
const MODELFLARE_BASE_URL = 'https://modelflare.dev/v1';
// Try models in order — fallback chain based on the models Modelflare lists at /v1/models.
// Gemini first (cheapest); if it is down or removed, fall back to other available providers.
// Keep this list in sync with GET https://modelflare.dev/v1/models.
const GEMINI_MODELS = [
  'gemini-3.8-flash',
  // Sonnet before Haiku: Haiku ignored allergies/restrictions in testing.
  'claude-sonnet-5-5',
  'claude-haiku-5-5',
];
// Claude models reject a non-default temperature (400), so only send it to the others.
const supportsTemperature = (model: string) => !model.startsWith('claude');

// Extract the JSON object from a model reply (tolerates markdown fences / extra text).
function extractJson(content: string): any {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No valid JSON found in response');
  return JSON.parse(match[0]);
}

// Zod schema for strict input validation
const PatientDataSchema = z.object({
  name: z.string()
    .min(1, "Patient name is required")
    .max(100, "Patient name too long")
    .transform(s => s.trim()),
  age: z.number().int().min(0).max(150).nullish(),
  // DB also allows 'prefer_not_to_say' — treat unknown values as null instead of rejecting
  gender: z.preprocess(v => (v === 'male' || v === 'female' || v === 'other') ? v : null, z.enum(['male', 'female', 'other']).nullable()),
  weight: z.number().min(1).max(500).nullish(),
  height: z.number().min(30).max(300).nullish(),
  goal: z.string().nullish().transform(s => s ? s.slice(0, 100) : s),
  activityLevel: z.string().nullish().transform(s => s ? s.slice(0, 50) : s),
  allergies: z.array(z.string().max(100)).max(20).default([]),
  dietaryRestrictions: z.array(z.string().max(100)).max(20).default([]),
  medicalConditions: z.string().nullish().transform(s => s ? s.slice(0, 500) : s),
  targetCalories: z.number().min(500).max(10000).nullish().transform(n => n == null ? n : Math.round(n)),
  additionalNotes: z.string().default("")
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
    // Auth is handled by Supabase verify_jwt — no manual auth guard needed.
    // supabase.functions.invoke() from the frontend sends the user session token automatically.

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

${buildRestrictionGuidance(patientData.allergies, patientData.dietaryRestrictions)}
Café da manhã e lanches devem ter alimentos típicos desses horários (pães ou tapioca, frutas, aveia, cereais, bebidas vegetais ou leite, café/chá, pastas e castanhas quando permitidos). Não coloque arroz nem feijão como refeição de café da manhã ou lanche. Almoço e jantar podem ter arroz, feijão, legumes e proteínas.

Use a Tabela TACO como referência. Retorne APENAS o JSON válido, sem texto adicional.`;

    // === CALL MODELFLARE API (OpenAI-compatible with Gemini) ===
    // Try models in sequence — many proxies require provider prefix (google/).
    // If one fails with model-not-found, fall back to the next.
    console.log('Calling Modelflare API with Gemini model fallback chain...');

    let aiResponse: any = null;
    let mealPlan: any = null;
    let lastError: any = null;
    let lastViolations = '';
    const startedAt = Date.now();
    const TIME_BUDGET_MS = 100_000; // edge functions are killed at ~150s; leave room for one in-flight call

    outer:
    for (const model of GEMINI_MODELS) {
      // Up to 3 attempts per model (bounded by TIME_BUDGET_MS): retries tell the model exactly what it got wrong.
      let feedback = '';
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (Date.now() - startedAt > TIME_BUDGET_MS) break outer;
        console.log(`Trying model: ${model} (attempt ${attempt})`);
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
                { role: 'user', content: userPrompt + feedback }
              ],
              max_tokens: 8192,
              ...(supportsTemperature(model) ? { temperature: 0.7 } : {}),
            }),
          });

          console.log(`Model ${model} response status:`, response.status);

          if (!response.ok) {
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
            break; // other errors (503, 404 model not found...): go to the next model
          }

          const json = await response.json();
          const text = json?.choices?.[0]?.message?.content;
          let parsed: any = null;
          if (text) { try { parsed = extractJson(text); } catch { /* handled below */ } }
          if (!parsed || !Array.isArray(parsed.meals) || parsed.meals.length === 0) {
            console.error(`Model ${model} returned empty/invalid content:`, JSON.stringify(json).slice(0, 500));
            lastError = { status: 200, errorDetail: 'empty or invalid content', model };
            continue; // retry same model once, then next
          }

          // Never trust the model: verify allergies and dietary restrictions ourselves.
          const violations = findViolations(parsed, patientData.allergies, patientData.dietaryRestrictions);
          if (violations.length > 0) {
            lastViolations = formatViolations(violations);
            console.error(`Model ${model} violated restrictions:`, lastViolations);
            lastError = { status: 200, errorDetail: 'restriction violation', model, violations: lastViolations };
            feedback = `\n\nATENÇÃO: sua resposta anterior foi REJEITADA por violar as restrições do paciente: ${lastViolations}. Refaça o cardápio completo sem NENHUM desses alimentos nem equivalentes.`;
            continue;
          }

          aiResponse = json;
          mealPlan = parsed;
          console.log(`AI response received and validated using model: ${model} (attempt ${attempt})`);
          break outer;
        } catch (fetchError) {
          console.error(`Fetch error for model ${model}:`, fetchError);
          lastError = fetchError;
          break; // next model
        }
      }
    }

    if (!aiResponse || !mealPlan) {
      console.error('All models failed. Last error:', lastError);
      if (lastViolations) {
        throw new Error(`Não foi possível gerar um cardápio que respeite todas as restrições deste paciente (${lastViolations}). Revise as restrições cadastradas e tente novamente.`);
      }
      throw new Error(`Todos os modelos de IA falharam. Último erro: ${JSON.stringify(lastError)}`);
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