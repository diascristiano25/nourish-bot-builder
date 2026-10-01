import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface ChatNotificationBadgeProps {
  nutritionistId: string;
  className?: string;
}

export function ChatNotificationBadge({ nutritionistId, className }: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!nutritionistId) return;

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `nutritionist_id=eq.${nutritionistId}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nutritionistId]);

  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('nutritionist_id', nutritionistId)
      .eq('sender_type', 'patient')
      .eq('is_read', false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <div className={className}>
      <Badge 
        variant="destructive" 
        className="h-5 min-w-5 px-1.5 text-xs font-bold animate-pulse"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </div>
  );
}
