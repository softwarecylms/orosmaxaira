# Weblove Academy — what we're stealing to make our sites more "wow"

Source: https://weblovecourse.netlify.app/ (Weblove Academy by "Rafael"). 14 classrooms,
3 pillars (Craft / Business / Compound), 123 public lesson pages. Mined in full on 2026-06-05
via a 137-agent read. This doc = the actionable distillation mapped to OUR stack
(Next.js 15 + Payload CMS 3 + Puck + Tailwind v4 + Framer Motion + Playwright).

> Honest framing: our stack already sits at (or above) the "ceiling" the course names —
> the Lovable + Supabase classrooms are largely N/A because Payload + Puck + Claude Code already
> IS the senior production tier, and the things Lovable "fails at" (cinematic motion, brand identity,
> performance, real content models) are exactly our differentiators. The gold for us is the
> **craft system, the motion discipline, the AEO/llms.txt channel, the polish/launch gates, and the
> packaging.** Most of it is one new Puck block, one @theme token, or one bootstrap-prompt line.

---

## The 10 highest-leverage upgrades (do these first)

1. **Premium easing as a token, applied site-wide.** The #1 amateur tell is default CSS easing.
   Add to `globals.css @theme`:
   `--ease-premium: cubic-bezier(0.22,1,0.36,1)` (Apple/Linear/Vercel feel),
   `--ease-snap: cubic-bezier(0.32,0.72,0,1)`, `--ease-bounce: cubic-bezier(0.5,1.5,0.5,1)`,
   `--duration-ui: 300ms`, `--duration-default: 600ms`. Route **every** Framer Motion transition
   through a shared `src/lib/motion.ts` that reads these. Single biggest perceived-quality win.

2. **The 80/20 stillness rule + 4 motion laws** as a hard build constraint: motion must carry
   meaning; one thing at a time; easing beats speed; always `prefers-reduced-motion`. Keep ~80% of
   the page still, animate the 20% that matters. **Max 1 "signature flourish" per page**, max ~3–5
   animations per site. Restraint reads as expensive.

3. **Install Lenis smooth-scroll** as a root-layout provider (gated behind
   `matchMedia('(prefers-reduced-motion: reduce)')`). Momentum scrolling makes a site feel
   "expensive" before a single animation fires — highest quality-per-effort in the whole course.

4. **A canonical 7-section page skeleton as Puck blocks**: Hero → Problem → How It Works →
   Featured → Social Proof → Pricing → FAQ+CTA. Pre-wired as the default starting layout for every
   informational/marketing site = proven conversion structure + instant scaffolding.

5. **A shared motion-primitive library** in `src/components/motion/`, each also a Puck block:
   `FadeUp` (opacity:0→1, y:30, whileInView once), `StaggerGroup` (staggerChildren 0.1, ~120ms
   card delay), `TextReveal`/`SplitReveal` (word/char, 50ms stagger), `NumberCounter` (count-up on
   viewport, 1.5s ease-out, tabular-nums), `MagneticButton` (damping 0.3, max 10px). All read
   `useReducedMotion()`.

6. **"Export → Bridge → Consume" asset blocks** (build once, reuse forever): `SplineHero`
   (`next/dynamic ssr:false` + dark overlay + mobile poster fallback), `RiveCanvas`
   (`@rive-app/canvas`, state machine, <200KB), `LottieIcon` (`lottie-react`, pause-below-fold via
   `useInView`), `HeroVideo` (dual MP4+WebM <2MB, required poster, reduced-motion → poster swap).
   All assets live in Payload Media.

7. **Dual-channel SEO/AEO by default.** Ship `/llms.txt` + `/llms-full.txt` (the "sitemap for AI")
   as two Next route handlers fed by Payload — 99% of agencies don't have this. Add a `KeyTakeaways`
   block + `FaqAccordion` block that emit `FAQPage` JSON-LD (Google rich snippets AND the #1
   LLM-ingested format). JSON-LD on every page (Organization/WebSite/Article/FAQPage/LocalBusiness/
   Person). Citation framing: "According to <Brand>, X."

