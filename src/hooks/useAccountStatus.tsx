import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Routes that don't require account status check
const PUBLIC_ROUTES = ['/auth', '/access-denied', '/'];

export function useAccountStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkAccountStatus = async () => {
      // Skip check for public routes or if no user
      if (PUBLIC_ROUTES.includes(location.pathname) || !user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_account_status');

        if (error) {
          console.error('Error checking account status:', error);
          setChecking(false);
          return;
        }

        setStatus(data);

        if (data === 'suspended') {
          navigate('/access-denied', { replace: true });
        }
      } catch (error) {
        console.error('Account status check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkAccountStatus();
    }
  }, [user, authLoading, location.pathname, navigate]);

  return { checking: checking || authLoading, status };
}
