import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetEmailsRequest {
  user_ids: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("get-user-emails function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request is from an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify admin status
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: isAdmin, error: adminError } = await supabaseUser.rpc("is_current_user_admin");
    if (adminError || !isAdmin) {
      console.error("Admin check failed:", adminError);
      throw new Error("Unauthorized: Admin access required");
    }

    const { user_ids }: GetEmailsRequest = await req.json();
    
    if (!user_ids || !Array.isArray(user_ids)) {
      throw new Error("user_ids array is required");
    }

    console.log(`Fetching emails for ${user_ids.length} users`);

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch user emails from auth.users
    const emailMap: Record<string, string | null> = {};
    
    for (const userId of user_ids) {
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError) {
          console.error(`Error fetching user ${userId}:`, userError);
          emailMap[userId] = null;
        } else {
          emailMap[userId] = userData.user?.email || null;
        }
      } catch (e) {
        console.error(`Exception fetching user ${userId}:`, e);
        emailMap[userId] = null;
      }
    }

    console.log("Email map created:", Object.keys(emailMap).length);

    return new Response(JSON.stringify({ success: true, emails: emailMap }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in get-user-emails function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
