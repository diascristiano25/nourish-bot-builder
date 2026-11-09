import { useCallback, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import { PageHeader } from '@/components/shared/PageHeader';
import { supabase } from '@/integrations/supabase/client';

type Nutritionist = React.ComponentProps<typeof AdminAnalytics>['nutritionists'][number];
type Engagement = React.ComponentProps<typeof AdminAnalytics>['engagementData'][number];

interface OwnedRow {
  nutritionist_id: string;
  created_at: string;
}

const countByOwner = (rows: OwnedRow[]) => {
  const counts: Record<string, number> = {};
  rows.forEach(r => { counts[r.nutritionist_id] = (counts[r.nutritionist_id] || 0) + 1; });
  return counts;
};

const latestByOwner = (rows: OwnedRow[]) => {
  const latest: Record<string, string> = {};
  rows.forEach(r => {
    if (!latest[r.nutritionist_id] || r.created_at > latest[r.nutritionist_id]) {
      latest[r.nutritionist_id] = r.created_at;
    }
  });
  return latest;
};

export default function AdminAnalyticsPage() {
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [engagementData, setEngagementData] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, patientsRes, plansRes, appointmentsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, user_id, full_name, crn, phone, created_at, is_active, is_admin, account_status, trial_ends_at, has_seen_onboarding, last_login_at')
          .eq('is_admin', false),
        supabase.from('patients').select('nutritionist_id, created_at'),
        supabase.from('meal_plans').select('nutritionist_id, created_at'),
        supabase.from('appointments').select('nutritionist_id, created_at'),
      ]);

      const firstError = profilesRes.error || patientsRes.error || plansRes.error || appointmentsRes.error;
      if (firstError) throw firstError;

      const profiles = profilesRes.data || [];
      const patients = (patientsRes.data || []) as OwnedRow[];
      const plans = (plansRes.data || []) as OwnedRow[];
      const appointments = (appointmentsRes.data || []) as OwnedRow[];

      let emailMap: Record<string, string | null> = {};
      if (profiles.length > 0) {
        try {
          const { data: emailData } = await supabase.functions.invoke('get-user-emails', {
            body: { user_ids: profiles.map(p => p.user_id) },
          });
          if (emailData?.success) emailMap = emailData.emails || {};
        } catch (e) {
          console.error('Error fetching emails:', e);
        }
      }

      const patientCount = countByOwner(patients);
      const planCount = countByOwner(plans);
      const appointmentCount = countByOwner(appointments);
      const lastPatient = latestByOwner(patients);
      const lastPlan = latestByOwner(plans);
      const lastAppointment = latestByOwner(appointments);

      setNutritionists(profiles);
      setEngagementData(profiles.map(p => {
        const lastActivity = [p.last_login_at, lastPatient[p.id], lastPlan[p.id], lastAppointment[p.id]]
          .filter((d): d is string => !!d)
          .sort()
          .pop() || null;

        return {
          id: p.id,
          full_name: p.full_name,
          email: emailMap[p.user_id] || null,
          user_id: p.user_id,
          created_at: p.created_at,
          has_seen_onboarding: p.has_seen_onboarding,
          total_patients: patientCount[p.id] || 0,
          total_meal_plans: planCount[p.id] || 0,
          total_appointments: appointmentCount[p.id] || 0,
          last_activity: lastActivity,
        };
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Engajamento e crescimento dos nutricionistas"
          icon={<BarChart3 className="w-7 h-7 text-white" />}
        />
        <AdminAnalytics
          engagementData={engagementData}
          nutritionists={nutritionists}
          loadingEngagement={loading}
          onRefresh={fetchData}
        />
      </div>
    </AdminLayout>
  );
}
