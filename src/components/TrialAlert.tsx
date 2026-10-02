import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTrialStatus, getTrialAlertMessage, TRIAL_DURATION_DAYS } from '@/services/trial';
import { AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface TrialAlertProps {
  userId?: string;
}

export function TrialAlert({ userId: propUserId }: TrialAlertProps) {
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkTrial = async () => {
      const status = await getUserTrialStatus(userId);
      setTrialStatus(status);
      setLoading(false);
    };

    checkTrial();

    // Check every 12 hours
    const interval = setInterval(checkTrial, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading || !trialStatus?.shouldShowAlert) return null;

  const isExpired = trialStatus.daysRemaining === 0;

  return (
    <Card className={`${
      isExpired
        ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/50'
        : 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50'
    } p-4 mb-6`}>
      <div className="flex gap-4">
        <div className={`${
          isExpired ? 'text-red-500' : 'text-yellow-500'
        }`}>
          {isExpired ? (
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          ) : (
            <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${
            isExpired ? 'text-red-300' : 'text-yellow-300'
          }`}>
            {isExpired ? 'Período de Teste Expirado' : 'Seu Período de Teste está Acabando'}
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {getTrialAlertMessage(trialStatus.daysRemaining)}
          </p>
          <div className="flex gap-3">
            <Link to="/pricing">
              <Button className={`${
                isExpired
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white font-semibold`}>
                Ver Planos
              </Button>
            </Link>
            {!isExpired && (
              <Button variant="outline" className="border-gray-400 text-gray-300">
                Continuar Testando ({trialStatus.daysRemaining}d restante)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            isExpired ? 'bg-red-500' : 'bg-yellow-500'
          }`}
          style={{
            width: `${(trialStatus.daysUsed / TRIAL_DURATION_DAYS) * 100}%`,
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {trialStatus.daysUsed} de {TRIAL_DURATION_DAYS} dias usados
      </p>
    </Card>
  );
}
