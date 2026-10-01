# NutriFlow - Deployment Guide

## Quick Start

```bash
# Local development
bun install
bun run dev

# Testing
bun run test
bun run test:ui    # Vitest UI
bun run test:coverage

# Building
bun run build

# Linting
bun run lint
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=your_url
```

## Deploy to Vercel

### Automatic (GitHub Actions)
- Push to `main` branch
- GitHub Actions will automatically deploy to Vercel
- Requires secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Manual
```bash
vercel deploy --prod
```

## Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

## Environment Variables (Production)

Set these in your Vercel/Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SENTRY_DSN` (optional)

## Monitoring

- **Error Tracking**: Sentry (TODO)
- **Analytics**: PostHog (TODO)
- **Uptime**: StatusPage (TODO)

## CI/CD Pipeline

The `.github/workflows/ci-cd.yml` runs:
1. **Lint**: ESLint on all TypeScript files
2. **Test**: Vitest unit tests
3. **Build**: Vite production build
4. **Deploy**: Auto-deploys to Vercel on `main` push

## Troubleshooting

### Build fails with "Cannot find module"
- Run `bun install` to ensure all dependencies are installed
- Check that `.env` has all required variables

### Tests fail locally but pass in CI
- Clear `node_modules` and reinstall: `bun install`
- Check for environment-specific code

### Deployment shows blank page
- Check browser console for errors
- Verify Supabase credentials in Vercel environment variables
- Check that `dist/` folder is created during build
