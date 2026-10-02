// Security headers and policies
export const SECURITY_CONFIG = {
  // CSP (Content Security Policy)
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': ["'self'", 'https://supabase.co', 'https://api.stripe.com', 'https://www.google-analytics.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Rate limiting
  rateLimit: {
    auth: { max: 5, window: 900000 }, // 5 requests per 15 min
    api: { max: 100, window: 60000 }, // 100 requests per minute
    checkout: { max: 3, window: 3600000 }, // 3 per hour
  },

  // CORS
  cors: {
    origin: [
      process.env.NODE_ENV === 'production' ? 'https://nutriflow.inf.br' : 'http://localhost:5173',
      'https://www.nutriflow.inf.br',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Input validation
  validation: {
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    passwordMinLength: 8,
    passwordRequiresUppercase: true,
    passwordRequiresNumbers: true,
    passwordRequiresSpecialChars: true,
  },

  // Session security
  session: {
    secure: true,
    httpOnly: true,
    sameSite: 'Strict' as const,
    maxAge: 86400000, // 24 hours
  },
};

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 255);
}

// Email validation
export function validateEmail(email: string): boolean {
  return SECURITY_CONFIG.validation.emailPattern.test(email);
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < SECURITY_CONFIG.validation.passwordMinLength) {
    errors.push(`Mínimo ${SECURITY_CONFIG.validation.passwordMinLength} caracteres`);
  }
  if (SECURITY_CONFIG.validation.passwordRequiresUppercase && !/[A-Z]/.test(password)) {
    errors.push('Deve conter letra maiúscula');
  }
  if (SECURITY_CONFIG.validation.passwordRequiresNumbers && !/\d/.test(password)) {
    errors.push('Deve conter número');
  }
  if (SECURITY_CONFIG.validation.passwordRequiresSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Deve conter caractere especial (!@#$%^&*)');
  }

  return { valid: errors.length === 0, errors };
}
