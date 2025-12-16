import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientEmail, patientId, redirectUrl } = await req.json();

    if (!patientEmail || !patientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: patientEmail, patientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending magic link to patient: ${patientEmail}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if patient already has a user account
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('user_id, full_name')
      .eq('id', patientId)
      .single();

    if (patientError) {
      console.error('Error fetching patient:', patientError);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userId = patient.user_id;

    // If patient doesn't have a user account yet, we'll create one via magic link
    if (!userId) {
      // Check if user already exists with this email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === patientEmail);

      if (existingUser) {
        // Link existing user to patient
        userId = existingUser.id;
        await supabaseAdmin
          .from('patients')
          .update({ user_id: userId })
          .eq('id', patientId);
      }
    }

    // Generate magic link
    const { data, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: patientEmail,
      options: {
        redirectTo: redirectUrl || `${req.headers.get('origin')}/patient-portal`,
        data: {
          patient_id: patientId,
          full_name: patient.full_name,
          is_patient: true,
        },
      },
    });

    if (magicLinkError) {
      console.error('Error generating magic link:', magicLinkError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate magic link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If this is a new user being created, link them to the patient record
    if (!patient.user_id && data.user) {
      await supabaseAdmin
        .from('patients')
        .update({ user_id: data.user.id })
        .eq('id', patientId);
    }

    console.log('Magic link generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link generated',
        // Return the magic link URL for the nutritionist to share
        magicLink: data.properties?.action_link,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in send-patient-magic-link:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
