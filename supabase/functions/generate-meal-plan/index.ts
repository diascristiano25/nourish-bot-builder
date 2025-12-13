import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatientData {
  name: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  activityLevel: string | null;
  allergies: string[];
  dietaryRestrictions: string[];
  medicalConditions: string | null;
  targetCalories: number | null;
  additionalNotes: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientData } = await req.json() as { patientData: PatientData };
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
