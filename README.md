# BrandScout

Know the moment your brand hits the press. A news mention intelligence dashboard that tracks your brand and competitors across global news sources, scores sentiment, and shows you who's winning the press game.

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- [GNews API key](https://gnews.io) (free tier)
- [MeaningCloud API key](https://meaningcloud.com) (free tier)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

See `.env.example` for descriptions of each variable.

### Database Setup

Create the required tables in your Supabase SQL editor. See `IMPLEMENTATION-PLAN.md` for the full schema.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Spec

See [PROJECT-1774418413-SPEC.md](./PROJECT-1774418413-SPEC.md) for the full product specification.
