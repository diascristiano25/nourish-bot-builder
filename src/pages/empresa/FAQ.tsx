import { HybridPage } from '@/components/hybrid/HybridPage';
import { FAQCategory } from '@/components/faq/FAQCategory';
import faqPublicData from '@/content/faq/public.json';
import faqAuthData from '@/content/faq/auth.json';
import { FAQData } from '@/types/faq';

const publicFAQ: FAQData = faqPublicData as FAQData;
const authFAQ: FAQData = faqAuthData as FAQData;

function FAQPublicContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o NutriFlow
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {publicFAQ.categories.map((category) => (
            <FAQCategory key={category.id} category={category} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-[#FAF8F5] border border-border rounded-lg p-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Não encontrou o que procurava?
          </h3>
          <p className="text-muted-foreground">
            Entre em contato com nossa equipe de suporte
          </p>
          <a
            href="/empresa/contato"
            className="inline-flex items-center justify-center rounded-md bg-[#518C5B] px-6 py-3 text-sm font-medium text-white hover:bg-[#518C5B]/90 transition-colors"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQAuthContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Central de Ajuda
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Documentação completa e guias avançados para usuários do NutriFlow
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {authFAQ.categories.map((category) => (
            <FAQCategory key={category.id} category={category} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-[#FAF8F5] border border-border rounded-lg p-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Precisa de mais ajuda?
          </h3>
          <p className="text-muted-foreground">
            Abra um ticket de suporte e nossa equipe responderá em até 24h
          </p>
          <a
            href="/empresa/contato"
            className="inline-flex items-center justify-center rounded-md bg-[#518C5B] px-6 py-3 text-sm font-medium text-white hover:bg-[#518C5B]/90 transition-colors"
          >
            Abrir Ticket
          </a>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <HybridPage
      title="FAQ"
      description="Perguntas frequentes sobre o NutriFlow - sistema completo de gestão para nutricionistas"
      publicContent={<FAQPublicContent />}
      authContent={<FAQAuthContent />}
    />
  );
}
