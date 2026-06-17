# Studio starter — agent guide

Informational/marketing site template. Next.js 15 + Payload CMS 3 + Puck visual editor. Keep this tight.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4 — tokens in `src/styles/globals.css` (`@theme` block)
- Payload CMS 3 (Postgres) — admin at `/admin`. Handles **content/marketing** pages.
- Medusa v2 (Postgres) — headless **commerce** backend in `medusa/`. Handles products, cart, checkout, orders. See **Commerce** below.
- Puck (`@measured/puck`) — drag-and-drop visual editor inside the admin (`src/payload/admin/PuckField.tsx`)
- framer-motion for animation (centralised in `src/lib/motion.ts`)
- Playwright for e2e (`pnpm test:e2e`); pnpm (lockfile committed)

## Dev server
```bash
pnpm dev    # http://localhost:3009   (storefront; Payload admin at /admin)
```
Often already running — check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3009/` first.
> Ports 3001/9000 are used by other local projects on this machine, so this
> project runs the storefront on **3009** and the Medusa backend on **9009**.
> The Medusa backend lives in `medusa/` and is started separately — see **Commerce** below.

## Project layout
```
src/
  app/(frontend)/   Frontend routes + layout, [slug] catch-all
  app/(payload)/    Payload admin
  app/llms.txt/     + llms-full.txt — AEO manifests (route handlers)
  blocks/           One file per page block — exports <Name>Render (presentational, no data fetching)
  components/        ui/ (Button, Section, Accordion), motion/ (Reveal, Counter, …), layout/, seo/
  lib/              motion.ts (EASE/DURATION/variants), cms.ts, seo.ts, utils.ts
  puck/             config.tsx (blocks), adapters.ts, adapt.ts, hydrate.ts, types.ts
  payload/          config, collections, globals, fields, hooks, admin/PuckField, seed
  styles/globals.css Design tokens (@theme)
e2e/                Playwright specs (one per block)
docs/               new-informational-site-prompt.md (bootstrap), weblove-course-learnings.md
scripts/            new-site.sh (provision GitHub+Vercel+Neon), post-build.mjs
```

## Add a block (the contract)
1. Build `src/blocks/<name>.tsx` exporting `<Name>Render` (takes hydrated data; never fetch inside a block).
2. Add it to `PuckProps` + `components` in `src/puck/config.tsx` (fields, defaultProps, render adapter).
3. Register the name under a `categories` group.
4. If it uses media/relationships, add it to `componentMediaMap` / `componentRelMap` in `src/puck/hydrate.ts`.
5. `pnpm generate:types` + add an `e2e/<name>.spec.ts`. (No DB migration needed — content is JSON.)

## Commerce (Medusa eshop)
Two backends, clear split: **Payload = content**, **Medusa = commerce**. The Next.js app is the
storefront for both — it renders CMS pages *and* talks to Medusa's Store API.

- **Backend** lives in `medusa/` (a Turborepo; the app is `medusa/apps/backend`, Medusa v2).
  ```bash
  cd medusa && npm run dev        # Medusa on http://localhost:9009  (admin: /app)
  ```
  Its own `.env` (gitignored) holds `DATABASE_URL` (DB `medusa_orosmaxaira`), CORS, `PORT=9009`.
  Admin login: `admin@orosmaxaira.com`. Uses npm (not pnpm — Medusa dislikes pnpm's layout) and
  in-memory event bus/cache in dev (no Redis). Seed data (4 demo products, Europe/EUR region) is
  auto-applied on `npx medusa db:migrate` via `src/migration-scripts/initial-data-seed.ts`.
- **Storefront integration** (all Store API calls are server-side):
  - `src/lib/medusa/` — `client.ts` (SDK), `region.ts` (single default region), `products.ts`,
    `prices.ts` (v2 prices are **decimals, not cents**), `cookies.ts` (cart id cookie),
    `actions.ts` (`'use server'`: cart + checkout mutations).
  - Routes under `src/app/(frontend)/`: `shop/` (grid), `shop/[handle]/` (detail + add-to-cart),
    `cart/`, `checkout/` (address → shipping → place order), `order/[id]/` (confirmation).
  - Components in `src/components/commerce/`.
- **Env** (storefront `.env`): `MEDUSA_BACKEND_URL=http://localhost:9009`,
  `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...` (Medusa admin → Settings → Publishable API keys).
- **Add/manage products**: do it in the Medusa admin (`:9009/app`), not in code. No storefront
  changes needed — `/shop` lists whatever is published to the sales channel.
- Payment in dev uses Medusa's **system default provider** (`pp_system_default`) — no real charge.
  Add Stripe (or another provider) before going live.

## Conventions
- Tokens > arbitrary values. Add to the `@theme` block; never inline a hex/px that should be a token.
- Motion: import easings/variants from `src/lib/motion.ts` — never inline a cubic-bezier or duration.
  Respect `useReducedMotion()` everywhere; ~80/20 stillness; max one signature flourish per page.
- Reuse `src/components/ui/*` and `src/components/motion/*` — don't create parallel primitives.
- Display font for big headings/stats; never fake it with `font-bold`.
- Every new block in `src/blocks/` gets a Playwright spec.

## After a Payload schema change
`pnpm generate:types`, then `pnpm migrate:create` + `pnpm migrate`.

## Common commands
```bash
pnpm dev                                   # dev server (3001)
pnpm test:e2e                               # all Playwright tests
pnpm test:e2e e2e/<block>.spec.ts           # one spec
pnpm generate:types                         # regen payload-types.ts
pnpm seed                                   # reseed DB (demo content)
```
