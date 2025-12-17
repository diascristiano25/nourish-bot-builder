import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGIN = 'https://nutriflow.inf.br';

serve(async (req) => {
  // CORS and X-Frame-Options headers for iframe embedding
  const headers = new Headers({
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'X-Frame-Options': `ALLOW-FROM ${ALLOWED_ORIGIN}`,
    'Content-Security-Policy': `frame-ancestors 'self' ${ALLOWED_ORIGIN}`,
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const { action } = await req.json();

    if (action === 'get-embed-config') {
      return new Response(
        JSON.stringify({
          allowedOrigin: ALLOWED_ORIGIN,
          frameOptions: `ALLOW-FROM ${ALLOWED_ORIGIN}`,
          csp: `frame-ancestors 'self' ${ALLOWED_ORIGIN}`,
        }),
        { 
          status: 200, 
          headers: {
            ...Object.fromEntries(headers),
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Iframe headers configured for nutriflow.inf.br'
      }),
      { 
        status: 200, 
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
        }
      }
    );
  }
});