# AGENTS.md

## Project overview

- This is a React 19 travel-budget SPA built with Vite and Tailwind CSS.
- Supabase provides authentication, PostgreSQL persistence, and row-level security.
- Application code lives in `src/`; tests live in `src/test/`.
- Keep application objects camelCase and convert Supabase snake_case fields in the data layer.
- Preserve the rule: remaining balance is `max(0, budgeted - paid - pending)`, or zero when fully paid.

## Commands that matter (build/test/lint)

- Use npm and preserve `package-lock.json`.
- Run the app locally with `npm run dev`.
- Run the complete test suite with `npm test`.
- Run static checks with `npm run lint`.
- Produce a release build with `npm run build`.
- Ask before adding, removing, or upgrading dependencies.

## Conventions

- Match the surrounding JavaScript and JSX style.
- Prefer single quotes, no semicolons, functional React components, and Tailwind utility classes.
- Deviate from existing style only when the change clearly benefits from it, and explain why.
- Add or update Vitest and Testing Library coverage when behavior changes.
- Keep Supabase access and database-field conversion in `src/data.js` or the data layer.
- Implement clear, scoped requests directly.
- Ask before schema changes, destructive actions, or broad architectural decisions.

## Boundaries (never touch)

- Never read, edit, replace, or expose `.env.local`.
- Never modify `.claude/`.
- Never manually modify `dist/` or `node_modules/`.
- Never edit an existing file under `supabase/migrations/`.
- Do not deploy, alter remote Supabase data, or run destructive database commands without approval.
- Do not modify dependencies or `package-lock.json` without approval.

## How to verify your work before telling me it's done

- For every code change, run `npm run lint`, `npm test`, and `npm run build`.
- For UI changes, verify the affected flow at desktop and mobile widths.
- Confirm `git diff` contains only intended changes.
- Report every failed or skipped verification step; never describe unrun checks as passing.
