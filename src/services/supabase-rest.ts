// Proxy-based REST API calls to Supabase
const PROXY_URL = '/api/supabase-proxy';

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

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function restSignUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await fetch(`${PROXY_URL}?path=auth/v1/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

export async function restSignIn(payload: SignInPayload): Promise<AuthResponse> {
  const response = await fetch(`${PROXY_URL}?path=auth/v1/token&grant_type=password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

export async function restGetUser(token: string) {
  const response = await fetch(`${PROXY_URL}?path=auth/v1/user`, {
    headers: getHeaders(token),
  });

  return response.json();
}

export async function restSignOut(token: string) {
  const response = await fetch(`${PROXY_URL}?path=auth/v1/logout`, {
    method: 'POST',
    headers: getHeaders(token),
  });

  return response.ok;
}
