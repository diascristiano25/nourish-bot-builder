# 🥗 NutriFlow - SaaS para Nutricionistas

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb)]()
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-orange)]()

> Plataforma completa para nutricionistas gerenciarem pacientes e criarem cardápios personalizados com Inteligência Artificial

## ✨ Features Principais

- 🤖 **Gerador de Cardápios com IA** (Gemini 2.5 Flash)
- 👥 **Gestão Completa de Pacientes**
- 📊 **Dashboard de Métricas e Evolução**
- 💰 **Financeiro e Pagamentos** (Stripe)
- 📱 **App Mobile para Pacientes**
- 🎯 **[NOVO] Agent de Tráfego Pago** - Cria campanhas de anúncios automaticamente

---

# Project Name: NutriFlow SaaS

# Role
Atue como um Engenheiro de Software Full-Stack Senior e Especialista em UX/UI. O objetivo é construir um SaaS completo para Nutricionistas criarem e gerenciarem cardápios alimentares personalizados.

# Core Features & Scope
Não crie apenas uma landing page. Eu preciso de uma aplicação web funcional (SaaS) com as seguintes capacidades:

1.  **Autenticação e Multi-tenancy (SaaS):**
    * Login seguro (Supabase Auth).
    * Cada usuário é um "Nutricionista" e tem seu próprio workspace isolado.
    * O Nutricionista deve poder configurar o seu perfil (Logo, Nome, CRN, Cores da marca) para que isso apareça nos documentos gerados para os pacientes.

2.  **Gestão de Pacientes (CRUD):**
    * Dashboard principal listando os pacientes do nutricionista logado.
    * Formulário de cadastro de paciente completo (Anamnese): Nome, Idade, Peso, Altura, Objetivo (Hipertrofia, Emagrecimento, etc.), Restrições Alimentares, Alergias e Nível de Atividade Física.
    * Histórico de acompanhamento (timeline de peso e evolução).

3.  **Gerador de Cardápios com IA (Core Feature):**
    * Integração via Edge Function com a API do **Gemini 2.5 Flash**.
    * **Lógica do Prompt da IA:** O sistema deve enviar os dados do paciente (anamnese) para o Gemini e solicitar um plano alimentar estruturado.
    * **Base de Dados Nutricional:** A IA deve ser instruída a priorizar alimentos e valores nutricionais baseados na **Tabela TACO (Tabela Brasileira de Composição de Alimentos)**.
    * A resposta deve vir em formato JSON estruturado para ser renderizada no frontend (Café da manhã, Almoço, Lanche, Jantar).

4.  **🆕 Agent de Tráfego Pago (Marketing Automation):**
    * Agent com IA (Gemini 2.0 Flash) que gera estratégias de campanhas de anúncios
    * Integração com **Meta Ads API** (Facebook/Instagram Ads)
    * Análise de mercado e público-alvo automatizada
    * Criação de múltiplas variações de anúncios para teste A/B
    * Dashboard para visualizar estratégias e métricas esperadas
    * [📖 Ver documentação completa](./README-AGENT-TRAFEGO.md)

5.  **UI/UX & Design System:**
    * Interface limpa, moderna e responsiva (Mobile-first), focada em produtividade.
    * Use componentes Shadcn/UI e Tailwind CSS.
    * Visualização do cardápio deve ser clara, permitindo edição manual pelo nutricionista se necessário.

5.  **Estrutura de Dados (Supabase):**
    * Tabela `nutritionists` (perfil, branding).
    * Tabela `patients` (dados pessoais, id do nutricionista).
    * Tabela `anthropometrics` (histórico de peso/medidas).
    * Tabela `meal_plans` (o cardápio gerado e editado).

# User Flow
1.  Nutricionista faz login.
2.  Cai no Dashboard e clica em "Novo Paciente".
3.  Preenche os dados do paciente.
4.  Clica em "Gerar Cardápio com IA".
5.  O sistema processa, chama o Gemini 2.5 Flash usando a referência da Tabela TACO.
6.  O cardápio aparece na tela. O nutricionista pode editar itens.
7.  O nutricionista clica em "Exportar/Finalizar", gerando uma visualização com o logo e cores dele para enviar ao paciente (PDF ou Link).

Comece construindo a estrutura do banco de dados e a tela de Dashboard com a lista de pacientes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nourish-bot-builder.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/611fef9d-871f-4c8d-b6af-69a348bc35d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
