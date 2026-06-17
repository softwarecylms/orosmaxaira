import type {
  CaseStudy,
  ClientLogo,
  Faq,
  Job,
  Post,
  TeamMember,
  Testimonial,
  Media,
} from '@/payload-types'

export type Link = {
  label?: string | null
  href?: string | null
  newTab?: boolean | null
}

export type RelationshipCollection =
  | 'client-logos'
  | 'testimonials'
  | 'case-studies'
  | 'posts'
  | 'jobs'
  | 'faqs'
  | 'team-members'

export type RelationshipDocMap = {
  'client-logos': ClientLogo
  testimonials: Testimonial
  'case-studies': CaseStudy
  posts: Post
  jobs: Job
  faqs: Faq
  'team-members': TeamMember
}

export type MediaRef = number | Media | null

export type RelRef<C extends RelationshipCollection> =
  | number
  | RelationshipDocMap[C]
  | null
