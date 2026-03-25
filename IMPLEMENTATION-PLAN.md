# BrandScout — Implementation Plan

## Tech Stack
- Framework: Next.js 14 (App Router), TypeScript
- Styling: Tailwind CSS with custom design tokens
- Database: Supabase (PostgreSQL + Auth)
- Auth: Supabase Auth (email + password)
- APIs: GNews, MeaningCloud Sentiment, REST Countries
- Charts: Recharts (trend chart) + inline SVG (sparklines)
- Deployment: Vercel with Vercel Cron

## Project Setup
- Package manager: npm
- Key dependencies: `@supabase/supabase-js @supabase/ssr recharts next@14`
- Optional: `date-fns` for relative date formatting

### Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GNEWS_API_KEY=
MEANINGCLOUD_API_KEY=
```

## File Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (Inter font, Tailwind base)
│   ├── globals.css
│   ├── results/
│   │   └── page.tsx                # /results?q=... pre-signup search results
│   ├── dashboard/
│   │   ├── page.tsx                # /dashboard — brand cards grid + comparison toggle
│   │   └── [brandId]/
│   │       └── page.tsx            # /dashboard/:brandId — full article feed + chart
│   ├── settings/
│   │   └── page.tsx                # /settings — manage brands, billing
│   ├── login/
│   │   └── page.tsx                # /login
│   ├── signup/
│   │   └── page.tsx                # /signup
│   └── api/
│       ├── search/
│       │   └── route.ts            # POST — GNews + MeaningCloud for pre-signup search
│       ├── brands/
│       │   ├── route.ts            # GET (list user brands), POST (add brand)
│       │   └── [brandId]/
│       │       └── route.ts        # DELETE (remove brand)
│       ├── articles/
│       │   └── route.ts            # GET articles for a brand (with filters)
│       ├── alerts/
│       │   └── route.ts            # GET active alerts, POST dismiss
│       ├── export/
│       │   └── route.ts            # GET CSV export for a brand (paid only)
│       └── cron/
│           └── route.ts            # GET — Vercel Cron handler (every 8h)
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Primary + Secondary variants
│   │   ├── SearchBar.tsx           # 48px height, focus ring, submit
│   │   ├── SentimentBadge.tsx      # Positive/Neutral/Negative pill
│   │   ├── PressScoreBadge.tsx     # 48px circle, color-coded
│   │   ├── AlertBanner.tsx         # Full-width dismissable orange alert
│   │   └── Toast.tsx               # Success/error toast (useState-based)
│   └── features/
│       ├── ArticleCard.tsx         # Article with badge, flag, relative date
│       ├── BrandCard.tsx           # Dashboard card: score + sparkline + 3 headlines
│       ├── Sparkline.tsx           # Inline SVG 120×32 sparkline
│       ├── TrendChart.tsx          # Recharts LineChart 7-day sentiment
│       ├── AddBrandModal.tsx       # Modal with search input + validation
│       ├── ComparisonView.tsx      # Side-by-side brand columns
│       ├── ArticleFeed.tsx         # Filtered list of ArticleCards
│       └── UsageMeter.tsx          # "1/3 brands used" sidebar widget
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser supabase client
│   │   ├── server.ts               # Server supabase client (SSR)
│   │   └── middleware.ts           # Auth session refresh
│   ├── api/
│   │   ├── gnews.ts                # fetchArticles(query): GNewsArticle[]
│   │   ├── meaningcloud.ts         # scoreSentiment(text): SentimentResult
│   │   └── countries.ts            # getCountryFlag(countryCode): string
│   ├── scoring.ts                  # computePressScore(articles): number
│   ├── alerts.ts                   # detectSentimentShift(brand): AlertRecord|null
│   └── types.ts                    # Shared TypeScript interfaces
└── middleware.ts                   # Protect /dashboard, /settings routes
```

## Pages & Routes (build priority order)

1. **Landing** `/` — Hero with search bar, 3 feature columns, social proof strip, footer
2. **Results** `/results?q=...` — Article feed + sentiment badges + Press Score CTA
3. **Login** `/login` — Email/password form, link to signup
4. **Signup** `/signup` — Email/password form, redirects to dashboard after auth
5. **Dashboard** `/dashboard` — Brand cards grid, comparison toggle, alert banners
6. **Brand Detail** `/dashboard/:brandId` — Trend chart + filtered article feed
7. **Settings** `/settings` — Brand management, tier display, CSV export

## Components Inventory

