/**
 * Single source of truth for motion feel across the site.
 *
 * Why this exists: easing/duration were previously hardcoded in every motion
 * component. Centralising them here (and mirroring the easings as `ease-*`
 * utilities in the globals.css @theme block) means one tuning knob for the
 * whole site's "feel" — the highest-leverage craft lever there is.
 *
 * This file is intentionally framework-data only (no 'use client'); the
 * constants are plain values + framer-motion variant objects, importable from
 * both server and client components.
 */
import type { Transition, Variants } from 'framer-motion'

/** A cubic-bezier easing tuple (mutable, so framer-motion's `ease` accepts it). */
type Bezier = [number, number, number, number]

/**
 * Curated easing set — pick by INTENT, not vibes. Keep it small.
 * Mirrored in globals.css @theme as --ease-soft / --ease-emphasis /
 * --ease-snap / --ease-bounce (usable as Tailwind `ease-*` utilities).
 */
export const EASE = {
  /** Default reveal/scroll ease — the default signature. Gentle settle. */
  soft: [0.22, 0.61, 0.36, 1] as Bezier,
  /** Hero / storytelling moments — a more pronounced, "expensive" settle (easeOutQuint-ish). */
  emphasis: [0.22, 1, 0.36, 1] as Bezier,
  /** UI state changes (tabs, menus, toggles) — the Linear/Vercel snap. */
  snap: [0.32, 0.72, 0, 1] as Bezier,
  /** Playful accents only — overshoots. Use sparingly. */
  bounce: [0.5, 1.5, 0.5, 1] as Bezier,
}

/** Durations in seconds (framer-motion units). */
export const DURATION = {
  fast: 0.25,
  ui: 0.3,
  base: 0.55,
  slow: 0.8,
} as const

export const defaultTransition: Transition = {
  duration: DURATION.base,
  ease: EASE.soft,
}

/** Subtle fade+rise — the default reveal. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

/** Larger travel — for hero/feature entrances. */
export const fadeUpLg: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

/** Parent variant that staggers its children's `visible` transitions. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}