8. **The Polish Pass as a required pre-deploy gate** (the "10% that separates pro from intern"):
   verb+specificity CTAs (ban "Learn more"/"Get started"), FAQ in customer voice, branded
   `not-found.tsx` + `error.tsx`, `GrainOverlay` (SVG noise, 3% opacity, fixed), favicon +
   apple-touch-icon, `opengraph-image.tsx`, loading skeletons on async/3D blocks, `text-wrap:balance`
   on h1–h3, branded `::selection`, custom scrollbar, `tabular-nums` in stats/pricing.

9. **Performance/SEO as automated gates, not vibes.** Wire `@lhci/cli` (`.lighthouserc.json`:
   perf ≥0.85/0.90, a11y ≥0.95, 3 runs) into CI to block merge. Hard numbers: LCP <2.5s, INP <200ms,
   CLS <0.1, hero img ≤200KB AVIF/WebP, hero video <2MB, ≤3 font weights, ≤3 lazy third-party
   scripts, animate **only** transform/opacity. The "Lighthouse JSON → Claude: 'top 3 fixes?'" loop.

10. **Productize what we already build** as priced line items + retainers (this is how the course
    turns craft into money): motion-set upsell, AI Hero/Asset packs, +CMS / +Stripe / +Auth /
    +Email tiers, SEO baseline + `llms.txt` deploy + local-SEO sprint, and a **care-plan retainer**
    pitched at handover (the real prize — LTV >> the build fee).

---

## Bootstrap-prompt v2 — concrete additions

Refactor `docs/new-informational-site-prompt.md` with these (drawn from the Claude Mastery + Design
Taste + Animations + Studio classrooms):

- **XML-structure the prompt**: `<role><context><task><constraints><output>` tags (Claude is trained
  heavily on XML → more consistent output every session).
- **A `<constraints>` "negative-space" block** (what NOT to do is more powerful than what to do):
  no inline hex/px when a token exists, no default Tailwind colours, no barrel `index` files,
  no lorem ipsum, no second animation library, no transform/opacity animation without a
  `prefers-reduced-motion` guard, no stock photos.
- **Chain-of-thought-in-tags before irreversible work**: "list reasoning in `<thinking>` before
  writing the schema/migration" → catches wrong field types/relations before a migration runs.
- **Self-Critique + Redo pass** after each generated block: "list the 5 weakest parts w/ reasons →
  rewrite 2 ways → produce final." Free QA round.
- **Screenshot-to-code at 80%+ fidelity**: paste a reference/competitor screenshot → "recreate this
  exact UI as a typed Puck block, match spacing/type/colour/layout, responsive."
- **A default battle-tested `@theme` token set** baked in: 7-token HSL palette (+ per-client accent
  swap), 8-pt spacing scale (8/16/24/32/48/64/96/128/160), fluid type at ratio 1.333 with `clamp()`,
  2 fonts + mono **self-hosted via `next/font/local`** (kill Google Fonts CDN → no CLS), tracking/
  leading tokens, the easing + duration tokens above, `--radius-*`, HSL-based shadow token.
- **"Steal structure, not style"**: kickoff step = pull 30–50 tagged references → Claude synthesis
  prompt → section-by-section architecture → map to Puck blocks. Store refs in a Payload
  `References` collection (URL, screenshot, type, industry, vibe, structuralNote), fed by a weekly
  1-hour ritual. This is our non-replicable moat vs generic AI output.
- **Library-per-concern law**: Framer Motion = component/page transitions; GSAP+ScrollTrigger =
  scrubbed/pinned scroll; Lottie = micro-interactions; R3F/Spline = 3D. "Pick one per concern.
  Mixing four is a smell." Stops Claude adding a new dep every project.
- **Enforce the type system in the CMS, not by convention**: Puck Heading/Text blocks get a `role`
  select (Display/H1/H2/Body/Small) → maps to tokens so editors can't enter arbitrary sizes; store
  the scale in a Payload `SiteTypography` global.
- **Bronze/Silver/Gold milestone gates** as internal QA: Bronze = renders on mobile; Silver = all
  blocks have real content + animations fire; Gold = Lighthouse ≥90, copy approved, SEO + hardening
  + security headers (target securityheaders.com A+ via `next.config.ts headers()`).
- **A `/prompts` (or slash-command) directory** of first-class artifacts: brief generator,
  schema generator, hero-copy-in-3-voices, pricing-table+8-FAQs, JSON-LD generator, proposal prompt.
