// Direct REST API calls to Supabase, bypassing the problematic JS Client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

interface AuthResponse {
  user: { id: string; email: string } | null;
  session: { access_token: string } | null;
  error?: { message: string };
}

interface SignUpPayload {
  email: string;
  password: string;
  data?: { full_name?: string };
}

interface SignInPayload {
  email: string;
  password: string;
}

// Only ASCII-safe headers
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
  };
}

export async function restSignUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

export async function restSignIn(payload: SignInPayload): Promise<AuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

export async function restGetUser(token: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function restSignOut(token: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.ok;
}
