# Travel Budget

A personal travel budget tracker. Organize expenses by trip and category, track what's budgeted, paid, and pending, and mark expenses paid in full to keep your remaining balance accurate.

## Features

- Create blank trips or start from International, Domestic + Flight, and Domestic + Drive templates
- Set each trip's destination, dates, and status (planning / active / completed)
- Add expenses per trip, organized by category (Transport, Accommodation, Food & Dining, etc.)
- Track budgeted, paid, and pending amounts per expense
- Mark an expense as **paid in full** to remove it from the remaining balance calculation
- Export and import data as JSON
- Dashboard overview across all trips

## Development

### Against the remote Supabase project

Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key (Settings → API in the Supabase dashboard).

To use magic-link authentication locally, add the origin printed by Vite followed by `/**` under Authentication → URL Configuration → Redirect URLs in the Supabase dashboard. This is normally `http://localhost:5173/**`, but Vite may select another port when that one is occupied. Request a new magic link after starting the app; each link returns to the origin where sign-in began, while previously generated links retain their original redirect.

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
npm run lint       # static checks
npm test           # run tests once
npm run build      # production build
npm run test:watch # tests in watch mode
npm run test:ui    # tests in the browser UI
```

Tests cover the data layer, authentication, trip templates, expense calculations, and the main application components.

## Tech stack

- React 19, Vite, Tailwind CSS
- Supabase (PostgreSQL database, magic link auth, Row Level Security)
- Vitest + React Testing Library
- GitHub Actions CI (runs tests on push and PRs)
- Deployed on Vercel
