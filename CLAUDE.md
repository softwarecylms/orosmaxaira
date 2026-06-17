# Studio starter — agent guide

Informational/marketing site template. Next.js 15 + Payload CMS 3 + Puck visual editor. Keep this tight.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4 — tokens in `src/styles/globals.css` (`@theme` block)
- Payload CMS 3 (Postgres) — admin at `/admin`
- Puck (`@measured/puck`) — drag-and-drop visual editor inside the admin (`src/payload/admin/PuckField.tsx`)
- framer-motion for animation (centralised in `src/lib/motion.ts`)
- Playwright for e2e (`pnpm test:e2e`); pnpm (lockfile committed)

## Dev server
```bash
pnpm dev    # http://localhost:3001
```
Often already running — check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/` first.

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
