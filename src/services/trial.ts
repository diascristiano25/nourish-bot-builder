// Trial period service
import { supabase } from '@/integrations/supabase/client';

export const TRIAL_DURATION_DAYS = 14;
export const ALERT_DAYS_BEFORE = 3; // Alert when 3 days left

interface TrialStatus {
  isOnTrial: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  daysRemaining: number;
  daysUsed: number;
  shouldShowAlert: boolean;
}

export async function getUserTrialStatus(userId: string): Promise<TrialStatus> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_ends_at')
      .eq('id', userId)
      .single();

    if (!profile?.trial_ends_at) {
      return {
        isOnTrial: false,
        trialStartDate: null,
        trialEndDate: null,
        daysRemaining: 0,
        daysUsed: 0,
        shouldShowAlert: false,
      };
    }

    const now = new Date();
    const endDate = new Date(profile.trial_ends_at);
    const isOnTrial = now < endDate;

    // Calculate start date by subtracting trial duration from end date
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - TRIAL_DURATION_DAYS);

    const totalMs = endDate.getTime() - startDate.getTime();
    const usedMs = now.getTime() - startDate.getTime();

    const daysUsed = Math.floor(usedMs / (1000 * 60 * 60 * 24));
    const remainingMs = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    const shouldShowAlert = isOnTrial && daysRemaining <= ALERT_DAYS_BEFORE;

    return {
      isOnTrial,
      trialStartDate: startDate,
      trialEndDate: endDate,
      daysRemaining,
      daysUsed,
      shouldShowAlert,
    };
  } catch (error) {
    console.error('Error getting trial status:', error);
    return {
      isOnTrial: false,
      trialStartDate: null,
      trialEndDate: null,
      daysRemaining: 0,
      daysUsed: 0,
      shouldShowAlert: false,
    };
  }
}

export async function startTrial(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        trial_start_date: new Date().toISOString(),
        trial_ended: false,
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error starting trial:', error);
    return false;
  }
}

export async function endTrial(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        trial_ended: true,
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error ending trial:', error);
    return false;
  }
}

export function getTrialAlertMessage(daysRemaining: number): string {
  if (daysRemaining === 0) {
    return 'Seu período de teste expirou! Escolha um plano para continuar usando.';
  }
  if (daysRemaining === 1) {
    return 'Seu período de teste expira amanhã! Escolha um plano agora.';
  }
  return `Seu período de teste expira em ${daysRemaining} dias. Escolha um plano para continuar.`;
}
