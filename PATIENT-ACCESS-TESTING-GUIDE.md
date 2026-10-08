# GUIA DE TESTES: SISTEMA DE ACESSO DO PACIENTE

## 📋 Pré-Requisitos

1. Projeto compilado com sucesso (`npm run build`)
2. Supabase configurado e rodando
3. Edge Function `send-patient-magic-link` deployada
4. Paciente cadastrado no banco de dados
5. Nutricionista autenticado

---

## 🧪 CENÁRIO 1: PRIMEIRO ACESSO DO PACIENTE

### Passo 1: Nutricionista envia magic link

```bash
# Usar Postman ou curl
curl -X POST https://seu-projeto.supabase.co/functions/v1/send-patient-magic-link \
  -H "Authorization: Bearer NUTRICIONISTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientEmail": "paciente@email.com",
    "patientId": "uuid-do-paciente",
    "redirectUrl": "https://seu-app.com/meu-app"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Link de acesso enviado com sucesso!",
  "userCreated": true,
  "userLinked": true,
  "emailSent": true
}
```

### Passo 2: Paciente recebe email

- [ ] Email recebido em 5 minutos
- [ ] Link contém código de verificação
- [ ] Redirecionamento automático para `/meu-app`

### Passo 3: Paciente faz primeiro acesso

1. Clica no link do email
2. Sistema detecta `user_metadata.is_patient = true`
3. Redireciona para `/patient-auth`
4. Paciente vê tela de "Primeiro Acesso"
5. Preenche email e cria senha
6. Sistema valida se email existe em `patients` table
7. Cria conta via `signUp`
8. Vincula `user_id` ao paciente
9. Redireciona para `/meu-app`

**Checklist:**
- [ ] Tela de primeiro acesso carrega
- [ ] Campos de email preenchidos automaticamente
- [ ] Validação de senha (mínimo 6 caracteres)
- [ ] Confirmação de senha funciona
- [ ] Botão "Criar conta e entrar" ativo
- [ ] Redirecionamento automático após sucesso

---

## 🧪 CENÁRIO 2: LOGIN SUBSEQUENTE

### Passo 1: Paciente acessa `/patient-auth`

1. Página de login carrega
2. Vê abas: Email, Senha
3. Opção de primeiro acesso disponível

### Passo 2: Paciente faz login

```
Email: paciente@email.com
Senha: suasenha123
```

**Fluxo esperado:**
1. Validação de email/senha via Supabase
2. Sistema busca paciente por `user_id`
3. Confirma que é paciente (não nutricionista)
4. Redireciona para `/meu-app`

**Checklist:**
- [ ] Campo de email aceita email válido
- [ ] Campo de senha oculta caracteres
- [ ] Botão "Entrar" desabilitado com campos vazios
- [ ] Mensagem de erro para credenciais inválidas
- [ ] Redirecionamento automático após login bem-sucedido
- [ ] Sessão mantida ao recarregar página

### Passo 3: Esqueci minha senha

1. Clica em "Esqueci minha senha"
2. Digita email
3. Recebe email de recuperação
4. Clica no link de reset
5. Define nova senha
6. Consegue fazer login com nova senha

**Checklist:**
- [ ] Email de recuperação recebido
- [ ] Link válido por 24h
- [ ] Redirecionamento para reset de senha
- [ ] Nova senha funciona no próximo login

---

## 🧪 CENÁRIO 3: PORTAL DO PACIENTE - CARDÁPIOS

### Passo 1: Navegar até aba "Plano"

1. Paciente está em `/meu-app`
2. Clica em "Plano" na barra inferior
3. Componente `PatientMobileApp` renderiza `PatientPlano`

### Passo 2: Verificar visualização do cardápio

**Esperado:**
- [ ] Título do cardápio exibido
- [ ] Total de calorias visível
- [ ] Cada refeição tem nome, horário, ícone
- [ ] Itens de comida listados com porções
- [ ] Calorias por item exibidas
- [ ] Notas/observações aparecem ao final

