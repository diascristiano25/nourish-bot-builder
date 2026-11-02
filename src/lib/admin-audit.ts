import { supabase } from '@/integrations/supabase/client';

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_audit_log').insert({
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: details || null,
      admin_user_id: user?.id || null,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}