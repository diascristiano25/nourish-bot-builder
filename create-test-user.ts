import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.log('Configure com: export SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('📝 Criando usuário de teste...');

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'alguem@teste.com',
    password: 'Test@1234',
    email_confirm: true,
    user_metadata: {
      full_name: 'Usuário Teste',
    }
  });

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  console.log('✅ Usuário criado com sucesso!');
  console.log('📧 Email: alguem@teste.com');
  console.log('🔑 Senha: Test@1234');
  console.log('👤 ID:', data.user?.id);
}

createTestUser();
