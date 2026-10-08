import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signupTestUser() {
  console.log('📝 Fazendo signup de usuário de teste...');

  const { data, error } = await supabase.auth.signUp({
    email: 'alguem@teste.com',
    password: 'Test@1234',
    options: {
      data: {
        full_name: 'Usuário Teste',
      }
    }
  });

  if (error) {
    console.error('❌ Erro:', error.message);

    // Se o erro for de email já existente, tenta fazer login
    if (error.message.includes('already registered')) {
      console.log('\n🔄 Email já existe, tentando fazer login...');

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'alguem@teste.com',
        password: 'Test@1234'
      });

      if (loginError) {
        console.error('❌ Erro no login:', loginError.message);
        return;
      }

      console.log('✅ Login bem-sucedido!');
      console.log('👤 User ID:', loginData.user?.id);
      console.log('🎟️ Token:', loginData.session?.access_token);
      return;
    }

    return;
  }

  console.log('✅ Usuário criado com sucesso!');
  console.log('📧 Email: alguem@teste.com');
  console.log('🔑 Senha: Test@1234');
  console.log('👤 ID:', data.user?.id);

  if (data.session) {
    console.log('🎟️ Token:', data.session.access_token);
  } else {
    console.log('⚠️ Precisa confirmar email antes de fazer login');
  }
}

signupTestUser();
