// Simple REST API calls directly to Supabase (no proxy, no JS Client)
// Hardcoded credentials (public anon key - safe for client-side)
const SUPABASE_URL = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
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