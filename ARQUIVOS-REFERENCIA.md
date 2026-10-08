# ARQUIVOS DE REFERÊNCIA - SISTEMA DE ACESSO DO PACIENTE

## 📁 Estrutura de Arquivos Críticos

### Raiz da Aplicação
```
/c/Claudin/Nutriflow/
├── src/
│   ├── App.tsx                          ← ARQUIVO PRINCIPAL CORRIGIDO
│   ├── pages/
│   │   ├── PatientPortal.tsx            ← Portal do paciente (subdomínio)
│   │   ├── PublicPatientPortal.tsx      ← Portal público
│   │   ├── PatientAuth.tsx              ← Login do paciente
│   │   ├── PatientMobileApp.tsx         ← App mobile principal
│   │   └── ...
│   ├── components/
│   │   └── patient-mobile/
│   │       ├── PatientChat.tsx          ← Chat com nutricionista
│   │       ├── PatientDashboard.tsx     ← Tela inicial
│   │       ├── PatientPlano.tsx         ← Visualização de cardápios
│   │       ├── PatientEvolucao.tsx      ← Gráfico de peso
│   │       ├── PatientRegistro.tsx      ← Registro de refeições
│   │       ├── PatientPerfil.tsx        ← Perfil e configurações
│   │       ├── PatientBottomNav.tsx     ← Navegação inferior
│   │       └── ...
│   ├── hooks/
│   │   └── useAuth.tsx                  ← Context de autenticação
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts                ← Cliente Supabase
│   └── ...
│
├── supabase/
│   └── functions/
│       ├── send-patient-magic-link/
│       │   └── index.ts                 ← Edge Function para magic link
│       ├── public-patient-portal/
│       │   └── index.ts                 ← Função para carregar portal
│       ├── generate-grocery-list/
│       │   └── index.ts                 ← Geração de lista
│       └── ...
│
├── dist/                                ← Build compilado (saída)
│   └── assets/
│       ├── PatientPortal-*.js
│       ├── PatientAuth-*.js
│       ├── PatientMobileApp-*.js
│       └── ...
│
├── PATIENT-ACCESS-SYSTEM-REPORT.md      ← Relatório técnico
├── PATIENT-ACCESS-TESTING-GUIDE.md      ← Guia de testes
├── VALIDACAO-FINAL-PACIENTE.txt         ← Sumário executivo
└── ARQUIVOS-REFERENCIA.md               ← Este arquivo
```

---

## 🔄 Fluxo de Rotas

### App.tsx - Roteamento Principal (CORRIGIDO)

```typescript
// Linhas 68-91: Subdomínio paciente.nutriflow.inf.br
{patientDomain ? (
  <>
    <Route path="/" element={<PatientMobileApp />} />
    <Route path="/meu-app" element={<PatientMobileApp />} />         ✅ ADICIONADO
    <Route path="/patient-auth" element={<PatientAuth />} />         ✅ ADICIONADO
    <Route path="/portal/:patientId" element={<PatientPortal />} />
    <Route path="*" element={<PatientMobileApp />} />
  </>
) : (
  // ...
)}

// Linhas 25: Domínio principal
<Route path="/meu-app" element={<PatientMobileApp />} />             ✅ ADICIONADO
```

---

## 📊 Fluxo de Dados

### 1. Magic Link - send-patient-magic-link Edge Function

**Entrada:**
```json
{
  "patientEmail": "paciente@email.com",
  "patientId": "uuid-xxx",
  "redirectUrl": "https://nutriflow.com.br/meu-app"
}
```

**Processo:**
```
1. Valida token Bearer (nutricionista)
2. Busca paciente no banco
3. Verifica propriedade (nutritionist_id)
4. Se não tem user: cria usuário via admin API
5. Vincula user_id ao paciente
6. Envia magic link via signInWithOtp ou resetPasswordForEmail
```

**Saída (Sucesso):**
```json
{
  "success": true,
  "message": "Link de acesso enviado com sucesso!",
  "userCreated": true,
  "userLinked": true,
  "emailSent": true
}
```

### 2. Autenticação do Paciente

**PatientAuth.tsx Flow:**
```
Paciente clica em link do email
        ↓
Supabase autentica automaticamente
        ↓
onAuthStateChange dispara
        ↓
checkUserTypeAndRedirect() executa
        ↓
Busca paciente por user_id
        ↓
Encontrou? → Redireciona para /meu-app
Não encontrou? → Tela de primeiro acesso
```

### 3. Primeiro Acesso (handleFirstAccess)

```
Paciente cria senha
        ↓
Validação (password === confirmPassword)
        ↓
signUp() do Supabase
        ↓
Update patients.user_id
        ↓
Redireciona para /meu-app
```

---

## 💾 Tabelas de Banco de Dados

