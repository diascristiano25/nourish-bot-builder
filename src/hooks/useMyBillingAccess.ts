import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getMyBillingAccess, MyBillingAccess } from '@/services/billing';

export const MY_BILLING_ACCESS_KEY = 'my-billing-access';

// Access of the logged-in user (nutritionist or patient). Short cache so a cancellation takes effect fast.
export function useMyBillingAccess(options?: { refetchInterval?: number | false }) {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery<MyBillingAccess>({
    queryKey: [MY_BILLING_ACCESS_KEY, user?.id],
    queryFn: getMyBillingAccess,
    enabled: !!user,
    staleTime: 10_000,
    retry: 1,
    refetchInterval: options?.refetchInterval ?? false,
  });

  return {
    ...query,
    user,
    // true while we still do not know the answer for a logged-in user
    resolving: authLoading || (!!user && query.isLoading),
  };
}
