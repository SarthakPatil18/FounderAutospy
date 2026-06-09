# FounderAutopsy

A full-stack knowledge base where founders document their own startup shutdowns — and AI (Gemini 1.5 Flash) performs a structured autopsy: root cause, contributing factors, failure tags, and a clinical verdict.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/pivot-vault run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GEMINI_API_KEY`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + wouter + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Google Gemini 1.5 Flash (async autopsy after POST /startups)
- Auth: Clerk (Replit-managed, cookie-based via `@clerk/express` + proxy middleware)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Charts: Recharts (Insights page)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/startups.ts` — single source of truth for the DB schema
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `artifacts/api-server/src/lib/gemini.ts` — Gemini autopsy helper
- `artifacts/api-server/src/routes/` — startups.ts, insights.ts, index.ts
- `artifacts/pivot-vault/src/pages/` — home, explore, startup-detail, submit, insights
- `artifacts/pivot-vault/src/components/` — startup-card, layout/nav, ui/*

## Architecture decisions

- AI autopsy runs **async after** POST /startups returns 201 — no blocking the form submit
- Autopsy results stored back to the same row (aiRootCause, aiFactors, aiTags, aiVerdict)
- Clerk auth is cookie-based via proxy middleware — no Bearer tokens in frontend
- All API hooks generated from OpenAPI spec via Orval — never hand-written
- Similarity matching uses tag overlap + industry match scoring (no vector embeddings needed at this scale)

## Product

- **Home**: Hero, value prop, recent postmortems grid, live stats
- **Explore**: Search + filter by industry, failure type, year — card grid
- **Postmortem detail**: Full story, what failed, AI autopsy panel (root cause + factors + tags + verdict), similar failures
- **Submit**: 5-step form gated by Clerk sign-in — submits to API, triggers async Gemini autopsy
- **Insights**: Data dashboard — top failure reasons bar chart, industry donut, shutdowns by year timeline

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Clerk proxy middleware must stay mounted before `clerkMiddleware()` in Express
- Gemini response sometimes wraps JSON in markdown fences — `gemini.ts` strips them before parsing
- `pnpm --filter @workspace/db run push` is dev-only; production needs a migration script
- `tailwindcss({ optimize: false })` is intentional — avoids Clerk class purging

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/clerk-auth` for Clerk proxy and publishable key resolution patterns
