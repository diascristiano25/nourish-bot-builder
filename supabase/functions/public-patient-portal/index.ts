import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId } = await req.json();

    if (!patientId) {
      return new Response(
        JSON.stringify({ error: 'Patient ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patientId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid patient ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching portal data for patient:', patientId);

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch patient - only return non-sensitive fields
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, full_name, nutritionist_id, goal')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('Patient not found:', patientError?.message);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch nutritionist branding info (non-sensitive)
    const { data: nutritionist, error: nutritionistError } = await supabase
      .from('nutritionists')
      .select('full_name, crn, phone, logo_url, primary_color, secondary_color, email_signature')
      .eq('id', patient.nutritionist_id)
      .single();

    if (nutritionistError) {
      console.error('Nutritionist fetch error:', nutritionistError.message);
    }

    // Fetch active meal plan
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .select('id, title, description, total_calories, plan_data, created_at')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (mealPlanError) {
      console.error('Meal plan fetch error:', mealPlanError.message);
    }

    // Fetch weight logs for chart
    const { data: weightLogs, error: weightLogsError } = await supabase
      .from('weight_logs')
      .select('id, weight, recorded_at')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (weightLogsError) {
      console.error('Weight logs fetch error:', weightLogsError.message);
    }

    console.log('Successfully fetched portal data for patient:', patientId);

    return new Response(
      JSON.stringify({
        patient: {
          id: patient.id,
          full_name: patient.full_name,
          goal: patient.goal,
        },
        nutritionist: nutritionist ? {
          full_name: nutritionist.full_name,
          crn: nutritionist.crn,
          phone: nutritionist.phone,
          logo_url: nutritionist.logo_url,
          primary_color: nutritionist.primary_color,
          secondary_color: nutritionist.secondary_color,
          email_signature: nutritionist.email_signature,
        } : null,
        mealPlan: mealPlan || null,
        weightLogs: weightLogs || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in public-patient-portal:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