### Passo 3: Lista de compras

1. Paciente clica em "Gerar Lista de Compras"
2. Aguarda processamento (Edge Function `generate-grocery-list`)
3. Sistema categoriza itens por tipo (Frutas, Legumes, Proteínas, etc)
4. Paciente marca itens como comprados

**Esperado:**
- [ ] Lista gerada em menos de 5 segundos
- [ ] Categorias com emojis aparecem
- [ ] Checkbox marca itens como comprados
- [ ] Progresso atualiza em tempo real
- [ ] Pode regenerar lista a qualquer momento

---

## 🧪 CENÁRIO 4: EVOLUÇÃO DE PESO

### Passo 1: Acessar aba "Evolução"

1. Paciente está em `/meu-app`
2. Clica em "Evolução" na barra inferior
3. Componente `PatientEvolucao` renderiza

### Passo 2: Verificar dados de peso

**Esperado:**
- [ ] Card com peso atual exibido
- [ ] Diferença em relação ao peso anterior (↓ kg ou ↑ kg)
- [ ] Gráfico de evolução com área sob a curva
- [ ] Eixos X (datas) e Y (peso) legíveis
- [ ] Tooltip ao passar mouse sobre pontos
- [ ] Botão "Adicionar" para novo registro

### Passo 3: Adicionar novo registro de peso

1. Clica em "Adicionar"
2. Digita peso em kg
3. Confirma data
4. Salva no banco

**Esperado:**
- [ ] Novo ponto aparece no gráfico
- [ ] Peso atual atualizado
- [ ] Diferença recalculada
- [ ] Ícone de tendência muda (↓/↑)

### Passo 4: Visualizar fotos antes/depois

- [ ] Grid 3x3 de fotos
- [ ] Placeholders com ícone de câmera
- [ ] Botão "+ Adicionar" para upload
- [ ] Data de cada foto exibida

---

## 🧪 CENÁRIO 5: CHAT COM NUTRICIONISTA

### Passo 1: Acessar chat

1. Paciente está em `/meu-app`
2. Clica em "Perfil" na barra inferior
3. Vê botão "Falar com meu Nutricionista"
4. Clica no botão
5. Sheet de chat abre (85vh da altura)

### Passo 2: Enviar mensagem

1. Digita mensagem: "Olá, tenho uma dúvida sobre o cardápio"
2. Clica no botão de envio (ícone de avião)
3. Mensagem aparece do lado direito em cor primária
4. Input é limpo automaticamente

**Esperado:**
- [ ] Mensagem enviada com timestamp
- [ ] Aparece em tempo real
- [ ] Campo vazio após envio
- [ ] Sem duplicação de mensagens

### Passo 3: Receber mensagem do nutricionista

1. Nutricionista responde via dashboard
2. Mensagem aparece do lado esquerdo em cor neutra
3. Paciente vê notificação (badge com contador)

**Esperado:**
- [ ] Mensagem recebida em tempo real (Supabase Realtime)
- [ ] Formatação correta (quebras de linha)
- [ ] Timestamp exibido
- [ ] Scroll automático para nova mensagem
- [ ] Badge de não lido desaparece ao abrir chat

### Passo 4: Notificações

- [ ] Quando chat está fechado, contador mostra mensagens não lidas
- [ ] Contador some ao abrir chat
- [ ] Notificação visual clara de novas mensagens

---

## 🧪 CENÁRIO 6: PERFIL E CONFIGURAÇÕES

### Passo 1: Visualizar perfil

1. Clica em "Perfil" na navegação
2. Vê card com:
   - [ ] Avatar (iniciais do nome)
   - [ ] Nome completo
   - [ ] Email
   - [ ] Objetivo (Emagrecimento/Hipertrofia/etc)

### Passo 2: Configurações

- [ ] Toggle "Notificações" funciona
- [ ] Toggle "Modo escuro" altera tema
- [ ] Links "Privacidade" e "Ajuda" redirecionam corretamente

### Passo 3: Logout

