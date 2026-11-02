import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StreakTrackerProps {
  className?: string;
}

/**
 * StreakTracker — Mostra dias consecutivos de registro de refeições
 */
export function StreakTracker({ className }: StreakTrackerProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateStreak() {
      if (!user) return;

      try {
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!patient) {
          setStreak(0);
          setLoading(false);
          return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: logs } = await supabase
          .from('food_intake_logs')
          .select('logged_at')
          .eq('patient_id', patient.id)
          .gte('logged_at', thirtyDaysAgo.toISOString())
          .order('logged_at', { ascending: false });

        if (!logs || logs.length === 0) {
          setStreak(0);
          setLoading(false);
          return;
        }

        const uniqueDays = new Set(
          logs.map(log => new Date(log.logged_at).toISOString().split('T')[0])
        );

        let streakCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateString = checkDate.toISOString().split('T')[0];

          if (uniqueDays.has(dateString)) {
            streakCount++;
          } else {
            break;
          }
        }

        setStreak(streakCount);
      } catch (error) {
        console.error('Error calculating streak:', error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    }

    calculateStreak();
  }, [user]);

  if (loading) {
    return (
      <div className={`bg-card rounded-3xl border border-border/40 p-5 shadow-sm ${className || ''}`}>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className={`bg-card rounded-3xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 ${className || ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0">
          <Flame className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Sequência de registros
          </p>
          <p className="text-xl font-bold text-foreground leading-tight mt-0.5">
            {streak > 0 ? (
              <>
                {streak} {streak === 1 ? 'dia' : 'dias'} seguidos! 🔥
              </>
            ) : (
              'Comece hoje!'
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}