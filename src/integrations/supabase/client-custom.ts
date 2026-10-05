import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase environment variables');
}

// Custom fetch that sanitizes headers to ASCII-only
const customFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  if (options?.headers) {
    const headers = new Headers(options.headers);
    const sanitizedHeaders = new Headers();

    headers.forEach((value, key) => {
      // Only keep ASCII-safe header values
      const sanitized = value.replace(/[^\x00-\x7F]/g, '');
      if (sanitized) {
        sanitizedHeaders.set(key, sanitized);
      }
    });

    options.headers = sanitizedHeaders;
  }

  return fetch(url, options);
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  }
});
