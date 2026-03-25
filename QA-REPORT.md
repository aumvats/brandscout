# QA Report — BrandScout

## Build Status
- Before QA: ✅ PASS
- After QA: ✅ PASS

## Bugs Found & Fixed

1. **[src/app/api/cron/route.ts:12]** — CRON_SECRET auth bypass: the condition `if (cronSecret && authHeader !== ...)` skipped authentication entirely when `CRON_SECRET` was not set, making the cron endpoint publicly accessible → fixed by inverting guard to `if (!cronSecret || authHeader !== ...)`, which rejects unauthenticated requests regardless of env var presence.

## Bugs Found & NOT Fixed

None.

## Route Status

| Route | Renders | Loading State | Error State | Empty State |
|-------|---------|---------------|-------------|-------------|
| `/` | ✅ | N/A (static) | N/A | N/A |
| `/results` | ✅ | ✅ (skeleton cards) | ✅ (error msg + retry) | ✅ ("No recent news found") |
| `/login` | ✅ | ✅ (button disabled) | ✅ (inline error) | N/A |
| `/signup` | ✅ | ✅ (button disabled) | ✅ (inline error) | N/A |
| `/dashboard` | ✅ | ✅ (skeleton layout) | ✅ (retry button) | ✅ ("No brands tracked yet") |
| `/dashboard/[brandId]` | ✅ | ✅ (skeleton layout) | ✅ (retry button) | ✅ (via ArticleFeed empty) |
| `/settings` | ✅ | ✅ (skeleton layout) | N/A | ✅ ("No brands tracked yet") |

## API Status

| API | Reachable | Error Handling | Keys from ENV |
|-----|-----------|----------------|---------------|
| GNews | ✅ | ✅ (5s timeout, throws on error, caller catches) | ✅ (GNEWS_API_KEY, server-side only) |
| MeaningCloud | ✅ | ✅ (5s timeout, throws on error, caller catches with null sentiment fallback) | ✅ (MEANINGCLOUD_API_KEY, server-side only) |
| REST Countries | ✅ | ✅ (silent fallback, flags omitted — cosmetic only) | N/A (no key required) |
| Supabase | ✅ | ✅ (errors propagated in all API routes) | ✅ (NEXT_PUBLIC_* for browser client, SERVICE_ROLE_KEY server-only) |

## Production-Safety Scans

### 4.5a — Hardcoded localhost URLs
No matches. ✅

### 4.5b — Placeholder fallbacks in env var reads
No placeholder fallback patterns found. All critical env vars (`GNEWS_API_KEY`, `MEANINGCLOUD_API_KEY`) throw explicitly when missing. ✅

### 4.5c — .env.local existence
`.env.local` is **MISSING**. See Deployment Blockers below. ❌

### 4.5d — Silent API client initialization
`createServiceClient()` and `createClient()` use TypeScript `!` non-null assertions on Supabase env vars. These will fail loudly on first API call if unset (Supabase SDK validates on request). GNews and MeaningCloud clients have explicit early-throw guards. ✅

### 4.5e — ENV var consistency
All `process.env.*` references in `src/` are documented in `.env.example`. ✅

| Source reference | In .env.example |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| GNEWS_API_KEY | ✅ |
| MEANINGCLOUD_API_KEY | ✅ |
| CRON_SECRET | ✅ |

## Security

- [x] No hardcoded secrets found
- [x] `.env` / `.env*.local` in `.gitignore`
- [x] Server-only API keys not exposed to client (`GNEWS_API_KEY`, `MEANINGCLOUD_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` have no `NEXT_PUBLIC_` prefix)
- [x] No unsafe HTML injection patterns in JSX (confirmed: all user content rendered as text nodes, no raw HTML output)
- [x] Cron auth bypass fixed (see Bugs Fixed #1)

## Type Design

Types in `src/lib/types.ts` are clean and fit-for-purpose. All interfaces map 1:1 to the DB schema with camelCase transformation. `ArticleWithSentiment` correctly marks optional fields nullable. `BrandWithData extends Brand` adds computed fields cleanly without redundancy. No types score below 5/10.

## Deployment Blockers

- [ ] **`.env.local` is MISSING** — the app builds successfully but will fail at runtime. Create `.env.local` with all values from `.env.example` populated with real credentials before deploying.
  - `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard → Project Settings → API
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard → Project Settings → API
  - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → Project Settings → API (secret)
  - `GNEWS_API_KEY` — from gnews.io (free tier, email signup)
  - `MEANINGCLOUD_API_KEY` — from meaningcloud.com (free tier, email signup)
  - `CRON_SECRET` — generate a random string (e.g., `openssl rand -hex 32`)
- [ ] **Supabase schema must be created manually** — run the SQL from `IMPLEMENTATION-PLAN.md` (tables: users, brands, articles, sentiments, alerts) via the Supabase SQL editor before the app is functional.
- [x] No localhost URLs in production code paths
- [x] No placeholder fallbacks in env reads
- [x] All `process.env.*` references documented in `.env.example`
- [x] GNews and MeaningCloud API clients throw on missing credentials — no silent stubs

## Verdict

**FAIL** — `.env.local` is missing and the Supabase schema has not been provisioned. The build passes and all code-level bugs have been fixed, but the app cannot function without these operator prerequisites.

Once `.env.local` is populated with real credentials and the Supabase schema is created, verdict upgrades to **PASS**.
