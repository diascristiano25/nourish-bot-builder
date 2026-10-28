import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Filter {
  column: string;
  value: string;
}

export function useSupabaseRealtime<T>(table: string, filter: Filter) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel;

    const fetchData = async () => {
      setIsLoading(true);
      const { data: initialData, error } = await supabase
        .from(table)
        .select('*')
        .eq(filter.column, filter.value);

      if (error) {
        console.error('Error fetching realtime data:', error);
        setIsLoading(false);
        return;
      }

      if (isMounted) {
        setData(initialData as unknown as T[]);
        setIsLoading(false);
      }
    };

    fetchData();

    channel = supabase.channel(`${table}:${filter.column}:${filter.value}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT' && newRow) {
            setData((prev) => [...prev, newRow as unknown as T]);
          } else if (eventType === 'UPDATE' && newRow) {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === newRow.id ? (newRow as unknown as T) : item
              )
            );
          } else if (eventType === 'DELETE' && oldRow) {
            setData((prev) =>
              prev.filter((item: any) => item.id !== oldRow.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, filter.column, filter.value]);

  return { data, isLoading };
}