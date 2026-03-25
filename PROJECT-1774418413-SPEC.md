# BrandScout — Product Specification

> Know the moment your brand hits the press. A news mention intelligence dashboard that tracks your brand and competitors across global news sources, scores sentiment, and shows you who's winning the press game — for a fraction of what enterprise tools charge.

---

## 1. Product Overview

BrandScout monitors news mentions of your brand and up to two competitors, scores each article's sentiment using AI, and renders a live intelligence dashboard with trend charts, composite "Press Scores," and side-by-side comparison views. The target buyer is an indie SaaS founder or small marketing team (1–5 people) at $5K–$500K ARR who currently relies on Google Alerts (free but basic — email-only notifications, no sentiment, no dashboard, no competitor context) or simply Googles their brand name every morning. Enterprise tools like Mention ($41+/mo) and Brand24 ($79+/mo) exist but are overkill and overpriced for this buyer. BrandScout fills the gap: news-only competitive intelligence at $14/mo, with a free tier that delivers instant value before signup.

---

## 2. Target Personas

### Persona 1: Indie SaaS Founder
- **Role:** Solo or co-founder running a B2B SaaS product at $5K–$200K ARR
- **Core pain:** "I have no idea when my competitor gets featured in TechCrunch or when my brand catches a negative mention — I find out days later through a friend's Slack message."
- **Price sensitivity:** Spends $50–$200/mo on SaaS tools (analytics, email, hosting). Currently uses Google Alerts for press monitoring — $0. Would pay $10–$20/mo for something meaningfully better.
- **First "aha" moment:** Types competitor name into the search bar → sees 8 recent articles with green/amber/red sentiment badges and a sentiment trend line that visibly dips during a week the competitor had a known outage. "Oh wow, the press noticed that too."

### Persona 2: Small Agency Marketer
- **Role:** Marketing manager at a 3–10 person digital agency managing 5–15 client brands
- **Core pain:** "I manually Google each client's brand every morning and paste links into a spreadsheet — it takes 45 minutes and I still miss things."
- **Price sensitivity:** Can expense $20–$50/mo per client. Currently uses Google Alerts + manual search + a shared Google Sheet. Tried Mention, canceled after the trial because $41/mo per brand was too much for the output.
- **First "aha" moment:** Adds 3 brands (their client + 2 competitors) → side-by-side dashboard loads showing all three Press Scores. Instantly spots that Client A's main competitor just received three positive articles about a funding round. "I need to tell the client before their board meeting tomorrow."

### Persona 3: Content Creator / Newsletter Writer
- **Role:** Runs a niche industry newsletter (fintech, climate tech, edtech) with 1K–20K subscribers
- **Core pain:** "I spend 2 hours every morning scanning news sites and RSS feeds to find stories worth covering. I miss things and my competitors scoop me."
- **Price sensitivity:** Spends $20–$50/mo on tools (Substack, Canva, scheduling). Would pay $14/mo for something that cuts research time in half.
- **First "aha" moment:** Enters 3 industry keywords → sees a curated feed of articles sorted by recency and sentiment. Negative-sentiment articles are flagged as potential "controversy stories" worth covering. "This would've saved me an hour this morning."

---

## 3. API Integrations

### GNews
- **Base URL:** `https://gnews.io/api/v4`
- **Auth:** API Key (email signup, no credit card required)
- **Rate limit:** 100 requests/day on free tier
- **Data provided:** News articles matching a search query — title, description, content snippet (up to 1000 chars), source name, source URL, published date, article URL, thumbnail image URL. Supports language and country filters.
- **Product usage:** Primary news data source. Each monitored brand generates one GNews search request per scheduled check. Server-side cron runs checks every 8 hours (3x/day). Results are cached in Supabase with article URL as the deduplication key. When multiple users track the same brand, only one GNews request is made and the results are shared. Free-tier users are checked 2x/day; paid users 3x/day.
- **Failure handling:** If GNews returns an error or times out (>5s), the system serves cached articles from the most recent successful fetch and displays a subtle banner: "News data last updated [X hours ago]." Failed requests are queued for retry after 30 minutes. If GNews is down for >24h, the dashboard shows an inline alert: "Live news updates are temporarily paused. Showing cached articles." No functionality breaks — sentiment scores and trend charts continue to work from cached data.

