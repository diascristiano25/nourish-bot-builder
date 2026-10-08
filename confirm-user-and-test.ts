import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunction() {
  console.log('🔐 Fazendo login com usuário de teste...');

  // Tentar login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'alguem@teste.com',
    password: 'Test@1234'
  });

  if (error && error.message.includes('Email not confirmed')) {
    console.log('⚠️ Email não confirmado. Isto é normal para o Supabase.');
    console.log('📝 Vou tentar com auto-confirm...');

    // Refazer signup com auto-confirm
    const { error: signupError } = await supabase.auth.signUp({
      email: 'teste@teste.com',
      password: 'Test@1234',
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: 'Usuário Teste 2',
        }
      }
    });

    if (signupError && !signupError.message.includes('already registered')) {
      console.error('❌ Erro no signup:', signupError.message);
    }
  }

  if (error) {
    console.log('⚠️ Não conseguiu fazer login:', error.message);
    console.log('\n📧 Isso acontece porque o Supabase requer confirmação de email');
    console.log('🛠️ Para resolver, você precisa:');
    console.log('   1. Desabilitar confirmação de email no Supabase Dashboard');
    console.log('   2. Ou usar um service_role key para criar usuários confirmados');
    console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/auth/providers');
    return;
  }

  console.log('✅ Login bem-sucedido!');
  console.log('👤 User ID:', data.user?.id);

  // Testar Edge Function
  console.log('\n🚀 Testando Edge Function...');

  const { data: funcData, error: funcError } = await supabase.functions.invoke('generate-meal-plan', {
    body: {
      patientData: {
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
    }
  });

  if (funcError) {
    console.error('❌ Erro na Edge Function:', funcError.message);
    return;
  }

  console.log('\n✅ Edge Function funcionou!');
  console.log('\n📋 Cardápio gerado:');
  console.log(JSON.stringify(funcData, null, 2));
}

testFunction();
