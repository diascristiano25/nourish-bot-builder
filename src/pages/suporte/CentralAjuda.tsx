import { HybridPage } from '@/components/hybrid/HybridPage';
import { FAQAccordion } from '@/components/faq/FAQAccordion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import faqPublicData from '@/content/faq/public.json';
import faqAuthData from '@/content/faq/auth.json';
import { FAQCategory } from '@/types/faq';

const publicFAQ: { categories: FAQCategory[] } = faqPublicData as { categories: FAQCategory[] };
const authFAQ: { categories: FAQCategory[] } = faqAuthData as { categories: FAQCategory[] };

function CentralAjudaPublicContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Central de Ajuda
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o NutriFlow
          </p>
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion categories={publicFAQ.categories} />

        {/* CTA */}
        <div className="bg-[#FAF8F5] border border-border rounded-lg p-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Precisa de mais ajuda?
          </h3>
          <p className="text-muted-foreground">
            Cadastre-se para acessar documentação completa e suporte prioritário
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md bg-[#518C5B] px-6 py-3 text-sm font-medium text-white hover:bg-[#518C5B]/90 transition-colors"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
}

function CentralAjudaAuthContent() {
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

        {/* FAQ Accordion */}
        <FAQAccordion categories={authFAQ.categories} />

        {/* Support Actions */}
        <div className="bg-[#FAF8F5] border border-border rounded-lg p-8 space-y-4">
          <h3 className="text-xl font-semibold text-foreground text-center">
            Precisa de mais ajuda?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                // Placeholder for future chat integration
                alert('Chat com suporte em breve!');
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Chat com suporte
            </Button>
            <a
              href="/empresa/contato"
              className="inline-flex items-center justify-center rounded-md bg-[#518C5B] px-6 py-3 text-sm font-medium text-white hover:bg-[#518C5B]/90 transition-colors"
            >
              Abrir Ticket
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CentralAjuda() {
  return (
    <HybridPage
      title="Central de Ajuda"
      description="Perguntas frequentes e documentação completa sobre o NutriFlow"
      publicContent={<CentralAjudaPublicContent />}
      authContent={<CentralAjudaAuthContent />}
    />
  );
}