### MeaningCloud Sentiment Analysis
- **Base URL:** `https://api.meaningcloud.com/sentiment-2.1`
- **Auth:** API Key (email signup, no credit card required)
- **Rate limit:** 40,000 requests/month on free tier (1 request = 1 text analyzed)
- **Data provided:** Overall sentiment polarity (positive, negative, neutral, no-sentiment), confidence score (0–100), subjectivity (subjective/objective), irony detection (ironic/non-ironic), and sentence-level sentiment breakdown.
- **Product usage:** Every new article fetched from GNews is scored by sending the article title + first 500 characters of the description/content. The sentiment result is cached permanently in Supabase keyed by article URL — an article's sentiment never changes, so it only needs to be scored once. The overall polarity and confidence score are used to render sentiment badges on article cards and to compute the rolling Press Score (weighted average of recent article sentiments).
- **Failure handling:** If MeaningCloud returns an error or times out (>5s), the article is displayed without a sentiment badge and a small "Analyzing..." placeholder is shown. The article URL is added to a retry queue processed every 15 minutes. If MeaningCloud is persistently down, articles render with a neutral gray badge labeled "Pending" and the Press Score calculation excludes unscored articles. A dashboard notice reads: "Some articles are awaiting sentiment analysis."

### REST Countries
- **Base URL:** `https://restcountries.com/v3.1`
- **Auth:** None
- **Rate limit:** Unlimited
- **Data provided:** Country names, alpha-2/alpha-3 codes, flags (SVG/PNG URLs), regions, subregions, languages, currencies.
- **Product usage:** Used to display country flag icons next to news source names (e.g., a small US flag next to "TechCrunch"). Country data is fetched once on first server start and cached indefinitely in memory. Only the name-to-flag mapping is used.
- **Failure handling:** If unavailable on first load, flags are omitted entirely. Source names display without flags. Purely cosmetic — zero impact on core functionality.

### API Cost Economics

**Free tier (Scout):**
- 1 brand, checked 2x/day
- GNews: 2 req/day per user. At 100 req/day limit: supports ~50 free users (before deduplication gains).
- MeaningCloud: ~4 new articles/check × 2 checks = 8 units/day = 240 units/month per user. At 40,000 units/month: supports ~166 free users.

**Paid tier (Intel — $14/mo):**
- 3 brands, checked 3x/day
- GNews: 9 req/day per user. At 100 req/day limit: supports ~11 paid users (before deduplication).
- MeaningCloud: ~4 new articles × 3 brands × 3 checks = 36 units/day = 1,080 units/month per user. At 40,000 units/month: supports ~37 paid users.

**Scaling trigger:** At ~15 concurrent paid users, upgrade GNews to paid tier ($84/year = $7/mo for 300,000 req/year ≈ 822 req/day). Revenue at that point: $210+/mo. API cost: $7/mo. Healthy margin.

**Deduplication impact:** When multiple users track the same brand (common for well-known companies), GNews requests are deduplicated server-side. Real-world usage is typically 40–60% of the naive per-user calculation.

---

## 4. Core User Flows

### Onboarding Flow (3 steps to value — no signup required)

1. **User lands on `/`** → sees hero section with a prominent search bar: "Enter any brand or company name." No signup wall.
   - **System:** Renders the landing page with sample screenshots and a live search bar.

2. **User types a brand name (e.g., "Notion") and clicks Search** → redirected to a results page.
   - **System:** Calls GNews API for the brand name, fetches up to 10 articles. Simultaneously sends each article to MeaningCloud for sentiment scoring. Renders results progressively as they arrive.

3. **User sees results: a feed of articles with sentiment badges, a mini trend chart, and a Press Score** → instant "holy shit" moment.
   - **System:** Displays article cards (title, source, date, sentiment badge), a 7-day sentiment sparkline, and a computed Press Score (0–100). Below the results: a CTA — "Track this brand. Create a free account to save your dashboard and add competitors."

### Flow 1: Dashboard Setup (Post-Signup)

1. User signs up (email + password) → redirected to `/dashboard`.
   - **System:** Creates user account in Supabase. If user came from a search, their searched brand is automatically added as their first tracked brand.

2. User sees their tracked brand's full dashboard: article feed, sentiment trend chart, Press Score.
   - **System:** Displays the cached articles and sentiment data from the initial search.

3. User clicks "+ Add Competitor" → enters a competitor name.
   - **System:** Validates by fetching 1 article from GNews. If articles found, adds the competitor and fetches full article set. Dashboard updates to show side-by-side comparison.

4. User now sees: their brand vs. competitor, side by side, with comparative Press Scores.
   - **System:** Renders a two-column (or three-column) comparison layout with independent article feeds and overlaid trend lines.