- **Discovery gate**: a 4-paragraph brief (Who / What / Why Different / Feel) + 5-question intake
  stored in a Payload `Discovery` collection — Claude Code refuses to scaffold until filled.
- **Fork into 5 archetype variants** (restaurant / agency / portfolio / SaaS / e-commerce), each
  declaring its Payload collections, Puck block preset, day-by-day schedule, launch checklist.

---

## New Puck blocks worth building (the "wow" library)

| Block | What it does | Notes |
|---|---|---|
| `HeroGradientCover` | Space Grotesk 800 headline, 3-colour gradient text-clip, dark bg + radial blobs, clamp() 48→96px | blob colours + clamp in @theme |
| `HeroVideo` | dual MP4+WebM <2MB, required poster, `preload=metadata`, reduced-motion→poster | fade in on `canplaythrough` |
| `SplineHero` / `RiveCanvas` / `LottieIcon` | 3D / interactive / micro-motion | Export→Bridge→Consume; assets in Payload Media |
| `ScrollyCase` | pinned scrollytelling case study (`useScroll`+`useTransform`) | premium upsell tier |
| `WorkGrid` | hover-to-load video portfolio grid | `whileHover` crossfade |
| `KeyTakeaways` | amber 3–5 bullet card near top of articles | AEO citation bait + human scannability |
| `FaqAccordion` | semantic `details/summary` + `FAQPage` JSON-LD | Google snippets + LLM-ingested |
| `PillarHub` | 3,000w+ pillar w/ sticky TOC + cluster grid | topical authority |
| `AuthorBio` | credential card + `Person` JSON-LD | EEAT, critical for YMYL clients |
| `MetricStrip` | 5 KPI stats w/ count-up | report → persuasion visual |
| `PricingTable` | 3-tier + annual toggle + "Most Popular" | conversion + upsell |
| `Calculator` | ROI / quiz / mortgage interactive | high-converting; €500–2k upsell each |
| accent bar / glow-on-hover card / Callout | section divider + premium depth | shared Framer presets + @theme |

## Tools/services worth trialling

- **Lenis** (smooth scroll) — adopt as standard.
- **GSAP + ScrollTrigger** (only for scrubbed/pinned scroll), **@rive-app/canvas**, **lottie-react**,
  **Spline** / **@react-three/fiber** (3D), behind dynamic import + skeleton.
- **@lhci/cli** (Lighthouse CI gate), **next-sitemap**.
- **Plausible / Fathom / Umami** (cookie-banner-free analytics), **Sentry** (errors),
  **Better Uptime** (uptime).
- **Resend** (transactional email; pairs with our Payload form handler), **React Email** templates.
- **Cloudflare R2** for video-heavy sites (don't store MP4 on the PM2 box).
- **Self-hosted n8n** (one Docker on the existing VPS, serves all client automations at €0/mo) fired
  from Payload `afterChange` hooks → visible `automation-log` collection.
- Imagery: **Midjourney v7** (mood, `--sref` to lock one editorial look across a site), **Imagen 4**
  (exact in-image text/product fidelity), **Adobe Firefly** (commercial-safe for legal/finance/
  health), **Sora/Runway/Pika** (hero loops), **ElevenLabs/Suno** (VO/music), **Photopea** (free PS).
  Always log tool+prompt+date+license in a Payload `AI Assets` collection (provenance trail).

## Process rituals (cheap, high-trust)

- **Daily 18:00 60-sec Loom** ending with the staging URL + a cited LCP number — a referral engine
  disguised as a status update.
- **Loom handover + `HANDOFF.md`** as the Gold deliverable; sets up the retainer pitch.
- **Every launch is marketing**: submit standout sites to Awwwards (Tue/Wed) / CSSDA / Godly; a badge
  is a 20% pricing anchor. Monthly public "redesign a famous brand" → 10-tweet before/after thread
  (also stress-tests our bootstrap prompt).
- **Treat the bootstrap prompt as a living playbook** — fold back missing steps after every project.

---

## What we already do well (course confirms our stack)

Token-ized design system, `prefers-reduced-motion` everywhere, Playwright per block, Payload (not
Supabase) for data + forms, Next standalone deploy, ISR + on-demand revalidation, JSON-LD schema
components, per-page SEO. The course's value is **raising the visual ceiling (motion + 3D + polish),
adding the AEO channel, and productizing** — not replacing the architecture.
