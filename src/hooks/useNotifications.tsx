import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client-custom';
import { useToast } from '@/hooks/use-toast';

export function useNotifications(nutritionistId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notificações ativadas",
          description: "Você receberá alertas de novas mensagens.",
        });
        return true;
      } else {
        toast({
          title: "Notificações bloqueadas",
          description: "Ative as notificações nas configurações do navegador.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, body: string, onClick?: () => void) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.png',
      tag: 'nutriflow-message',
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  };

  useEffect(() => {
    if (!nutritionistId || permission !== 'granted') return;

    const channel = supabase
      .channel('nutritionist-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `nutritionist_id=eq.${nutritionistId}`,
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Only notify for patient messages
          if (message.sender_type !== 'patient') return;

          // Get patient name
          const { data: patient } = await supabase
            .from('patients')
            .select('full_name')
            .eq('id', message.patient_id)
            .single();

          const patientName = patient?.full_name || 'Paciente';

          showNotification(
            `Nova mensagem de ${patientName}`,
            message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
            () => {
              window.location.href = `/patients/${message.patient_id}?tab=chat`;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nutritionistId, permission]);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
}