### Flow 2: Daily Check-In

1. User opens BrandScout → lands on `/dashboard`.
   - **System:** Shows the dashboard with all tracked brands, pre-loaded from the most recent scheduled check.

2. User scans the feed — new articles since last visit are highlighted with a "NEW" badge.
   - **System:** Compares the user's `last_visited_at` timestamp with article `published_at` dates. Articles published after last visit get the badge.

3. If a competitor's sentiment shifted significantly, an alert banner appears at the top: "Competitor X sentiment dropped 18% — 2 negative articles detected."
   - **System:** Compares current 7-day rolling sentiment average against the previous period. If delta > 15%, triggers an alert.

4. User clicks on an article card → opens the original article in a new tab.
   - **System:** Logs the click for analytics (which articles users care about).

---

## 5. Design System

BrandScout targets non-developer business users (founders, marketers, newsletter writers). The design should feel clean, modern, and trustworthy — like a Bloomberg terminal simplified for humans. Light mode default. Cool cyan primary with warm orange accents for alerts and attention states.

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

### Page Layouts

#### Landing Page (`/`)
- **Hero section:** Full-width, white background. Large heading: "Know the moment your brand hits the press." Subheading: "Track news mentions, score sentiment, compare competitors. Free to start." Below: a centered search bar (560px wide) with placeholder text: "Enter a brand or company name..." and a cyan "Search" button.
- **Below hero:** Three feature columns (icon + heading + one-sentence description): "Real-Time News Feed," "AI Sentiment Scoring," "Competitor Comparison."
- **Social proof strip:** "Trusted by 200+ indie founders" (placeholder for launch — update with real count post-launch).
- **Footer:** Minimal — links to login, signup, pricing.

#### Dashboard (`/dashboard`)
- **Top bar (64px):** Logo (left), breadcrumb (center), user avatar dropdown (right).
- **Main area:** Grid of brand cards. Each brand card (full-width, stacked vertically) shows:
  - Brand name + Press Score badge (colored pill: green >70, amber 40–70, red <40)
  - 7-day sentiment sparkline (120px wide, inline)
  - Latest 3 article headlines with sentiment dots
  - "View details →" link
- **Sidebar (240px, left):** Navigation — Dashboard, Settings. Below: "+ Add Brand" button. Below that: usage meter (e.g., "1/3 brands used").
- **Comparison mode:** When 2+ brands are tracked, a "Compare" toggle in the top bar switches to side-by-side column layout.

#### Brand Detail (`/dashboard/:brandId`)
- **Header:** Brand name, Press Score (large, colored), sentiment trend description ("Trending up +12% this week").
- **Trend chart (full-width, 240px tall):** 7-day line chart showing daily average sentiment score. X-axis: dates. Y-axis: sentiment (-1 to +1). Area fill under the line with 10% opacity of the line color.
- **Article feed (below chart):** Vertical list of article cards. Each card:
  - Source name + country flag (left)
  - Article title (bold, clickable → opens article in new tab)
  - Published date (relative: "3 hours ago")
  - Sentiment badge (pill: green "Positive" / gray "Neutral" / red "Negative")
  - First 120 characters of description
  - Confidence score (small text: "92% confidence")
- **Filters (above feed):** Sentiment filter (All / Positive / Neutral / Negative), date range (7d / 14d / 30d).

### Component Specifications

