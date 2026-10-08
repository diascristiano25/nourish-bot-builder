import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunction() {
  console.log('🔐 Fazendo login...');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'alguem@teste.com',
    password: 'Test@1234'
  });

  if (authError) {
    console.error('❌ Erro no login:', authError.message);
    return;
  }

  console.log('✅ Login bem-sucedido!');
  const token = authData.session?.access_token;

  console.log('\n🚀 Chamando Edge Function diretamente...');

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-meal-plan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: "Beth Lawrence",
      age: 30,
      gender: "female",
      weight: 70,
      height: 170,
      goal: "Manutenção",
      activityLevel: "Moderado",
      allergies: [],
      dietaryRestrictions: [],
      medicalConditions: null,
      targetCalories: 2000,
      additionalNotes: "fazendo uso de 2,5mg de tirzepatida"
    })
  });

  console.log('\n📊 Status:', response.status, response.statusText);
  console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

  const text = await response.text();
  console.log('\n📄 Response body:');
  console.log(text);

  try {
    const json = JSON.parse(text);
    console.log('\n📦 Parsed JSON:');
    console.log(JSON.stringify(json, null, 2));
  } catch {
    console.log('⚠️  Response is not JSON');
  }
}

testEdgeFunction();
