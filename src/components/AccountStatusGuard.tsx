import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { useMyBillingAccess } from '@/hooks/useMyBillingAccess';
import { PatientBillingBlocked } from '@/components/PatientBillingBlocked';

interface AccountStatusGuardProps {
  children: ReactNode;
}

// Routes that bypass the guard completely
const BYPASS_ROUTES = ['/auth', '/access-denied', '/subscription-expired', '/assinatura', '/', '/sobre', '/privacidade'];

const Spinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const location = useLocation();
  const { checking } = useAccountStatus();
  const { data: billing, isError: billingError, resolving } = useMyBillingAccess();

  // Don't show loading for public routes
  if (BYPASS_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (checking || resolving) {
    return <Spinner />;
  }

  // Billing gate: no trial and no plan -> no access.
  // A failed check does not lock anyone out (the portal function enforces it server-side).
  if (!billingError && billing?.access === 'expired') {
    if (billing.role === 'patient') return <PatientBillingBlocked />;
    return <Navigate to="/assinatura" replace />;
  }

  return <>{children}</>;
}
