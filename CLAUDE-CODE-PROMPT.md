# Build Constraints — BrandScout

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth + database)
- Recharts or lightweight SVG for sparklines/charts

## Design System

```
Colors:
  primary:        #0891B2
  primary-hover:  #0E7490
  bg:             #F8FAFC
  surface:        #FFFFFF
  border:         #E2E8F0
  text-primary:   #0F172A
  text-secondary: #64748B
  accent:         #EA580C
  success:        #10B981
  error:          #EF4444
  warning:        #F59E0B
  sentiment-pos:  #10B981
  sentiment-neu:  #64748B
  sentiment-neg:  #EF4444

Typography:
  heading-font:  Inter
  body-font:     Inter
  mono-font:     JetBrains Mono
  h1: 28px, weight 700, letter-spacing -0.02em
  h2: 22px, weight 600, letter-spacing -0.01em
  h3: 18px, weight 600, letter-spacing -0.01em
  body: 15px, line-height 1.6, weight 400
  caption: 13px, line-height 1.4, weight 400
  label: 12px, line-height 1.3, weight 500, letter-spacing 0.02em, uppercase

Spacing:
  base-unit: 4px
  scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

Border Radius:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px

Animation:
  fast:   120ms ease-out
  normal: 200ms ease-out
  slow:   350ms ease-out

Shadows:
  sm: 0 1px 2px rgba(15, 23, 42, 0.06)
  md: 0 4px 12px rgba(15, 23, 42, 0.08)
  lg: 0 12px 32px rgba(15, 23, 42, 0.12)

Mode: light
```

## API Integrations

### GNews
- Base URL: `https://gnews.io/api/v4`
- Auth: API Key via `apikey` query parameter
- Rate limit: 100 req/day free tier
- Env var: `GNEWS_API_KEY`

### MeaningCloud Sentiment
- Base URL: `https://api.meaningcloud.com/sentiment-2.1`
- Auth: API Key via `key` form parameter
- Rate limit: 40,000 req/month free tier
- Env var: `MEANINGCLOUD_API_KEY`

### REST Countries
- Base URL: `https://restcountries.com/v3.1`
- Auth: None
- Rate limit: Unlimited

## Build Rules
- npm run build MUST pass before you consider any agent done
- No placeholder content (lorem ipsum, "coming soon", fake data)
- No external images unless from a free CDN — use SVG icons
- Error states must be visible in the UI, not just console.log
- Mobile-responsive by default
- All API calls happen server-side (Next.js API routes) — never expose API keys to the client
- Every catch block must log the error, re-throw, or explain why swallowing is safe
- Always check `res.ok` before calling `res.json()` on any fetch response
- Cache article sentiment permanently by article URL — never re-score the same article
- Isolate localStorage.setItem() in its own try/catch, separate from fetch logic

## v1 Scope Boundary

- Landing page with live brand search (no signup required) → instant article feed + sentiment
- Email + password auth via Supabase
- Dashboard with up to 3 tracked brands (1 on free, 3 on paid)
- Article feed with sentiment badges (positive / neutral / negative) and confidence scores
- 7-day sentiment trend sparkline per brand
- Press Score (0–100) per brand
- Side-by-side brand comparison on dashboard
- Sentiment shift alert banners (>15% change)
- Brand detail page with full article feed and filters (sentiment, date range)
- Free (Scout: 1 brand) + Paid (Intel: 3 brands, $14/mo) tiers
- Server-side scheduled checks (every 8 hours via cron/Vercel cron)
- Responsive layout (mobile + desktop)
- Article feed CSV export (paid tier)
