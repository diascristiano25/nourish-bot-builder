import { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { FAQAccordion, FAQ } from '@/components/nutritionist/suporte/FAQAccordion';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, HelpCircle, BookOpen, Shield, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { motion } from 'framer-motion';

const faqs: FAQ[] = [
  { id: '1', question: 'Como criar um novo paciente?', answer: 'Para criar um novo paciente, vá para a seção de Pacientes e clique no botão "Novo Paciente". Preencha as informações básicas como nome, email, telefone e dados de saúde relevantes.', category: 'how-to' },
  { id: '2', question: 'Como gerar um cardápio personalizado?', answer: 'Acesse o perfil do paciente, vá para a aba "Cardápios" e clique em "Gerar Novo Cardápio". Selecione as preferências alimentares, restrições e objetivos nutricionais.', category: 'how-to' },
  { id: '3', question: 'Como agendar uma consulta?', answer: 'Na seção Agenda, clique em "Agendar Consulta", selecione o paciente, a data, hora e duração. O paciente receberá uma notificação automática.', category: 'how-to' },
  { id: '4', question: 'Como exportar documentos em PDF?', answer: 'Abra o cardápio ou relatório que deseja exportar e clique no botão "Exportar em PDF". O arquivo será gerado com a sua marca personalizada.', category: 'how-to' },
  { id: '5', question: 'Por que meu cardápio não foi gerado?', answer: 'Verifique se todas as informações obrigatórias do paciente foram preenchidas corretamente. Se o problema persistir, tente novamente em alguns segundos.', category: 'troubleshooting' },
  { id: '6', question: 'Como resetar minha senha?', answer: 'Na tela de login, clique em "Esqueceu a senha?" e insira o seu email. Você receberá um link para criar uma nova senha válido por 24 horas.', category: 'troubleshooting' },
  { id: '7', question: 'Meus pacientes podem acessar os cardápios?', answer: 'Sim! Cada paciente recebe um portal onde pode visualizar seus cardápios, histórico de consultas e anotações.', category: 'features' },
  { id: '8', question: 'Posso personalizar as cores da minha marca?', answer: 'Sim! Na seção Configurações > Perfil, você pode ajustar as cores principais e secundárias, fazer upload da sua logo e adicionar uma assinatura personalizada.', category: 'features' },
  { id: '9', question: 'Como funciona a IA na geração de cardápios?', answer: 'O NutriFlow usa inteligência artificial para analisar as preferências do paciente, restrições dietéticas, objetivos e dados de saúde, gerando cardápios balanceados em segundos.', category: 'features' },
];

export default function Suporte() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Todas', icon: HelpCircle },
    { id: 'how-to', label: 'Como Fazer', icon: BookOpen },
    { id: 'troubleshooting', label: 'Problemas', icon: Shield },
    { id: 'features', label: 'Recursos', icon: FileText },
  ];

  const filteredFaqs = faqs.filter(f => selectedCategory === 'all' || f.category === selectedCategory);

  return (
    <ModernLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <PageHeader
          title="Centro de Suporte"
          subtitle="Encontre respostas para suas dúvidas sobre o NutriFlow"
          icon={<HelpCircle className="w-7 h-7 text-white" />}
          gradient="from-[#518C5B] via-[#4a7d52] to-[#3d7047]"
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Artigos</p>
                <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="text-2xl font-bold text-slate-800 leading-tight">
                  {faqs.length}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chat</p>
                <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="text-lg font-bold text-emerald-600 leading-tight">
                  Online
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resposta</p>
                <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="text-lg font-bold text-slate-800 leading-tight">
                  &lt; 24h
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Category filters */}
        <RichCard delay={0.35} padding="md">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </RichCard>

        {/* FAQ Accordion */}
        <RichCard delay={0.4} padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="w-5 h-5 text-[#518C5B]" />
            <h2 className="text-lg font-bold text-slate-800">Perguntas Frequentes</h2>
            <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {filteredFaqs.length} resultados
            </span>
          </div>
          <FAQAccordion faqs={filteredFaqs} />
        </RichCard>

        {/* Contact section */}
        <RichCard delay={0.5} padding="lg" className="bg-gradient-to-br from-[#518C5B]/5 to-[#C4764A]/5 border-[#518C5B]/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Ainda precisa de ajuda?</h3>
                <p className="text-slate-500 text-sm">Entre em contato com nosso time de suporte. Respondemos em até 24 horas.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="mailto:support@nutriflow.com"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-[#518C5B]/40 hover:bg-[#518C5B]/5 transition-all font-medium"
              >
                <Mail className="w-4 h-4" />
                support@nutriflow.com
              </a>
              <Button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:opacity-90 font-semibold">
                <MessageSquare className="w-4 h-4" />
                Chat com Suporte
              </Button>
            </div>
          </div>
        </RichCard>

        {/* Additional resources */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.a
            href="/suporte/termos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
            className="block p-5 rounded-3xl bg-white border border-slate-200/60 shadow-soft hover:border-[#518C5B]/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#518C5B]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#518C5B]" />
              </div>
              <h4 className="font-semibold text-slate-800">Termos de Serviço</h4>
            </div>
            <p className="text-sm text-slate-500 ml-13">Leia nossos termos e condições de uso</p>
          </motion.a>
          <motion.a
            href="/suporte/privacidade"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)' }}
            className="block p-5 rounded-3xl bg-white border border-slate-200/60 shadow-soft hover:border-[#C4764A]/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#C4764A]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#C4764A]" />
              </div>
              <h4 className="font-semibold text-slate-800">Política de Privacidade</h4>
            </div>
            <p className="text-sm text-slate-500 ml-13">Entenda como protegemos seus dados</p>
          </motion.a>
        </div>
      </div>
    </ModernLayout>
  );
}