### `SearchBar.tsx`
- Props: `placeholder, onSearch(query: string), loading?: boolean`
- 48px height, 8px radius, focus ring (#0891B2 + 3px shadow at 15% opacity)
- Enter key or button click triggers `onSearch`

### `ArticleCard.tsx`
- Props: `article: ArticleWithSentiment, isNew?: boolean, highlighted?: boolean`
- Shows: flag icon, source name, title (link → new tab), relative date, SentimentBadge, 120-char description snippet, confidence score
- `isNew` → "NEW" badge (cyan pill top-right)
- `highlighted` (negative alert) → 4px orange left border

### `SentimentBadge.tsx`
- Props: `polarity: 'P'|'NEU'|'N'|null, confidence?: number`
- Pill (9999px radius, 6px×12px padding), 10% opacity bg of sentiment color
- null → gray "Pending" badge

### `PressScoreBadge.tsx`
- Props: `score: number`
- 48px circle, white centered text 18px/700. bg: success ≥70, warning 40–69, error <40

### `Sparkline.tsx`
- Props: `data: number[], width?: 120, height?: 32`
- Inline SVG, no axes, stroke width 2px. Stroke color: green if trend positive, red if negative, gray if flat (last - first within ±5%)

### `TrendChart.tsx`
- Props: `data: {date: string, score: number}[], range: '7d'|'30d'`
- Recharts LineChart, 240px height, area fill at 10% opacity, x-axis dates, y-axis -1 to 1

### `BrandCard.tsx`
- Props: `brand: Brand, articles: ArticleWithSentiment[]`
- Full-width card: brand name + PressScoreBadge + Sparkline + 3 latest headlines with dots + "View details →" link

### `AddBrandModal.tsx`
- Props: `onAdd(name: string): Promise<void>, onClose(): void, planLimit: number, currentCount: number`
- Shows upgrade prompt if at limit. Otherwise: text input + validation via 1 GNews request + inline error if no articles found

### `AlertBanner.tsx`
- Props: `alerts: Alert[], onDismiss(id: string): void`
- Stacked banners: #FFF7ED bg, 4px #EA580C left border, dismissable ×

### `ComparisonView.tsx`
- Props: `brands: Brand[], articles: Record<string, ArticleWithSentiment[]>`
- Side-by-side CSS grid columns (1 col per brand), each with TrendChart + ArticleFeed

### `ArticleFeed.tsx`
- Props: `articles: ArticleWithSentiment[], sentimentFilter: 'all'|'P'|'NEU'|'N', dateRange: '7d'|'14d'|'30d'`
- Filters and renders ArticleCard list; filter controls above the feed

### `UsageMeter.tsx`
- Props: `used: number, limit: number`
- Text: "X/Y brands used", thin progress bar in primary color

## API Integration Plan

### GNews — `src/lib/api/gnews.ts`
- Base URL: `https://gnews.io/api/v4`
- Endpoint: `GET /search?q={query}&lang=en&max=10&apikey={GNEWS_API_KEY}`
- Response shape: `{ articles: [{ title, description, content, url, image, publishedAt, source: { name, url } }] }`
- Auth: `apikey` query param (server-side only, never exposed to client)
- Rate limit: 100 req/day. Track usage in Supabase `api_usage` table (or simple counter).
- Error handling: check `res.ok`, catch network timeout at 5s with `AbortController`. On failure → log error, throw to caller. Caller serves cached data with stale banner.

### MeaningCloud — `src/lib/api/meaningcloud.ts`
- Base URL: `https://api.meaningcloud.com/sentiment-2.1`
- Endpoint: `POST` with form body: `key={MEANINGCLOUD_API_KEY}&lang=en&txt={title + first 500 chars of description}`
- Response shape: `{ score_tag: 'P'|'P+'|'NEU'|'N'|'N+'|'NONE', confidence: string, subjectivity: string, irony: string }`
- Normalize `score_tag`: `P`/`P+` → `P`, `N`/`N+` → `N`, `NONE` → `NEU`
- Cache permanently by article URL in `sentiments` table. Never re-score same URL.
- Error handling: on failure add URL to retry queue (store in Supabase `sentiment_queue` table). Render gray "Pending" badge until scored.
- If confidence not returned or <50, still store with actual value.

### REST Countries — `src/lib/api/countries.ts`
- Base URL: `https://restcountries.com/v3.1`
- Endpoint: `GET /all?fields=name,cca2,flags`
- Called once at server start, result cached in module-level `Map<cca2, flagSvgUrl>`
- Returns flag SVG URL for a given ISO alpha-2 country code
- On failure: silently return undefined; caller skips flag rendering

## Data Flow

### Pre-signup search (`/api/search`)
1. Client POSTs `{ query }` to `/api/search`
2. Server calls `gnews.fetchArticles(query)` — returns 10 articles
3. Server calls `meaningcloud.scoreSentiment()` for each article in parallel (Promise.all)
4. Server returns enriched articles to client (ephemeral, not persisted)
5. Client renders `/results` progressively

### Dashboard load (`/dashboard`)
1. Server component fetches user's brands from `brands` table
2. For each brand, queries `articles` + `sentiments` joined, ordered by `published_at DESC`
3. Computes Press Score and sparkline data server-side
4. Fetches active (undismissed) alerts from `alerts` table
5. Passes all data as props to client components (no client-side fetches needed on initial load)

### Cron job (`/api/cron`)
1. Vercel calls `GET /api/cron` every 8 hours (configured in `vercel.json`)
2. Route protected by `Authorization: Bearer {CRON_SECRET}` check
3. Fetches distinct brand names across all users
4. Deduplicates: 1 GNews call per unique brand name
5. Stores new articles in `articles` table (upsert by URL)
6. Scores new articles via MeaningCloud (articles not in `sentiments` table)
7. Computes rolling 7-day sentiment averages, compares to previous 7-day window
8. If delta > 15%: inserts alert records in `alerts` table for all users tracking that brand

### CSV export (`/api/export?brandId=...`)
1. Auth check + paid-tier check
2. Queries all articles for brand within 30 days
3. Joins with sentiments
4. Returns CSV with headers: title, url, source, published_at, sentiment, confidence

## Supabase Schema

```sql
-- Run via Supabase SQL editor or migrations

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  plan text NOT NULL DEFAULT 'scout', -- 'scout' | 'intel'
  created_at timestamptz DEFAULT now(),
  last_visited_at timestamptz
);

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_query text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  source_name text,
  source_country text,
  published_at timestamptz,
  thumbnail_url text,
  fetched_at timestamptz DEFAULT now()
);

CREATE TABLE public.sentiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_url text UNIQUE NOT NULL REFERENCES public.articles(url),
  polarity text, -- 'P' | 'NEU' | 'N' | null (pending)
  confidence integer,
  subjectivity text,
  irony text,
  scored_at timestamptz DEFAULT now()
);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  alert_type text DEFAULT 'sentiment_shift',
  delta_pct integer,
  created_at timestamptz DEFAULT now(),
  dismissed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only read/write their own rows
CREATE POLICY "users_own" ON public.users USING (id = auth.uid());
CREATE POLICY "brands_own" ON public.brands USING (user_id = auth.uid());
CREATE POLICY "alerts_own" ON public.alerts USING (user_id = auth.uid());
-- articles and sentiments are shared (readable by all authenticated users, writable by service role only)
```

## Tailwind Config (`tailwind.config.ts`)
```js
theme: {
  extend: {
    colors: {
      primary: '#0891B2',
      'primary-hover': '#0E7490',
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      'text-primary': '#0F172A',
      'text-secondary': '#64748B',
      accent: '#EA580C',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      'sentiment-pos': '#10B981',
      'sentiment-neu': '#64748B',
      'sentiment-neg': '#EF4444',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px rgba(15,23,42,0.06)',
      md: '0 4px 12px rgba(15,23,42,0.08)',
      lg: '0 12px 32px rgba(15,23,42,0.12)',
    },
    transitionDuration: {
      fast: '120ms',
      normal: '200ms',
      slow: '350ms',
    },
  },
}
```

## Build Order (step-by-step)

1. `npx create-next-app@14 brandscout --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. `npm install @supabase/supabase-js @supabase/ssr recharts date-fns`
3. Configure `tailwind.config.ts` with full design token extensions above
4. Add Inter + JetBrains Mono via `next/font/google` in `layout.tsx`; set `body` bg to `#F8FAFC`
5. Create `src/lib/types.ts` — define `GNewsArticle`, `SentimentResult`, `ArticleWithSentiment`, `Brand`, `Alert`, `User` interfaces
6. Create Supabase clients: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/middleware.ts` (session refresh + route protection for `/dashboard`, `/settings`)
7. Run Supabase schema SQL (manually in Supabase dashboard during setup)
8. Build `src/lib/api/gnews.ts` — `fetchArticles(query, max=10): Promise<GNewsArticle[]>`
9. Build `src/lib/api/meaningcloud.ts` — `scoreSentiment(text): Promise<SentimentResult>`
10. Build `src/lib/api/countries.ts` — module-level cache, `getCountryFlag(cca2): string|undefined`
11. Build `src/lib/scoring.ts` — `computePressScore(polarities: string[]): number` (maps P→1, NEU→0, N→-1, normalizes to 0–100)
12. Build `/api/search/route.ts` — orchestrates GNews + MeaningCloud in parallel, returns enriched articles
13. Build UI components: `Button`, `SearchBar`, `SentimentBadge`, `PressScoreBadge`, `AlertBanner`, `Toast`
14. Build `app/page.tsx` (landing) — hero with SearchBar (POSTs to `/api/search`, redirects to `/results`), 3 feature columns, social proof, footer
15. Build `app/results/page.tsx` — reads `q` from searchParams, calls `/api/search`, renders ArticleCard list + mini Press Score + CTA card
16. Build `app/login/page.tsx` and `app/signup/page.tsx` — Supabase auth forms
17. Build feature components: `Sparkline`, `BrandCard`, `ArticleFeed`, `TrendChart`, `AddBrandModal`, `ComparisonView`, `UsageMeter`, `ArticleCard`
18. Build `/api/brands/route.ts` — GET (fetch user's brands + latest articles), POST (validate brand via GNews, insert into DB, fetch + score articles)
19. Build `/api/articles/route.ts` — GET with `brandId`, `sentiment`, `range` query params
20. Build `/api/alerts/route.ts` — GET active alerts for user, POST dismiss by id
21. Build `app/dashboard/page.tsx` — server component: fetches brands + articles + alerts, renders BrandCard grid + optional ComparisonView + AlertBanner stack
22. Build `/api/brands/[brandId]/route.ts` — DELETE (remove brand + cascade)
23. Build `app/dashboard/[brandId]/page.tsx` — server component: fetches full article history, renders TrendChart + ArticleFeed with filters
24. Build `src/lib/alerts.ts` — `detectSentimentShift()` comparison logic
25. Build `/api/cron/route.ts` — full cron handler (dedup, fetch, score, alert generation); add `vercel.json` with cron config
26. Build `/api/export/route.ts` — CSV export (paid tier guard)
27. Build `app/settings/page.tsx` — brand list with remove buttons, plan badge, export links
28. Run `npm run build` — fix all TypeScript and ESLint errors

## `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 */8 * * *"
    }
  ]
}
```
Add `CRON_SECRET` env var. Cron route checks `Authorization: Bearer {CRON_SECRET}`.

## Press Score Algorithm
```
// Map polarity to numeric: P/P+ → 1.0, NEU → 0.0, N/N- → -1.0
// Weight by confidence: weighted_sum / total_weight
// Normalize: ((weighted_avg + 1) / 2) * 100 → 0–100
// Round to integer
```

## Sentiment Shift Detection
```
// Get articles from last 7 days vs previous 7 days (days 8–14)
// Compute weighted average score for each window
// delta = ((current - previous) / Math.abs(previous || 1)) * 100
// If Math.abs(delta) > 15 → generate alert
```

## Known Risks
- **GNews 100 req/day free tier is very tight** — at 15+ paid users, deduplification may not be enough. Cron should log daily usage and warn if >80% consumed. Upgrade path: GNews $84/year tier.
- **MeaningCloud POST requires `application/x-www-form-urlencoded`** — use `URLSearchParams`, not JSON body.
- **Vercel Cron requires paid Vercel plan** for schedules more frequent than daily. Every 8h is fine on Hobby if it allows it; otherwise use a single daily cron + more aggressive client-side polling on page load.
- **No real-time updates** — dashboard is server-rendered; users see latest cached data on page load. Polling on the client every 60s for alerts is an acceptable MVP pattern.
- **`source_country` from GNews** — GNews returns source URL, not country. Parse the domain's TLD or hardcode major domains (techcrunch.com → US). REST Countries lookup is for flag rendering only; if country unknown, skip flag gracefully.
- **Supabase RLS** — `articles` and `sentiments` tables are shared across users (deduplication design). These tables should have RLS with `SELECT` for all authenticated users but `INSERT`/`UPDATE` restricted to service role only. Use `SUPABASE_SERVICE_ROLE_KEY` in cron and API routes.

## Plugin Usage Notes
- Builder: Use `/feature-dev` for `/api/cron/route.ts` (complex orchestration) and `app/dashboard/[brandId]/page.tsx` (data fetching + chart + filters)
- Builder: Use `/frontend-design` for `app/page.tsx` (landing) and `app/dashboard/page.tsx` — light-first, Bloomberg-simplified aesthetic, cyan primary, clean card grid
- QA: Run `silent-failure-hunter` on `src/lib/api/gnews.ts`, `src/lib/api/meaningcloud.ts`, and `/api/cron/route.ts`
- QA: Run `code-reviewer` on `src/lib/scoring.ts` and `src/lib/alerts.ts`
- Designer: Light-first aesthetic, cool cyan (#0891B2) primary, warm orange (#EA580C) accents for alerts. Clean and trustworthy — "Bloomberg simplified for humans." No dark backgrounds, no glassmorphism. Subtle shadows. Inter throughout.
