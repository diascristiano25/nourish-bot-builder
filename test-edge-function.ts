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
  console.log('👤 User ID:', authData.user?.id);

  console.log('\n🚀 Testando Edge Function generate-meal-plan...');

  const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
    body: {
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
    }
  });

  if (error) {
    console.error('\n❌ Erro na Edge Function:', error);
    console.log('\n📝 Detalhes do erro:', JSON.stringify(error, null, 2));
    return;
  }

  console.log('\n✅ Edge Function executada com sucesso!');
  console.log('\n📋 Resposta:');
  console.log(JSON.stringify(data, null, 2));

  // Salvar em arquivo para visualização
  const fs = await import('fs');
  fs.writeFileSync('meal-plan-response.json', JSON.stringify(data, null, 2));
  console.log('\n💾 Resposta salva em: meal-plan-response.json');
}

testEdgeFunction();