- **Article Card:** Surface background (#FFFFFF), 1px border (#E2E8F0), 8px border-radius, 16px padding. On hover: shadow-sm transition (120ms). Sentiment badge is a pill (9999px radius, 6px vertical padding, 12px horizontal padding) with 10% opacity background of the sentiment color and matching text color.
- **Press Score Badge:** 48px circle with score number centered. Background color: success (#10B981) for 70–100, warning (#F59E0B) for 40–69, error (#EF4444) for 0–39. Text: white, 18px, weight 700.
- **Search Bar:** 48px height, 8px border-radius, 1px border (#E2E8F0). On focus: border color transitions to primary (#0891B2) + box-shadow `0 0 0 3px rgba(8, 145, 178, 0.15)`. Transition: 120ms ease-out.
- **Buttons:** Primary: #0891B2 background, white text, 40px height, 8px radius, 500 weight. Hover: #0E7490. Secondary: transparent background, #0891B2 text, 1px #E2E8F0 border. Hover: #F8FAFC background.
- **Sparkline:** 120px × 32px, stroke width 2px, stroke color matches sentiment (green if trending positive, red if negative, gray if flat). No axes, no labels — pure sparkline.
- **Alert Banner:** Full-width, 48px height, #FFF7ED background (orange-50), 1px #EA580C left border (4px wide), #EA580C text. Dismissable with × button.

---

## 6. Routes

| Path | Page Name | Auth Required | Description |
|---|---|---|---|
| `/` | Landing | No | Marketing page with live search bar — instant value, no signup wall |
| `/results` | Search Results | No | Shows articles + sentiment for the searched brand (pre-signup preview) |
| `/dashboard` | Dashboard | Yes | Main intelligence dashboard with all tracked brands and comparison view |
| `/dashboard/:brandId` | Brand Detail | Yes | Deep-dive view: full article feed, trend chart, filters for one brand |
| `/settings` | Settings | Yes | Manage tracked brands, notification preferences, account, billing |
| `/login` | Login | No | Email + password sign-in |
| `/signup` | Signup | No | Email + password account creation |

---

## 7. Pricing

### Free — Scout ($0/mo)
- 1 tracked brand
- News checked 2x/day
- 7-day article history
- Basic sentiment badges (positive / neutral / negative)
- Press Score for your brand
- **Who it's for:** Founders who just want to know when their brand is mentioned.
- **Upgrade trigger:** Clicking "+ Add Competitor" on the free tier shows: "Upgrade to Intel to track competitors and see who's winning the press game."

### Paid — Intel ($14/mo)
- 3 tracked brands (1 own + 2 competitors)
- News checked 3x/day
- 30-day article history
- Detailed sentiment (confidence score + subjectivity flag)
- Side-by-side competitor comparison
- Sentiment shift alerts (in-app banner when any brand's sentiment changes >15%)
- Article feed CSV export
- Press Score trend chart (7-day and 30-day views)
- **Who it's for:** Active founders and small marketing teams who need competitive press intelligence.

Annual billing: $140/year ($11.67/mo — 2 months free).

---

## 8. Key User Flows (Detailed)

### Flow 1: First Visit → Instant Value (No Signup)

1. User lands on `/` → sees hero with search bar.
2. Types "Linear" → clicks Search.
3. **System:** Sends GNews request for "Linear" → receives 10 articles.
4. **System:** Sends each article's title + snippet to MeaningCloud in parallel (10 concurrent requests).
5. **System:** Redirects to `/results?q=Linear`. Renders article cards progressively — articles appear first, sentiment badges fade in as MeaningCloud responses arrive (200ms ease-out).
6. User sees: 10 articles, each with a sentiment badge. A mini sparkline. A Press Score of 82 (green).
7. Below results: CTA card — "Track Linear and add competitors. Create your free account."
8. **Error state — no articles found:** If GNews returns 0 results, show: "No recent news found for 'Linear.' Try the full company name (e.g., 'Linear App') or check spelling." Search bar remains active for retry.
9. **Error state — GNews down:** Show: "News search is temporarily unavailable. Please try again in a few minutes." Log the error server-side. Do not show a broken page.
10. **Error state — MeaningCloud slow:** Articles render without sentiment badges. Small spinner in the badge position. Badges appear as results arrive. If no sentiment after 10 seconds, show gray "Pending" badges.

### Flow 2: Adding a Competitor (Post-Signup, Paid Tier)

1. On `/dashboard`, user clicks "+ Add Competitor."
2. **System:** Opens a modal with a search input: "Enter competitor brand name."
3. User types "Notion" → clicks Add.
4. **System:** Fires a single GNews request for "Notion" to validate. If articles found:
   a. Adds "Notion" to user's tracked brands in Supabase.
   b. Fetches full article set (10 articles).
   c. Scores sentiment for each article.
   d. Closes modal with success toast: "Notion added. Fetching latest coverage..."
5. Dashboard updates: a new brand card for "Notion" slides in (200ms ease-out) next to the existing brand.
6. **Error state — no articles found:** Modal shows inline warning: "We couldn't find news articles for 'Notion.' Try the official company name." Modal stays open for retry.
7. **Error state — brand limit reached (free tier):** Instead of opening the modal, show an upgrade prompt: "You're on the Scout plan (1 brand). Upgrade to Intel to track competitors."
8. **Error state — brand limit reached (paid tier):** Show: "You're tracking 3 brands (Intel plan maximum). Remove a brand in Settings to add a new one."

### Flow 3: Sentiment Shift Detection

1. **System (server-side cron, every 8 hours):** Fetches new articles for all tracked brands across all users.
2. **System:** Deduplicates — if brand "Stripe" is tracked by 5 users, only 1 GNews request is made.
3. **System:** Scores sentiment for all new (uncached) articles via MeaningCloud.
4. **System:** For each brand, computes the 7-day rolling average sentiment. Compares against the previous 7-day window.
5. **If delta > 15%:** Creates an alert record in Supabase linked to the affected brand and users tracking it.
6. **Next time the user opens `/dashboard`:** Alert banner renders at the top: "Notion's press sentiment dropped 23% this week — 3 negative articles detected." Banner links to the brand detail page.
7. User clicks the banner → navigated to `/dashboard/notion` with the negative articles highlighted (orange left border on article cards).
8. **Error state — cron fails:** Log error with full context. Retry in 1 hour. On next user visit, show subtle notice: "Latest data may be up to 16 hours old." No alerts are generated from stale data.
9. **Error state — alert on a deleted brand:** If user removed a brand between the cron run and their next visit, the alert is silently discarded.

---

## 9. Technical Constraints

### Performance Targets
- Landing page search → full results (articles + sentiment) in <4 seconds (GNews ~800ms + MeaningCloud ~300ms × 10 in parallel = ~1.1s for API calls + rendering)
- Dashboard load (cached data) → <1.5 seconds
- Brand detail page with 30-day history (up to 180 articles) → <2 seconds
- Sentiment sparkline renders in <100ms (client-side, canvas or SVG)

### Data Handling
- **Server-side (Next.js API routes):** All GNews and MeaningCloud API calls happen server-side to protect API keys. The server fetches, scores, and caches articles in Supabase, then serves pre-processed data to the client.
- **Client-side:** Rendering, chart drawing, filtering, and sorting. No API keys are ever exposed to the client.
- **Pre-signup search:** The `/results` page calls a Next.js API route (`/api/search`) that proxies the GNews + MeaningCloud calls. Results are ephemeral (not persisted) until the user signs up and tracks the brand.

### Rate Limit Strategy
- **GNews (100 req/day):**
  - Server-side deduplication: same brand tracked by N users = 1 request, not N.
  - Scheduled checks: free users 2x/day, paid users 3x/day.
  - Pre-signup searches count against a shared "anonymous search" budget (max 30 req/day reserved for anonymous searches, remaining 70 for tracked brands).
  - If daily limit approached (>90 requests used), anonymous searches are throttled with a message: "Search is temporarily limited. Create a free account for uninterrupted access."
- **MeaningCloud (40,000 units/month):**
  - Articles are scored once and cached forever (article URL is the cache key).
  - Budget: ~1,333 articles/day. Typical daily new articles: 200–400. Comfortable headroom.
  - If monthly limit approached (>36,000 used), new articles are queued and scored in the next billing cycle. Dashboard shows: "Sentiment scores may be delayed."

### Persistence (Supabase)
- **Tables:**
  - `users` — id, email, plan (scout/intel), created_at, last_visited_at
  - `brands` — id, user_id, name, search_query, created_at
  - `articles` — id, brand_name, url (unique), title, description, source_name, source_country, published_at, thumbnail_url, fetched_at
  - `sentiments` — id, article_url (unique, FK), polarity, confidence, subjectivity, irony, scored_at
  - `alerts` — id, user_id, brand_name, alert_type, delta_pct, created_at, dismissed_at
- **No localStorage required** for core functionality. Optional: store last-visited filter preferences in localStorage for convenience.

---

## 10. v1 vs v2 Scope

### v1 — Build This

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

### v2 — Deferred

- Browser push notifications for sentiment shifts
- Weekly email digest summary (requires email service evaluation)
- Custom alert thresholds (user-configurable sensitivity)
- Source filtering (include/exclude specific publications)
- Keyword-based monitoring (not just brand names — industry terms, product names)
- Team features (shared dashboards, role-based access, multiple seats)
- Historical trend comparison (30-day, 90-day, custom range)
- API access for programmatic queries
- RSS feed output per brand
- Slack integration for alerts

### Scope Boundary

**v1 ships when:** A user can enter a brand name, see sentiment-scored articles and a 7-day trend chart, track the brand on a persistent dashboard, add a competitor for side-by-side comparison, and receive an alert when sentiment shifts — all within 60 seconds of first landing.

**v2 begins when:** 50+ active Intel-tier subscribers validate the core value proposition and the most-requested feature from user feedback is prioritized.
