# Design Notes — BrandScout

## Design System Applied
- Color tokens: All 14 colors from spec Section 5 mapped in `tailwind.config.ts` and used consistently across all pages
- Typography: Inter (heading + body) and JetBrains Mono loaded via `next/font/google`. h1/h2/h3 sizes and letter-spacing match spec
- Spacing: 4px base unit respected. Tailwind's default 4px grid aligns perfectly with spec scale
- Border radii: sm(4px), md(8px), lg(12px), full(9999px) all defined and used correctly
- Shadows: sm/md/lg match spec exactly with `rgba(15,23,42,*)` values
- Animations: fast(120ms), normal(200ms), slow(350ms) durations defined. Custom keyframes added for fade-in, fade-in-up, scale-in, slide-in-bottom

## Changes Made

### Foundation
1. **tailwind.config.ts** — Added `keyframes` and `animation` entries for fade-in, fade-in-up, scale-in, slide-in-bottom with ease-out timing and fill-mode both
2. **globals.css** — Added smooth scroll, selection color (primary/15), stagger delay utility classes (.stagger-1 through .stagger-5) for sequential reveal animations

### Components
3. **Button.tsx** — Changed `transition-colors` to `transition-all`, added `active:scale-[0.98]` press feedback, switched to `focus-visible:ring` for better keyboard UX
4. **SentimentBadge.tsx** — Fixed "Pending" state from off-spec `bg-gray-100 text-gray-500` to spec tokens `bg-bg text-text-secondary`
5. **SearchBar.tsx** — Added `active:scale-[0.98]` and `focus-visible:ring` to search button
6. **ArticleCard.tsx** — Added `hover:border-primary/20` border color shift on hover, changed to `transition-all`
7. **BrandCard.tsx** — Added `hover:border-primary/20` border color shift on hover, changed to `transition-all`
8. **AddBrandModal.tsx** — Added `backdrop-blur-sm` and `animate-fade-in` to overlay, `animate-scale-in` entry animation to modal panel
9. **Toast.tsx** — Replaced broken `animate-in fade-in slide-in-from-bottom-2` (requires unpacked plugin) with working `animate-slide-in-bottom`
10. **ComparisonView.tsx** — Replaced inline `gridTemplateColumns` style with responsive Tailwind classes (`grid-cols-1 md:grid-cols-2/3`) for mobile stacking
11. **ArticleFeed.tsx** — Added `active:scale-[0.98]` to filter pill buttons, changed to `transition-all`

### Pages
12. **Landing (/)** — Hero section now uses `bg-surface` (white) per spec. Staggered fade-in-up animations on hero elements. Feature icons wrapped in `bg-primary/5` rounded containers. Social proof uses spec label typography (12px, uppercase, tracking 0.02em). Added `duration-fast` to all interactive link transitions
13. **Results (/results)** — Added `animate-fade-in-up` to press score section. CTA card upgraded to `rounded-lg shadow-sm` with spec typography. Active states on CTA button
14. **Login (/login)** — Card entry animation (`animate-fade-in-up`). Added `shadow-sm` to card. Logo link gets hover opacity transition
15. **Signup (/signup)** — Same treatment as login for consistency
16. **Dashboard (/dashboard)** — Added mobile top bar (md:hidden) with logo, settings link, logout. Sidebar hidden on mobile (`hidden md:flex`). Mobile "Add" button in top bar. Mobile usage meter shown in main content. Staggered animations on content sections. Compare toggle gets `active:scale-[0.98]` and hover border shift. Brand cards wrapper animates in
17. **Brand Detail (/dashboard/[brandId])** — Improved loading skeleton with proper structure. Breadcrumb separator uses `text-border`. Brand name in breadcrumb truncates on mobile. Back link shortens on mobile. Staggered reveal on header, range toggle, chart, and feed sections. Range toggle buttons get active states and hover border shift
18. **Settings (/settings)** — Added mobile top bar matching dashboard pattern. Sidebar hidden on mobile. h2 headings use spec h3 size (18px). Brand items get hover border shift. Animations on plan and brands sections

## Responsive Status
| Page | Desktop | Mobile (390px) |
|------|---------|----------------|
| `/` | OK | OK — hero, features, and footer stack cleanly |
| `/results` | OK | OK — search bar, cards, and CTA are full-width |
| `/login` | OK | OK — centered card with px-6 padding |
| `/signup` | OK | OK — same as login |
| `/dashboard` | OK | OK — sidebar collapses to top bar, main content fills width |
| `/dashboard/[brandId]` | OK | OK — breadcrumb truncates, back link shortens, chart/feed stack |
| `/settings` | OK | OK — sidebar collapses to top bar, brand items wrap properly |

## Microinteractions Added
- **Page load (landing):** Staggered fade-in-up on hero heading (0ms), subheading (60ms), search bar (120ms), feature grid (180ms)
- **Page load (auth):** Card fades and slides up on mount
- **Page load (brand detail):** Header, range toggle, chart, and feed reveal sequentially (0/60/120/180ms)
- **Hover states:** All buttons, cards, links, and interactive elements have hover feedback (color shift, border color, opacity)
- **Active/press states:** All buttons and pill toggles scale to 0.98 on press
- **Focus states:** All buttons use focus-visible ring (primary/30, offset 1) for keyboard navigation
- **Modal entry:** Backdrop fades in with blur, modal panel scales in from 96% opacity 0
- **Toast entry:** Slides up from bottom with fade
- **Card hover:** Article cards and brand cards shift border to primary/20 with shadow elevation

## Build Status
- After design pass: PASS