### patients
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES auth.users
email       text
full_name   text
phone       text
goal        text
nutritionist_id uuid REFERENCES profiles
```

### meal_plans
```sql
id          uuid PRIMARY KEY
patient_id  uuid REFERENCES patients
title       text
description text
total_calories int
plan_data   jsonb
is_active   boolean
created_at  timestamp
```

### weight_logs
```sql
id          uuid PRIMARY KEY
patient_id  uuid REFERENCES patients
weight      float
recorded_at timestamp
```

### water_logs
```sql
id          uuid PRIMARY KEY
patient_id  uuid REFERENCES patients
quantity_ml int
goal_ml     int
date        date
```

### messages
```sql
id              uuid PRIMARY KEY
patient_id      uuid REFERENCES patients
nutritionist_id uuid REFERENCES profiles
sender_type     text (patient|nutritionist)
content         text
is_read         boolean
created_at      timestamp
```

---

## 🔐 Autenticação e Segurança

### useAuth Hook
**Arquivo:** `/src/hooks/useAuth.tsx`

```typescript
// Contexto global de autenticação
interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  // ...
}

// Usado em:
- PatientAuth para verificar sessão
- PatientMobileApp para proteger rotas
- PatientPortal para validação
```

### Proteção de Rotas

**Padrão implementado:**
```typescript
useEffect(() => {
  if (!authLoading && !user) {
    navigate('/patient-auth');
  }
}, [user, authLoading, navigate]);
```

**Usado em:**
- PatientMobileApp (linha 64-68)
- PatientPortal (linha 100-104)
- PublicPatientPortal (linha 83-107)

---

## 📱 Componentes Mobile

### PatientBottomNav
```
Aba "Inicio"  [Home icon]
Aba "Plano"   [Utensils icon]
Button "+Registro" [Central, maior]
Aba "Evolucao" [TrendingUp icon]
Aba "Perfil"  [User icon]
```

### PatientDashboard
```
Header: "Olá, [Nome]!" + Data
┌─ Controle de Água (CircularWaterTracker)
├─ Resumo do Dia (MacroSummary)
└─ Próxima Refeição (NextMealCard)
```

### PatientChat
```
Trigger: Botão "Falar com meu Nutricionista"
Content: Sheet (85vh)
├─ Header: Nome + Status "Online"
├─ ScrollArea: Histórico de mensagens
└─ Input: Campo + Botão envio
```

---

## 🚀 Deployment

### Variáveis de Ambiente Necessárias

```bash
# .env.local (Frontend)
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# supabase/config.json (Backend)
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Comandos Build

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

### Subdomínio Configuração

```bash
# DNS
CNAME paciente → nutriflow.inf.br

# App detecta automaticamente em App.tsx
const isPatientSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname === 'paciente.nutriflow.inf.br' || 
         hostname.startsWith('paciente.');
};
```

---

## 📝 Convenções de Código

### Componentes Paciente-Mobile
```typescript
// Pattern usado:
interface ComponentProps {
  patientId?: string;
  nutritionistId?: string;
  // ...
}

export function ComponentName({ patientId, ... }: ComponentProps) {
  // Componente
}
```

### Data Fetching
```typescript
// Padrão com tratamento de erro
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id);
    
  if (error) throw error;
  // usar data
} catch (error: any) {
  toast({
    title: "Erro",
    description: error.message,
    variant: "destructive",
  });
}
```

---

## 🔍 Debugging

### Logs Úteis

```javascript
// Verificar sessão
supabase.auth.getSession().then(console.log)

// Verificar usuário
supabase.auth.getUser().then(console.log)

// Escutar mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});

// Verificar dados do paciente
const { data } = await supabase
  .from('patients')
  .select('*')
  .eq('user_id', user.id);
console.log('Patient:', data);
```

### Console do Navegador

```
F12 → Console → Procurar por:
- "Error fetching patient data"
- "Unauthorized"
- "Patient not found"
```

### Logs do Supabase

```
Dashboard Supabase → Edge Functions → Logs
  send-patient-magic-link
  generate-grocery-list
  public-patient-portal
```

---

## 📚 Documentação Externa

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎯 Checklist de Verificação

- [ ] Build compila sem erros
- [ ] Supabase configurado
- [ ] Edge Function deployada
- [ ] Variáveis de ambiente configuradas
- [ ] Subdomínio apontando corretamente
- [ ] Magic link funciona
- [ ] Primeiro acesso funciona
- [ ] Login subsequente funciona
- [ ] Chat realtime funciona
- [ ] Evolução de peso carrega
- [ ] Cardápio visível
- [ ] Logout funciona

---

## 📞 Suporte

Para problemas com:

**Magic Link:**
- Verificar Edge Function logs
- Confirmar email configurado no Supabase
- Testar com Postman

**Autenticação:**
- Verificar token no localStorage
- Confirmar RLS policies
- Testar com diferentes browsers

**Interface:**
- Verificar console para erros de React
- Testar em modo responsivo
- Limpar cache e cookies

---

**Última atualização:** 2024-10-07
**Versão:** 1.0.0
**Status:** ✅ Production Ready
