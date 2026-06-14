# Travel Budget

A personal travel budget tracker. Organize expenses by trip and category, track what's budgeted, paid, and pending, and mark expenses paid in full to keep your remaining balance accurate.

## Features

- Create trips with destination, dates, and status (planning / active / completed)
- Add expenses per trip, organized by category (Transport, Accommodation, Food & Dining, etc.)
- Track budgeted, paid, and pending amounts per expense
- Mark an expense as **paid in full** to remove it from the remaining balance calculation
- Export and import data as JSON
- Dashboard overview across all trips

## Development

### Against the remote Supabase project

Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key (Settings → API in the Supabase dashboard).

```bash
npm install
npm run dev
```

### Against a local Supabase instance (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start        # spins up a local Postgres + Supabase stack
```

Copy the printed `API URL` and `anon key` into `.env.local` (the commented-out lines in `.env.local.example`), then run `npm run dev`. Your local data is completely separate from production.

```bash
supabase stop         # shut down when done
```

## Testing

```bash
npm test           # run once
npm run test:watch # watch mode
npm run test:ui    # browser UI
```

Tests cover the core data functions (`tripTotals`, `fmt`, `tripLabel`) and the main components (`ExpenseForm`, `TripView`).

## Tech stack

- React 19, Vite, Tailwind CSS
- Supabase (PostgreSQL database, magic link auth, Row Level Security)
- Vitest + React Testing Library
- GitHub Actions CI (runs tests on push and PRs)
- Deployed on Vercel
