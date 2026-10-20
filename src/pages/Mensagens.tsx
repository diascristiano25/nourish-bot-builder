import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { MessageCircle, Search, Clock, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  patient_id: string;
  patient_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function Mensagens() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!profileData) throw new Error('No profile');

      // Buscar últimas mensagens agrupadas por paciente
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          patient_id,
          content,
          sender_type,
          is_read,
          created_at,
          patient:patients(id, full_name)
        `)
        .eq('nutritionist_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por paciente e pegar a última mensagem
      const grouped = new Map<string, Conversation>();
      (messages || []).forEach((msg: any) => {
        const patientId = msg.patient_id;
        if (!grouped.has(patientId)) {
          const patient = Array.isArray(msg.patient) ? msg.patient[0] : msg.patient;
          grouped.set(patientId, {
            patient_id: patientId,
            patient_name: patient?.full_name || 'Paciente',
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
        // Contar não lidas (mensagens do paciente que o nutricionista não leu)
        if (msg.sender_type === 'patient' && !msg.is_read) {
          const conv = grouped.get(patientId)!;
          conv.unread_count++;
        }
      });

      setConversations(Array.from(grouped.values()));
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
      // Mock data para demonstração
      setConversations([
        {
          patient_id: '1',
          patient_name: 'Maria Silva',
          last_message: 'Olá, tenho uma dúvida sobre meu cardápio...',
          last_message_at: new Date().toISOString(),
          unread_count: 2,
        },
        {
          patient_id: '2',
          patient_name: 'João Santos',
          last_message: 'Obrigado pela consulta de hoje!',
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR });
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <ModernLayout>
      <div className="space-y-8">
        <PageHeader
          title="Mensagens"
          subtitle={`${totalUnread > 0 ? `${totalUnread} mensagem(ns) não lida(s)` : 'Todas as mensagens lidas'}`}
          icon={<MessageCircle className="w-7 h-7 text-white" />}
          gradient="from-[#518C5B] via-[#4a7d52] to-[#2d5a37]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Conversas */}
          <RichCard delay={0.1} padding="lg" className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#518C5B]" />
              <h2 className="text-lg font-bold text-slate-800">Conversas</h2>
              {totalUnread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>

            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhuma conversa encontrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv, idx) => (
                    <motion.button
                      key={conv.patient_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(81, 140, 91, 0.05)' }}
                      onClick={() => setSelectedConversation(conv.patient_id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedConversation === conv.patient_id
                          ? 'bg-[#518C5B]/10 border-[#518C5B]/30'
                          : 'bg-white border-slate-200 hover:border-[#518C5B]/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] text-white text-sm font-bold">
                            {conv.patient_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">{conv.patient_name}</h3>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(conv.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                          {conv.unread_count > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {conv.unread_count} nova{conv.unread_count > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </RichCard>

          {/* Área de Chat (placeholder por enquanto) */}
          <RichCard delay={0.2} padding="lg" className="lg:col-span-2">
            {selectedConversation ? (
              <div className="h-[500px] flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-[#518C5B]/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Chat em desenvolvimento</h3>
                  <p className="text-slate-500 max-w-md">
                    A funcionalidade completa de chat estará disponível em breve.
                    Por enquanto, você pode visualizar suas conversas na lista ao lado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Selecione uma conversa</h3>
                  <p className="text-slate-500">
                    Escolha um paciente na lista para visualizar as mensagens
                  </p>
                </div>
              </div>
            )}
          </RichCard>
        </div>
      </div>
    </ModernLayout>
  );
}