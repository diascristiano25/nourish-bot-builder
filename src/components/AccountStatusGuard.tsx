import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';

interface AccountStatusGuardProps {
  children: ReactNode;
}

// Routes that bypass the guard completely
const BYPASS_ROUTES = ['/auth', '/access-denied', '/'];

export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const location = useLocation();
  const { checking } = useAccountStatus();

  // Don't show loading for public routes
  if (BYPASS_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