1. Clica em "Sair da Conta"
2. Confirma ação
3. Sesão encerrada
4. Redireciona para `/patient-auth`

**Esperado:**
- [ ] Sem erros ao fazer logout
- [ ] Não pode acessar `/meu-app` sem autenticação
- [ ] Redirecionamento automático para `/patient-auth`

---

## 🧪 CENÁRIO 7: RASTREAMENTO DE ÁGUA

### Passo 1: Visualizar tracker

1. Paciente está em "Início"
2. Vê "Controle de Água" com:
   - [ ] Círculo progressivo mostrando ml atual/meta
   - [ ] Percentual preenchido
   - [ ] Botões de adição rápida (250ml, 500ml, 1000ml)

### Passo 2: Adicionar água

1. Clica em botão (ex: "+250ml")
2. Valor atualiza em tempo real
3. Círculo se preenche proporcionalmente
4. Dados persistem ao recarregar página

**Esperado:**
- [ ] Múltiplos cliques acumulam água
- [ ] Meta pode ser ultrapassada
- [ ] Reset diário em meia-noite
- [ ] Dados salvos em `water_logs`

---

## 🧪 CENÁRIO 8: RESPONSIVIDADE

### Teste em diferentes tamanhos

| Device | Largura | Esperado |
|--------|---------|----------|
| Mobile | 320px | Texto legível, botões toucháveis |
| Tablet | 768px | Layout otimizado, não expandido |
| Desktop | 1200px | Possível adicionar sidebar (futura) |

**Checklist:**
- [ ] Texto legível em todos os tamanhos
- [ ] Botões toque-amigáveis (min 44px)
- [ ] Nenhum overflow horizontal
- [ ] Gráficos responsivos
- [ ] Barra inferior fixa em mobile

### Orientações

- [ ] Portrait funciona perfeitamente
- [ ] Landscape não corta conteúdo
- [ ] Transição suave entre orientações

---

## 🧪 CENÁRIO 9: SEGURANÇA

### Teste 1: Proteção de rotas

1. Sem autenticação, tenta acessar `/meu-app`
   - [ ] Redireciona para `/patient-auth`

2. Tenta acessar com token inválido
   - [ ] Erro de autenticação
   - [ ] Redireciona para login

### Teste 2: Isolamento de dados

1. Paciente A faz login
2. Verifica que vê apenas seus dados
3. Tenta acessar dados de Paciente B (mudando ID na URL)
   - [ ] Acesso negado
   - [ ] Erro 403 ou redirecionamento

### Teste 3: Chat privado

1. Apenas mensagens do próprio paciente/nutricionista aparecem
2. Tenta forçar visualização de outro chat
   - [ ] Acesso negado

---

## 📊 TESTES DE PERFORMANCE

### Carregamento

- [ ] Dashboard carrega em < 2s
- [ ] Chat carrega histórico em < 1s
- [ ] Gráficos renderizam suavemente
- [ ] Sem lag ao interagir

### Realtime

- [ ] Mensagens aparecem em tempo real (< 1s)
- [ ] Múltiplos pacientes simultâneos
- [ ] Sem perda de mensagens

---

## 🐛 RELATÓRIO DE BUGS

Ao encontrar um bug, reporte com:

```
Título: [CRÍTICO/ALTO/MÉDIO] Descrição breve
Ambiente: Mobile/Desktop, Browser, OS
Passos para reproduzir:
1. ...
2. ...
3. ...
Resultado esperado: ...
Resultado obtido: ...
Prints/Vídeo: [se possível]
```

---

## ✅ CHECKLIST FINAL DE ENTREGA

- [ ] Todos os cenários testados
- [ ] Nenhum bug crítico encontrado
- [ ] Performance aceitável
- [ ] Mobile responsivo
- [ ] Chat funciona em tempo real
- [ ] Segurança validada
- [ ] Logout funciona corretamente
- [ ] Sem erros no console
- [ ] Build otimizado
- [ ] Documentação completa

---

**Status de Testes:** Aguardando execução manual pelos QA/Desenvolvedores

