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
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.log('Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    const { patientEmail, patientId, redirectUrl } = await req.json();

    if (!patientEmail || !patientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: patientEmail, patientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify user is a nutritionist
    const { data: nutritionist, error: nutriError } = await supabaseAuth
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (nutriError || !nutritionist) {
      console.log('User is not a nutritionist');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Not a nutritionist' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify nutritionist owns this patient
    const { data: patientOwnership, error: ownershipError } = await supabaseAuth
      .from('patients')
      .select('id, nutritionist_id')
      .eq('id', patientId)
      .single();

    if (ownershipError || !patientOwnership) {
      console.log('Patient not found');
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (patientOwnership.nutritionist_id !== nutritionist.id) {
      console.log('Nutritionist does not own this patient');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Patient belongs to another nutritionist' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authorized: Nutritionist ${nutritionist.id} generating access for patient ${patientId}`);

    // Now use admin client for privileged operations
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

    // Get patient info
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('user_id, full_name, email')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('Error fetching patient:', patientError);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userId = patient.user_id;
    let userCreated = false;
    let userAlreadyExisted = false;

    // If patient doesn't have a user account yet
    if (!userId) {
      console.log('Patient has no user_id, checking if user exists with email:', patientEmail);
      
      // Check if a user already exists with this email
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
      }
      
      const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === patientEmail.toLowerCase());

      if (existingUser) {
        console.log('Found existing user with email:', existingUser.id);
        userId = existingUser.id;
        userAlreadyExisted = true;
        
        // Link user to patient
        const { error: updateError } = await supabaseAdmin
          .from('patients')
          .update({ user_id: userId })
          .eq('id', patientId);
          
        if (updateError) {
          console.error('Error linking user to patient:', updateError);
        } else {
          console.log('Successfully linked existing user to patient');
        }
      } else {
        // Create new user with admin API
        console.log('Creating new user for patient:', patientEmail);
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: patientEmail,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: patient.full_name,
            is_patient: true,
            patient_id: patientId,
          },
        });

        if (createError) {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user account: ' + createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        userId = newUser.user.id;
        userCreated = true;
        console.log('Created new user:', userId);

        // Link user to patient
        const { error: updateError } = await supabaseAdmin
          .from('patients')
          .update({ user_id: userId })
          .eq('id', patientId);
          
        if (updateError) {
          console.error('Error linking new user to patient:', updateError);
        } else {
          console.log('Successfully linked new user to patient');
        }
      }
    } else {
      console.log('Patient already has user_id:', userId);
      userAlreadyExisted = true;
    }

    // Now send magic link using signInWithOtp - this ACTUALLY sends email
    const finalRedirectUrl = redirectUrl || `${req.headers.get('origin')}/patient-portal`;
    
    console.log('Sending magic link to:', patientEmail, 'with redirect:', finalRedirectUrl);
    
    // Create a regular client (not admin) to use signInWithOtp which sends actual emails
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Use signInWithOtp which actually sends the email
    const { error: otpError } = await supabaseClient.auth.signInWithOtp({
      email: patientEmail,
      options: {
        emailRedirectTo: finalRedirectUrl,
        shouldCreateUser: false, // User should already exist
      },
    });

    if (otpError) {
      console.error('signInWithOtp failed:', otpError.message);
      
      // Try resetPasswordForEmail as fallback - this also sends email
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
        patientEmail,
        {
          redirectTo: finalRedirectUrl,
        }
      );

      if (resetError) {
        console.error('resetPasswordForEmail also failed:', resetError.message);
        
        // Still return success if user was created/linked - they can use the login page
        if (userCreated || userAlreadyExisted) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Acesso liberado! O paciente pode acessar o portal usando "Esqueci minha senha" para definir uma senha.',
              userCreated,
              userLinked: true,
              emailSent: false,
              loginUrl: `${req.headers.get('origin')}/patient-auth`,
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to send access link: ' + resetError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password reset email sent successfully to:', patientEmail);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email de redefinição de senha enviado! O paciente receberá um link para criar sua senha.',
          userCreated,
          userLinked: true,
          emailSent: true,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Magic link email sent successfully to:', patientEmail);

    console.log('Magic link process completed successfully for:', patientEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: userCreated 
          ? 'Conta criada e link de acesso enviado com sucesso!'
          : 'Link de acesso enviado com sucesso!',
        userCreated,
        userLinked: true,
        emailSent: true,
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