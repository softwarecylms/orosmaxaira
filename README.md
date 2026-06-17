# informational-template

The studio starter for **informational / marketing websites**. Clone it, rebrand it, ship it.
Every new site begins here so the architecture, the visual-editor workflow, and the quality bar
are identical across projects.

> This template ships with **example demo content** (the SoftwareCy reference build) so it runs
> out of the box and shows every block working. Rebranding per project = swap tokens, copy, assets,
> and reseed. See **"Rebrand for a new project"** below.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript + Turbopack
- **Payload CMS 3** (PostgreSQL) — admin at `/admin`. This is "the CMS".
- **Puck** (`@measured/puck`) — a drag-and-drop **visual editor** embedded *inside* the Payload
  admin. This is the "Elementor-style" page builder.
- **Tailwind CSS v4** — design tokens in the `@theme` block of `src/styles/globals.css`
- **framer-motion** — all animation, centralised in `src/lib/motion.ts`, reduced-motion safe
- **nodemailer** (contact form) · **Playwright** (one e2e spec per block) · **pnpm**
- Deploys as a Next standalone server (Vercel, or PM2/nginx on a VPS/cPanel)

## How pages work (the core idea)

Pages are **not** hand-coded routes — they're CMS documents whose body is a Puck JSON tree, edited
visually and rendered by Puck's RSC `<Render>`:

1. `Pages` collection has a `content` JSON field whose admin UI is `src/payload/admin/PuckField.tsx`
   (a full-screen Puck overlay).
2. `src/puck/config.tsx` maps each block → fields + a presentational component in `src/blocks/`.
3. `src/puck/hydrate.ts` swaps stored relationship/media IDs for full docs (depth 3) server-side.
4. `src/app/(frontend)/[slug]/page.tsx` renders the populated tree.

**Add a block:** build `src/blocks/<name>.tsx` (`<Name>Render`) → register it in `src/puck/config.tsx`
→ add it to a category → if it uses media/relationships, add it to the maps in `hydrate.ts` →
`pnpm generate:types` + a Playwright spec. New blocks need **no DB migration**.

## Quick start (local)

Requires Node 20+, pnpm 11+, and PostgreSQL 15+ (local or a cloud connection string).

```bash
pnpm install
cp .env.example .env          # then fill in DATABASE_URI + secrets
pnpm migrate                  # apply schema
pnpm seed                     # demo content (first time only)
pnpm dev                      # http://localhost:3001  (admin: /admin)
```

## Provision a brand-new project (GitHub + Vercel + Neon, one command)

`scripts/new-site.sh` creates the Neon DB, the GitHub repo, invites your team, wires Vercel, and
writes `.env`. See the header of that file for one-time setup (gh / vercel / neonctl auth).

```bash
DRY_RUN=1 PROJECT=acmecorp COLLABORATORS="alice,bob" ./scripts/new-site.sh   # review
PROJECT=acmecorp COLLABORATORS="alice,bob" ./scripts/new-site.sh             # do it
```

## Rebrand for a new project

1. **Tokens** — edit the `@theme` block in `src/styles/globals.css` (colours, fonts, radii, shadows).
   Easings/durations live there too and in `src/lib/motion.ts` (single source of truth for motion feel).
2. **Site identity** — `src/app/(frontend)/layout.tsx` (title/description/OG), `payload.config.ts`
   admin title, and the `SiteSettings` global in `/admin`.
3. **Content** — rewrite/replace the seed in `src/payload/seed/index.ts`, or just edit everything in
   `/admin`. Swap brand assets in `public/images/` and uploaded media.
4. **Blocks** — keep the ones you need; the bespoke example blocks are yours to adapt or delete.

## What's included

- The full block library in `src/blocks/` incl. the "wow" + AEO blocks: **HeroVideo** (dual MP4/WebM,
  reduced-motion poster), **KeyTakeaways**, **MetricStrip**, plus heroes, stats, services, testimonials,
  FAQ (with `FAQPage` JSON-LD), pricing/portfolio/blog blocks.
- **Motion system**: `src/lib/motion.ts` (EASE/DURATION/variants) + `ease-*` / `duration-*` tokens.
- **SEO/AEO**: `generateMetadata`, JSON-LD schema components, `sitemap.ts`, `robots.ts`, and
  **`/llms.txt` + `/llms-full.txt`** route handlers (the "sitemap for AI").
- **APIs**: `/api/contact` (nodemailer + honeypot + rate limit), `/api/revalidate` (on-demand ISR),
  `/api/puck/*` (relationship/media pickers).
- `docs/new-informational-site-prompt.md` — the Claude Code bootstrap prompt (incl. the Figma
  workflow + the opt-in Advanced Visuals layer).
- `docs/weblove-course-learnings.md` — the rationale/playbook behind the conventions.

## Quality gates

- Mobile Lighthouse: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90.
- Every block has a Playwright spec; animations respect `prefers-reduced-motion`.
- Contact form: SMTP + honeypot + per-IP rate limit.

## Deploy

Vercel (connect the repo — `new-site.sh` does this) or a Next standalone server behind PM2/nginx
(`ecosystem.config.cjs` + the README deploy notes). Payload needs a hosted Postgres in production
(Neon recommended — pooled connection string).
