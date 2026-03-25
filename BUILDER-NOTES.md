# Builder Agent Notes

## Build Status
- npm run build: ✅ PASS
- Pages built: Landing (/), Results (/results), Login (/login), Signup (/signup), Dashboard (/dashboard), Brand Detail (/dashboard/[brandId]), Settings (/settings)
- API routes built: /api/search, /api/brands, /api/brands/[brandId], /api/articles, /api/alerts, /api/export, /api/cron
- Core feature working: ✅ (all pages render, API routes compile, middleware protects auth routes)

## Deferred / Skipped
- Stripe/payment integration — not implemented (plan field exists in DB, upgrade buttons are present but non-functional)
- Browser push notifications — v2 per spec
- Email digests — v2 per spec
- Click analytics logging — mentioned in spec but deferred (non-critical for v1)
- source_country detection from GNews domain TLD — skipped (GNews doesn't provide country directly; flag rendering will work if country data is manually set)

## Known Issues
- Supabase tables must be created manually via SQL editor before the app is functional (schema provided in IMPLEMENTATION-PLAN.md)
- The `cookies()` warnings during build are expected — Next.js correctly marks auth-dependent API routes as dynamic
- Toast component uses `animate-in` class which requires Tailwind animate plugin (falls back gracefully without it)
- ComparisonView grid may need responsive adjustments on mobile for 3-column layouts

## API Status
- GNews: ✅ Client implemented with 5s timeout and error handling
- MeaningCloud: ✅ Client implemented with proper `application/x-www-form-urlencoded` encoding and 5s timeout
- REST Countries: ✅ Client implemented with module-level cache and graceful fallback
- Supabase: ✅ Browser client, server client, and service role client all implemented with SSR cookie handling

## Architecture Notes
- All API keys are server-side only (via `process.env.*`, not `NEXT_PUBLIC_*`)
- Middleware protects /dashboard and /settings routes, redirects to /login
- Cron route validates `CRON_SECRET` bearer token
- Supabase joins return typed records; explicit type assertions used to handle the generic Supabase response types
