# TESTE COMPLETO - SISTEMA DE GESTÃO DE PACIENTES

## EXECUÇÃO: 2026-10-07

### CHECKLIST DE FEATURES

#### 1. GESTÃO DE PACIENTES

**1.1 Listar Pacientes (/pacientes)**
- [ ] Página carrega sem erros
- [ ] Lista de pacientes é exibida
- [ ] Busca por nome funciona
- [ ] Busca por email funciona
- [ ] Click no card navega para detalhes
- [ ] Botão "Novo Paciente" funciona
- [ ] Loading state aparece
- [ ] Empty state aparece quando vazio

**1.2 Adicionar Novo Paciente (/novo-paciente)**
- [ ] Formulário carrega
- [ ] Validação de nome obrigatório
- [ ] Validação de email obrigatório
- [ ] Validação de data nascimento obrigatória
- [ ] Validação de peso obrigatório
- [ ] Validação de altura obrigatória
- [ ] Seleção de alergias funciona
- [ ] Adicionar alergia customizada funciona
- [ ] Seleção de restrições funciona
- [ ] Adicionar restrição customizada funciona
- [ ] Salvamento cria paciente no DB
- [ ] Salvamento cria registro antropométrico
- [ ] Toast de sucesso aparece
- [ ] Redirecionamento para detalhes funciona

**1.3 Editar Paciente (/editar-paciente/:id)**
- [ ] Formulário carrega com dados atuais
- [ ] Todos os campos são editáveis
- [ ] Tags críticas funcionam
- [ ] Atualização salva no DB
- [ ] Novas medidas criam registro antropométrico
- [ ] Peso atualiza weight_logs
- [ ] Toast de sucesso aparece
- [ ] Redirecionamento para detalhes funciona

**1.4 Detalhes do Paciente (/pacientes/:id)**
- [ ] Página carrega dados do paciente
- [ ] Avatar é exibido
- [ ] Quick stats carregam (peso, altura, IMC, % gordura)
- [ ] Tags críticas aparecem se existirem
- [ ] Botão "Gerar Acesso ao Portal" funciona
- [ ] Botão "Gerar Cardápio IA" funciona
- [ ] Botão "Copiar Link Portal" funciona
- [ ] Botão "Compartilhar WhatsApp" funciona
- [ ] Botão "Visualizar como Paciente" funciona
- [ ] Botão "Exportar PDF" funciona
- [ ] Botão "Deletar" funciona com confirmação

**1.5 Tabs de Detalhes**
- [ ] Tab "Visão Geral" exibe dados pessoais
- [ ] Tab "Monitoramento" exibe gráficos
- [ ] Tab "Cardápios" lista meal plans
- [ ] Tab "Chat" carrega chat
- [ ] Tab "Histórico" lista consultas

**1.6 Deletar Paciente**
- [ ] Dialog de confirmação aparece
- [ ] Cancelar mantém paciente
- [ ] Confirmar remove do DB
- [ ] Redirecionamento para dashboard funciona

#### 2. SISTEMA DE CONSULTAS

**2.1 Agendar Consulta (/agenda)**
- [ ] Calendário carrega
- [ ] Seleção de data funciona
- [ ] Lista de consultas do dia carrega
- [ ] Botão "Novo Agendamento" abre modal
- [ ] Modal permite selecionar paciente
- [ ] Modal permite selecionar data/hora
- [ ] Salvamento cria appointment
- [ ] Consulta aparece na lista
- [ ] Atualização de status funciona
- [ ] Marcar como "Realizado" funciona
- [ ] Marcar como "Cancelado" funciona

**2.2 Registrar Consulta (/consulta/:patientId)**
- [ ] Página carrega dados do paciente
- [ ] Formulário de anamnese funciona
- [ ] Editor de plano alimentar funciona
- [ ] Campo de orientações funciona
- [ ] Salvamento cria/atualiza appointment
- [ ] Salvamento cria meal_plan se houver
- [ ] Redirecionamento funciona

#### 3. BIBLIOTECA DE ALIMENTOS

**3.1 Alimentos (/biblioteca - Tab Alimentos)**
- [ ] Lista de alimentos carrega
- [ ] Busca funciona
- [ ] Botão "Novo Alimento" abre modal
- [ ] Formulário permite criar alimento
- [ ] Salvamento adiciona ao DB
- [ ] Edição funciona
- [ ] Deleção funciona
- [ ] Macros são exibidos corretamente

**3.2 Receitas (/biblioteca - Tab Receitas)**
- [ ] Lista de receitas carrega
- [ ] Busca funciona
- [ ] Botão "Nova Receita" abre modal
- [ ] Modo "Manual" funciona
- [ ] Modo "IA" funciona
- [ ] Geração com IA cria receita
- [ ] Salvamento adiciona ao DB
- [ ] Edição funciona
- [ ] Deleção funciona

#### 4. VALIDAÇÕES

**4.1 Validações de Formulário**
- [ ] Campos obrigatórios impedem submissão
- [ ] Mensagens de erro são claras
- [ ] Email valida formato
- [ ] Números validam tipo
- [ ] Data valida formato

**4.2 Loading States**
- [ ] Spinner aparece durante fetch
- [ ] Botões desabilitam durante submit
- [ ] Skeleton aparece em listas

**4.3 Feedback**
- [ ] Toast de sucesso em operações bem-sucedidas
- [ ] Toast de erro em falhas
- [ ] Confirmação de deleção

### QUERIES DO SUPABASE VALIDADAS

```sql
-- Listar pacientes
SELECT * FROM patients 
WHERE nutritionist_id = ? 
ORDER BY created_at DESC;

-- Criar paciente
INSERT INTO patients (nutritionist_id, full_name, email, ...) 
VALUES (...);

-- Atualizar paciente
UPDATE patients SET ... WHERE id = ?;

-- Deletar paciente
DELETE FROM patients WHERE id = ?;

-- Buscar paciente por ID
SELECT * FROM patients WHERE id = ?;

-- Criar antropometria
INSERT INTO anthropometrics (patient_id, weight_kg, height_cm, ...) 
VALUES (...);

-- Criar weight log
INSERT INTO weight_logs (patient_id, weight, recorded_at) 
VALUES (...);

-- Listar consultas
SELECT * FROM appointments 
WHERE patient_id = ? 
ORDER BY date_time DESC;

-- Criar consulta
INSERT INTO appointments (nutritionist_id, patient_id, date_time, ...) 
VALUES (...);

-- Listar alimentos
SELECT * FROM custom_foods 
WHERE nutritionist_id = ? 
ORDER BY name;

-- Listar receitas
SELECT * FROM custom_recipes 
WHERE nutritionist_id = ? 
ORDER BY name;
```

### RESULTADOS DOS TESTES

Iniciando testes...
