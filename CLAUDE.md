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
  blocks/           blog-post.tsx (Payload post template)
  components/sections/ Page sections (content in via props) — also the Puck blocks
  components/        ui/ (Button, Section, Accordion), motion/ (Reveal, Counter, …), layout/, seo/
  lib/              motion.ts (EASE/DURATION/variants), cms.ts, seo.ts, utils.ts
  puck/             config.tsx (visual editor blocks)
  payload/          collections, globals, fields, hooks, admin/ (PuckField, branding)
  styles/globals.css Design tokens (@theme)
e2e/                Playwright specs (one per block)
docs/               new-informational-site-prompt.md (bootstrap), weblove-course-learnings.md
scripts/            new-site.sh (provision GitHub+Vercel+Neon), post-build.mjs
```

## Page sections & blocks
The site's sections take their copy as a `content` prop and fetch nothing themselves
(`src/components/sections/*`, `src/components/home/*-view.tsx`); a thin server wrapper loads
the copy. That is what lets the Puck visual editor render the real sections. The generic
template blocks were removed; the site's own sections are being registered in `src/puck/config.tsx`.

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

## Where content is edited
**Payload** (`/admin`) = pages, blog articles, site settings. **Medusa** (`/app`) = products,
categories, coupons, orders, activities, workshops, school visits. Both admins are noindex; Payload's
sidebar links to the Medusa sections. Content is bilingual (Payload localization el/en).
- **Pages** (Payload → Pages): title, link (slug), SEO, and the **Visual Editor** (Puck). Every content
  route renders its Payload page through `<ManagedPage>` (`src/lib/cms/pages.tsx`) when
  `PAGES_SOURCE=payload`; otherwise (or if the page has no content) its built-in composition. New
  pages created in Payload render at `/<slug>` via the catch-all.
- **Blocks** = the site's real sections (`src/puck/blocks.tsx`); fields are generated from each
  section's default copy (`src/puck/fields/derive.ts`, Greek labels in `labels.ts`). A new section:
  make it take `content` props, add it to `BLOCKS`, and to `src/puck/block-labels.ts`.
- **Editor**: `/editor/<locale>` (`src/app/(editor)`, `src/puck/editor.tsx`) runs inside the admin
  overlay (`src/payload/admin/PuckField.tsx`) and syncs by postMessage; Payload saves drafts,
  publishes and keeps versions. Live data (prices, newest articles) comes from `src/puck/live.server.ts`.
- **Seed/re-seed** pages from the built-in copy: `npx tsx scripts/seed-payload-pages.mts`
  (skips existing pages; `FORCE=1`, `ONLY=<slug>`). The `*-content.ts` files are the defaults for new
  blocks and the fallback — editing them does not change pages already in Payload.
- The Medusa "content" module (`medusa/apps/backend/src/modules/content`) is retired (to remove; keep
  its `media_asset`). Uploads in Payload go to Vercel Blob (`BLOB_READ_WRITE_TOKEN`).

## Conventions
- Tokens > arbitrary values. Add to the `@theme` block; never inline a hex/px that should be a token.
- Motion: import easings/variants from `src/lib/motion.ts` — never inline a cubic-bezier or duration.
  Respect `useReducedMotion()` everywhere; ~80/20 stillness; max one signature flourish per page.
- Reuse `src/components/ui/*` and `src/components/motion/*` — don't create parallel primitives.
- Display font for big headings/stats; never fake it with `font-bold`.

## After a Payload schema change
`pnpm generate:types`, then `pnpm migrate:create` + `pnpm migrate`.

## Common commands
```bash
pnpm dev                                   # dev server (3001)
pnpm test:e2e                               # all Playwright tests
pnpm test:e2e e2e/<block>.spec.ts           # one spec
pnpm generate:types                         # regen payload-types.ts
```
