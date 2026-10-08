import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';

// INSTRUÇÕES:
// 1. Acesse: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/api
// 2. Copie o "service_role" key (secret)
// 3. Execute: export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
// 4. Execute este script: npx tsx create-confirmed-user.ts

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.log('\n📝 Para configurar:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/api');
  console.log('2. Copie o "service_role" key');
  console.log('3. Execute: export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"');
  console.log('4. Execute novamente: npx tsx create-confirmed-user.ts');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createConfirmedUser() {
  console.log('📝 Criando usuário com email confirmado...');

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'teste-confirmado@teste.com',
    password: 'Test@1234',
    email_confirm: true, // ← Importante: confirma o email automaticamente
    user_metadata: {
      full_name: 'Usuário Teste Confirmado',
    }
  });

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  console.log('✅ Usuário criado com email confirmado!');
  console.log('📧 Email: teste-confirmado@teste.com');
  console.log('🔑 Senha: Test@1234');
  console.log('👤 ID:', data.user?.id);
  console.log('\n🎉 Agora você pode fazer login e testar a Edge Function!');
}

createConfirmedUser();
