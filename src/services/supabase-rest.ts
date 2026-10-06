// Simple REST API calls directly to Supabase (no proxy, no JS Client)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

interface AuthResponse {
  access_token?: string;
  user?: {
    id: string;
    email: string;
  };
  error?: {
    message: string;
  };
}

export async function restSignUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      }),
    });

    return await response.json();
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Signup failed' } };
  }
}

export async function restSignIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return await response.json();
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Login failed' } };
  }
}

export async function restSignOut(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
