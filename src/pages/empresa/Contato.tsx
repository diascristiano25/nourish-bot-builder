import { useState } from 'react';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { TicketForm } from '@/components/support/TicketForm';
import { TicketHistory } from '@/components/support/TicketHistory';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Contato() {
  const { user } = useAuth();
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleTicketSuccess = () => {
    setRefreshHistory((prev) => prev + 1);
  };

  const contactCards = (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      <Card className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#518C5B]/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-[#518C5B]" />
          </div>
        </div>
        <h3 className="font-semibold mb-2">Email</h3>
        <p className="text-sm text-muted-foreground">contato@nutriflow.com.br</p>
      </Card>

      <Card className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#C4764A]/10 flex items-center justify-center">
            <Phone className="w-6 h-6 text-[#C4764A]" />
          </div>
        </div>
        <h3 className="font-semibold mb-2">Telefone</h3>
        <p className="text-sm text-muted-foreground">(11) 3456-7890</p>
      </Card>

      <Card className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#518C5B]/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#518C5B]" />
          </div>
        </div>
        <h3 className="font-semibold mb-2">Endereço</h3>
        <p className="text-sm text-muted-foreground">
          Av. Paulista, 1000 - São Paulo, SP
        </p>
      </Card>
    </div>
  );

  const publicContent = (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#518C5B] to-[#3d6b47] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Envie sua Mensagem</h2>
          <TicketForm user={null} onSuccess={handleTicketSuccess} />
          {contactCards}
        </div>
      </section>
    </div>
  );

  const authContent = (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#518C5B] to-[#3d6b47] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">Suporte</h1>
            <Badge className="bg-[#C4764A] text-white">Suporte Prioritário</Badge>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Como cliente Pro, seu suporte tem prioridade. Responderemos em até 24 horas.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Novo Ticket</h2>
            <TicketForm user={user} onSuccess={handleTicketSuccess} />
          </div>

          {/* Ticket History */}
          {user && (
            <div key={refreshHistory}>
              <TicketHistory userId={user.id} />
            </div>
          )}

          {contactCards}
        </div>
      </section>
    </div>
  );

  return (
    <HybridPage
      publicContent={publicContent}
      authContent={authContent}
      title="Contato"
      description="Entre em contato com a equipe NutriFlow. Estamos aqui para ajudar."
    />
  );
}
