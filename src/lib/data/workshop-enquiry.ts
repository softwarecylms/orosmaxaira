/**
 * The two ways a workshop can be booked (R1) — shared by the enquiry form
 * (client) and the `/api/workshop-enquiry` validation (server) so the required
 * combination rule is enforced identically on both ends.
 */
export const WORKSHOP_EXPERIENCE_KEYS = ['gnorizw', 'gnorizw-peripeteies'] as const

export type WorkshopExperienceKey = (typeof WORKSHOP_EXPERIENCE_KEYS)[number]

export const WORKSHOP_EXPERIENCES: { key: WorkshopExperienceKey; label: string }[] = [
  { key: 'gnorizw', label: 'Γνωρίζω τη μέλισσα + βιωματικό εργαστήρι' },
  {
    key: 'gnorizw-peripeteies',
    label: 'Γνωρίζω τη μέλισσα + Περιπέτειες στις Κυψέλες + βιωματικό εργαστήρι',
  },
]

export function experienceLabel(key: string): string | undefined {
  return WORKSHOP_EXPERIENCES.find((e) => e.key === key)?.label
}
