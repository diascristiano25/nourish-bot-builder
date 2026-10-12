import { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { FAQAccordion, FAQ } from '@/components/nutritionist/suporte/FAQAccordion';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare } from 'lucide-react';

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'Como criar um novo paciente?',
    answer: 'Para criar um novo paciente, vá para a seção de Pacientes e clique no botão "Novo Paciente". Preencha as informações básicas como nome, email, telefone e dados de saúde relevantes. Você poderá adicionar mais detalhes na próxima tela.',
    category: 'how-to'
  },
  {
    id: '2',
    question: 'Como gerar um cardápio personalizado?',
    answer: 'Acesse o perfil do paciente, vá para a aba "Cardápios" e clique em "Gerar Novo Cardápio". Selecione as preferências alimentares, restrições, objetivos nutricionais e deixe o NutriFlow gerar um cardápio IA-powered personalizado.',
    category: 'how-to'
  },
  {
    id: '3',
    question: 'Como agendar uma consulta?',
    answer: 'Na seção Agenda, clique em "Agendar Consulta", selecione o paciente, a data, hora e duração. Você pode adicionar notas sobre o assunto da consulta. O paciente receberá uma notificação automática.',
    category: 'how-to'
  },
  {
    id: '4',
    question: 'Como exportar documentos em PDF?',
    answer: 'Abra o cardápio ou relatório que deseja exportar e clique no botão "Exportar em PDF". O arquivo será gerado com a sua marca personalizada e assinatura digital.',
    category: 'how-to'
  },
  {
    id: '5',
    question: 'Por que meu cardápio não foi gerado?',
    answer: 'Verifique se todas as informações obrigatórias do paciente foram preenchidas corretamente. Se o problema persistir, tente novamente em alguns segundos. Para mais ajuda, entre em contato com nosso suporte.',
    category: 'troubleshooting'
  },
  {
    id: '6',
    question: 'Como resetar minha senha?',
    answer: 'Na tela de login, clique em "Esqueceu a senha?" e insira o seu email. Você receberá um link para criar uma nova senha. O link é válido por 24 horas.',
    category: 'troubleshooting'
  },
  {
    id: '7',
    question: 'Meus pacientes podem acessar os cardápios?',
    answer: 'Sim! Cada paciente recebe um portal onde pode visualizar seus cardápios, histórico de consultas e anotações. Você pode compartilhar o link do portal com eles.',
    category: 'features'
  },
  {
    id: '8',
    question: 'Posso personalizar as cores da minha marca?',
    answer: 'Sim! Na seção Configurações > Perfil, você pode ajustar as cores principais e secundárias, fazer upload da sua logo e adicionar uma assinatura personalizada. Essas configurações aparecerão em todos os documentos exportados.',
    category: 'features'
  },
  {
    id: '9',
    question: 'Como funciona a IA na geração de cardápios?',
    answer: 'O NutriFlow usa inteligência artificial para analisar as preferências do paciente, restrições dietéticas, objetivos e dados de saúde, gerando cardápios balanceados e personalizados em segundos. A IA aprende com suas edições para melhorar futuras sugestões.',
    category: 'features'
  }
];

export default function Suporte() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'how-to', label: 'Como Fazer' },
    { id: 'troubleshooting', label: 'Problemas' },
    { id: 'features', label: 'Recursos' }
  ];

  const filteredFaqs = faqs.filter(
    f => selectedCategory === 'all' || f.category === selectedCategory
  );

  return (
    <ModernLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Centro de Suporte</h1>
          <p className="text-lg text-muted-foreground">
            Encontre respostas para suas dúvidas sobre o NutriFlow
          </p>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div>
          <FAQAccordion faqs={filteredFaqs} />
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Ainda precisa de ajuda?</h3>
            <p className="text-foreground/70">
              Entre em contato com nosso time de suporte. Respondemos em até 24 horas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@nutriflow.com"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-foreground border border-border hover:bg-muted transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@nutriflow.com
            </a>
            <Button className="flex items-center gap-2 rounded-lg">
              <MessageSquare className="w-4 h-4" />
              Chat com Suporte
            </Button>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <a
            href="/suporte/termos"
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <h4 className="font-semibold text-foreground mb-2">Termos de Serviço</h4>
            <p className="text-sm text-muted-foreground">
              Leia nossos termos e condições de uso
            </p>
          </a>
          <a
            href="/suporte/privacidade"
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
          >
            <h4 className="font-semibold text-foreground mb-2">Política de Privacidade</h4>
            <p className="text-sm text-muted-foreground">
              Entenda como protegemos seus dados
            </p>
          </a>
        </div>
      </div>
    </ModernLayout>
  );
}
