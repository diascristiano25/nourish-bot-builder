import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const PUBLIC_ROUTES = ['/auth', '/access-denied', '/subscription-expired', '/', '/sobre', '/privacidade'];

export function useAccountStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Always resolve checking state — never leave it stuck at true
    if (authLoading) return;

    if (PUBLIC_ROUTES.includes(location.pathname) || !user) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const checkAccountStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_account_status');
        if (cancelled) return;

        if (error) {
          // RPC may not exist yet — fail open so the page still renders
          console.warn('Account status RPC unavailable, skipping check:', error.message);
          setChecking(false);
          return;
        }

        setStatus(data);

        if (data === 'suspended') {
          navigate('/access-denied', { replace: true });
        } else if (data === 'inactive') {
          navigate('/subscription-expired', { replace: true });
        }
      } catch (err) {
        console.warn('Account status check failed, skipping:', err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    checkAccountStatus();
    return () => { cancelled = true; };
  }, [user, authLoading, location.pathname, navigate]);

  return { checking, status };
}