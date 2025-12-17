import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, servings, dietary_restrictions, goal, notes } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating recipe with params:', { ingredients, servings, dietary_restrictions, goal, notes });

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
    
    console.log('AI Response:', content);

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
