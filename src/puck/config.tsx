import type { Config } from '@measured/puck'
import * as React from 'react'

import { HeroHomeRender } from '@/blocks/hero-home'
import { HeroInnerRender } from '@/blocks/hero-inner'
import { HeroContactRender } from '@/blocks/hero-contact'
import { HeroAboutRender } from '@/blocks/hero-about'
import { StatsCardsRender } from '@/blocks/stats-cards'
import { ServicesGridRender } from '@/blocks/services-grid'
import { DarkFeatureBandRender } from '@/blocks/dark-feature-band'
import { TestimonialsRowRender } from '@/blocks/testimonials-row'
import { FeatureListChartRender } from '@/blocks/feature-list-chart'
import { PortfolioStripRender } from '@/blocks/portfolio-strip'
import { BlogTeaserRender } from '@/blocks/blog-teaser'
import { TeamGridRender } from '@/blocks/team-grid'
import { ContactCardsRender } from '@/blocks/contact-cards'
import { ContactFormMapRender } from '@/blocks/contact-form-map'
import { FaqSectionRender } from '@/blocks/faq-section'
import { ThankYouRender } from '@/blocks/thank-you'
import { PortfolioArchive } from '@/blocks/portfolio-archive'
import { BlogIndexRender } from '@/blocks/blog-index'
import { HeroVideoRender } from '@/blocks/hero-video'
import { KeyTakeawaysRender } from '@/blocks/key-takeaways'
import { MetricStripRender } from '@/blocks/metric-strip'

import { linkField, mediaField, relField } from './adapters'
import { adaptRefArray, adaptMedia, adaptCard } from './adapt'
import type { Link } from './types'

type RefArray = Array<{ ref: number | null }>

export type PuckProps = {
  HeroHome: {
    eyebrow?: string
    heading: string
    subheading?: string
    primaryCta?: Link
    logos?: RefArray
  }
  HeroInner: {
    eyebrow?: string
    heading: string
    body?: string
    cta?: Link
    image?: number | null
    bullets?: Array<{ text: string }>
  }
  HeroContact: {
    heading: string
    bullets?: Array<{ text: string }>
    teamMember?: {
      name?: string
      role?: string
      photo?: number | null
      cta?: Link
    }
    heroImage?: number | null
    logosLabel?: string
    logos?: RefArray
  }
  HeroAbout: {
    heading: string
    body?: string
    cta?: Link
    heroImage?: number | null
    logosLabel?: string
    logos?: RefArray
  }
  StatsCards: {
    cards?: Array<{
      variant: 'growth' | 'gauge' | 'person'
      value?: string
      label?: string
      caption?: string
      image?: number | null
      link?: Link
    }>
  }
  ServicesGrid: {
    eyebrow?: string
    heading: string
    subheading?: string
    items?: Array<{
      icon: 'design' | 'seo' | 'shop' | 'performance' | 'branding' | 'support'
      title: string
      description: string
      cta?: Link
    }>
  }
  DarkFeatureBand: {
    eyebrow?: string
    heading?: string
    image?: number | null
    stats?: Array<{ value: string; label: string }>
  }
  TestimonialsRow: {
    eyebrow?: string
    heading?: string
    testimonials?: RefArray
    layout?: 'split' | 'full'
  }
  FeatureListChart: {
    heading: string
    body?: string
    image?: number | null
    bullets?: Array<{ text: string }>
    primaryCta?: Link
    secondaryHeading?: string
    secondaryBody?: string
    secondaryCta?: Link
  }
  PortfolioStrip: {
    eyebrow?: string
    heading?: string
    items?: RefArray
    ctaLabel?: string
    ctaHref?: string
  }
  BlogTeaser: {
    eyebrow?: string
    heading?: string
    mode?: 'latest' | 'manual'
    posts?: RefArray
    limit?: number
  }
  TeamGrid: {
    eyebrow?: string
    heading?: string
    subheading?: string
    members?: RefArray
  }
  ContactCards: {
    eyebrow?: string
    heading?: string
    subheading?: string
    cards?: Array<{
      icon: 'mail' | 'phone' | 'office'
      title: string
      description?: string
      value: string
      href?: string
    }>
  }
  ContactFormMap: {
    formHeading: string
    formBody?: string
    consentText?: string
    mapHeading?: string
    mapBody?: string
    mapImage?: number | null
    mapLink?: string
  }
  FaqSection: {
    heading?: string
    subheading?: string
    image?: number | null
    faqs?: RefArray
    sidePanel?: {
      eyebrow?: string
      heading?: string
      body?: string
      cta?: Link
      image?: number | null
    }
    panelImageFallback?: string
  }
  ThankYou: {
    eyebrow?: string
    heading: string
    body?: string
    nextSteps?: Array<{ text: string }>
    primaryCta?: Link
    secondaryCta?: Link
  }
  PortfolioArchiveBlock: {
    heading?: string
    subheading?: string
    items?: RefArray
  }
  BlogIndexBlock: {
    heading?: string
    subheading?: string
    posts?: RefArray
  }
  HeroVideo: {
    eyebrow?: string
    heading?: string
    subheading?: string
    mp4Src?: string
    webmSrc?: string
    poster?: number | null
    posterFallback?: string
    primaryCta?: Link
    overlay?: 'none' | 'dark' | 'gradient'
    height?: 'screen' | 'large' | 'medium'
  }
  KeyTakeaways: {
    label?: string
    heading?: string
    items?: Array<{ text: string }>
  }
  MetricStrip: {
    eyebrow?: string
    heading?: string
    tone?: 'light' | 'dark'
    metrics?: Array<{
      value: string
      label?: string
      delta?: string
      trend?: 'up' | 'down' | 'none'
    }>
  }
}

const iconOptions = [
  { label: 'Design', value: 'design' },
  { label: 'SEO', value: 'seo' },
  { label: 'Shop', value: 'shop' },
  { label: 'Performance', value: 'performance' },
  { label: 'Branding', value: 'branding' },
  { label: 'Support', value: 'support' },
]

const contactIconOptions = [
  { label: 'Email', value: 'mail' },
  { label: 'Phone', value: 'phone' },
  { label: 'Office', value: 'office' },
]

const cardVariantOptions = [
  { label: 'Growth chart', value: 'growth' },
  { label: 'Performance gauge', value: 'gauge' },
  { label: 'Person / image', value: 'person' },
]

const blogModeOptions = [
  { label: 'Latest posts', value: 'latest' },
  { label: 'Manual selection', value: 'manual' },
]

const testimonialsLayoutOptions = [
  { label: 'Split (with journey panel)', value: 'split' },
  { label: 'Full width', value: 'full' },
]

const heroVideoOverlayOptions = [
  { label: 'Gradient (bottom)', value: 'gradient' },
  { label: 'Dark wash', value: 'dark' },
  { label: 'None', value: 'none' },
]

const heroVideoHeightOptions = [
  { label: 'Large', value: 'large' },
  { label: 'Full screen', value: 'screen' },
  { label: 'Medium', value: 'medium' },
]

const metricToneOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark band', value: 'dark' },
]

const metricTrendOptions = [
  { label: 'Up', value: 'up' },
  { label: 'Down', value: 'down' },
  { label: 'None', value: 'none' },
]

export const puckConfig = {
  root: {
    render: ({ children }: { children?: React.ReactNode }) => (
      <>
        <style>{`
          html, body { margin: 0; background: #fcf2f0; color: #1d1d1f; font-family: var(--font-sans, 'Plus Jakarta Sans', system-ui, sans-serif); }
        `}</style>
        <div className="bg-background text-foreground min-h-screen antialiased">
          {children}
        </div>
      </>
    ),
  },
  categories: {
    hero: {
      title: 'Hero',
      components: ['HeroHome', 'HeroVideo', 'HeroInner', 'HeroContact', 'HeroAbout'],
    },
    content: {
      title: 'Content',
      components: [
        'StatsCards',
        'MetricStrip',
        'ServicesGrid',
        'DarkFeatureBand',
        'FeatureListChart',
        'KeyTakeaways',
      ],
    },
    listings: {
      title: 'Listings',
      components: [
        'TestimonialsRow',
        'PortfolioStrip',
        'BlogTeaser',
        'TeamGrid',
        'FaqSection',
      ],
    },
    contact: { title: 'Contact', components: ['ContactCards', 'ContactFormMap'] },
    archives: {
      title: 'Archives',
      components: ['PortfolioArchiveBlock', 'BlogIndexBlock'],
    },
    legacy: { title: 'Legacy', components: ['ThankYou'] },
  },
  components: {
    HeroHome: {
      label: 'Hero — Home',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        primaryCta: linkField('Primary CTA'),
        logos: relField('client-logos', { label: 'Client logos' }),
      },
      defaultProps: {
        heading: 'Your headline here',
        eyebrow: 'Your eyebrow text',
        subheading: '',
        primaryCta: { label: 'Request a callback', href: '/contact', newTab: false },
        logos: [],
      },
      render: ({ eyebrow, heading, subheading, primaryCta, logos }) => (
        <HeroHomeRender
          block={{
            eyebrow,
            heading,
            subheading,
            primaryCta,
            logos: adaptRefArray(logos),
          }}
        />
      ),
    },
    HeroContact: {
      label: 'Hero — Contact',
      fields: {
        heading: { type: 'textarea', label: 'Heading (use line breaks)' },
        bullets: {
          type: 'array',
          label: 'Bullets',
          arrayFields: { text: { type: 'text', label: 'Text' } },
          defaultItemProps: { text: 'New bullet' },
          getItemSummary: (b) => b?.text || 'Bullet',
        },
        teamMember: {
          type: 'object',
          label: 'Team member card',
          objectFields: {
            name: { type: 'text', label: 'Name' },
            role: { type: 'text', label: 'Role' },
            photo: mediaField('Photo'),
            cta: linkField('CTA'),
          },
        },
        heroImage: mediaField('Hero image (right)'),
        logosLabel: { type: 'text', label: 'Logos label' },
        logos: relField('client-logos', { label: 'Client logos' }),
      },
      defaultProps: {
        heading: 'Get in Touch With\nOur Team',
        bullets: [],
        logosLabel: 'Trusted by businesses worldwide',
        logos: [],
      },
      render: ({ heading, bullets, teamMember, heroImage, logosLabel, logos }) => (
        <HeroContactRender
          block={{
            heading,
            bullets,
            teamMember: teamMember
              ? { ...teamMember, photo: adaptMedia(teamMember.photo) }
              : undefined,
            heroImage: adaptMedia(heroImage),
            logosLabel,
            logos: adaptRefArray(logos),
          }}
        />
      ),
    },
    HeroAbout: {
      label: 'Hero — About',
      fields: {
        heading: { type: 'textarea', label: 'Heading (use line breaks)' },
        body: { type: 'textarea', label: 'Body (use blank lines between paragraphs)' },
        cta: linkField('CTA'),
        heroImage: mediaField('Hero image (left)'),
        logosLabel: { type: 'text', label: 'Logos label' },
        logos: relField('client-logos', { label: 'Client logos' }),
      },
      defaultProps: {
        heading: 'Your headline here',
        logosLabel: 'Trusted by great companies',
      },
      render: ({ heading, body, cta, heroImage, logosLabel, logos }) => (
        <HeroAboutRender
          block={{
            heading,
            body,
            cta,
            heroImage: adaptMedia(heroImage),
            logosLabel,
            logos: adaptRefArray(logos),
          }}
        />
      ),
    },
    HeroInner: {
      label: 'Hero — Inner',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        body: { type: 'textarea', label: 'Body' },
        cta: linkField('CTA'),
        image: mediaField('Hero image'),
        bullets: {
          type: 'array',
          label: 'Bullets',
          arrayFields: {
            text: { type: 'text', label: 'Text' },
          },
          defaultItemProps: { text: 'New bullet' },
          getItemSummary: (b) => b?.text || 'Bullet',
        },
      },
      defaultProps: {
        heading: 'Section heading',
        bullets: [],
      },
      render: ({ eyebrow, heading, body, cta, image, bullets }) => (
        <HeroInnerRender
          block={{
            eyebrow,
            heading,
            body,
            cta,
            image: adaptMedia(image),
            bullets,
          }}
        />
      ),
    },
    StatsCards: {
      label: 'Stats Cards',
      fields: {
        cards: {
          type: 'array',
          label: 'Cards',
          min: 1,
          max: 4,
          arrayFields: {
            variant: { type: 'select', label: 'Variant', options: cardVariantOptions },
            value: { type: 'text', label: 'Value' },
            label: { type: 'text', label: 'Label' },
            caption: { type: 'textarea', label: 'Caption' },
            image: mediaField('Image (person variant)'),
            link: linkField('Card link'),
          },
          defaultItemProps: {
            variant: 'growth',
            value: '+150%',
            label: 'Average Organic Growth',
            link: { label: '', href: '', newTab: false },
          } as never,
          getItemSummary: (c) => `${c?.variant ?? 'card'} — ${c?.label ?? ''}`,
        },
      },
      defaultProps: {
        cards: [],
      },
      render: ({ cards }) => (
        <StatsCardsRender
          block={{
            cards: (cards ?? []).map((c) => adaptCard(c)),
          }}
        />
      ),
    },
    ServicesGrid: {
      label: 'Services Grid',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        items: {
          type: 'array',
          label: 'Services',
          min: 1,
          max: 6,
          arrayFields: {
            icon: { type: 'select', label: 'Icon', options: iconOptions },
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
            cta: linkField('CTA'),
          },
          defaultItemProps: {
            icon: 'design',
            title: 'New service',
            description: 'Describe this service.',
          } as never,
          getItemSummary: (i) => i?.title || i?.icon || 'Service',
        },
      },
      defaultProps: {
        heading: 'Grow your business online',
        items: [],
      },
      render: (props) => <ServicesGridRender block={props} />,
    },
    DarkFeatureBand: {
      label: 'Dark Feature Band',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        image: mediaField('Side image'),
        stats: {
          type: 'array',
          label: 'Stats',
          min: 1,
          max: 6,
          arrayFields: {
            value: { type: 'text', label: 'Value' },
            label: { type: 'text', label: 'Label' },
          },
          defaultItemProps: { value: '100+', label: 'Projects' },
          getItemSummary: (s) => `${s?.value ?? ''} ${s?.label ?? ''}`,
        },
      },
      defaultProps: {
        stats: [],
      },
      render: ({ eyebrow, heading, image, stats }) => (
        <DarkFeatureBandRender
          block={{ eyebrow, heading, image: adaptMedia(image), stats }}
        />
      ),
    },
    TestimonialsRow: {
      label: 'Testimonials Row',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        testimonials: relField('testimonials', { label: 'Testimonials' }),
        layout: { type: 'select', label: 'Layout', options: testimonialsLayoutOptions },
      },
      defaultProps: {
        testimonials: [],
        layout: 'split',
      },
      render: ({ eyebrow, heading, testimonials, layout }) => (
        <TestimonialsRowRender
          block={{
            eyebrow,
            heading,
            testimonials: adaptRefArray(testimonials),
            layout,
          }}
        />
      ),
    },
    FeatureListChart: {
      label: 'Feature List + Chart',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        body: { type: 'textarea', label: 'Body' },
        image: mediaField('Lifestyle image'),
        bullets: {
          type: 'array',
          label: 'Bullets',
          arrayFields: {
            text: { type: 'text', label: 'Text' },
          },
          defaultItemProps: { text: 'New bullet' },
          getItemSummary: (b) => b?.text || 'Bullet',
        },
        primaryCta: linkField('Primary CTA'),
        secondaryHeading: { type: 'text', label: 'Secondary heading' },
        secondaryBody: { type: 'textarea', label: 'Secondary body' },
        secondaryCta: linkField('Secondary CTA'),
      },
      defaultProps: {
        heading: 'Next generation website design service',
        bullets: [],
      },
      render: (props) => (
        <FeatureListChartRender
          block={{
            ...props,
            image: adaptMedia(props.image),
          }}
        />
      ),
    },
    PortfolioStrip: {
      label: 'Portfolio Strip',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        items: relField('case-studies', { label: 'Case studies' }),
        ctaLabel: { type: 'text', label: 'CTA label' },
        ctaHref: { type: 'text', label: 'CTA href' },
      },
      defaultProps: { items: [], ctaLabel: 'View All', ctaHref: '/portfolio' },
      render: ({ eyebrow, heading, items, ctaLabel, ctaHref }) => (
        <PortfolioStripRender
          block={{ eyebrow, heading, items: adaptRefArray(items), ctaLabel, ctaHref }}
        />
      ),
    },
    BlogTeaser: {
      label: 'Blog Teaser',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        mode: { type: 'radio', label: 'Mode', options: blogModeOptions },
        limit: { type: 'number', label: 'Limit (latest mode)' },
        posts: relField('posts', { label: 'Posts (manual mode)' }),
      },
      defaultProps: {
        heading: 'Latest News From Our Blog',
        mode: 'latest',
        limit: 3,
        posts: [],
      },
      render: ({ eyebrow, heading, mode, posts, limit }) => (
        <BlogTeaserRender
          block={{
            eyebrow,
            heading,
            mode,
            limit,
            posts: adaptRefArray(posts),
          }}
        />
      ),
    },
    TeamGrid: {
      label: 'Team Grid',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        members: relField('team-members', { label: 'Team members' }),
      },
      defaultProps: { members: [] },
      render: ({ eyebrow, heading, subheading, members }) => (
        <TeamGridRender
          block={{ eyebrow, heading, subheading, members: adaptRefArray(members) }}
        />
      ),
    },
    ContactCards: {
      label: 'Contact Cards',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        cards: {
          type: 'array',
          label: 'Cards',
          min: 1,
          max: 4,
          arrayFields: {
            icon: { type: 'select', label: 'Icon', options: contactIconOptions },
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
            value: { type: 'text', label: 'Value' },
            href: { type: 'text', label: 'Link (optional)' },
          },
          defaultItemProps: {
            icon: 'mail',
            title: 'Email',
            value: 'hello@example.com',
          } as never,
          getItemSummary: (c) => c?.title || c?.icon || 'Card',
        },
      },
      defaultProps: {
        cards: [],
      },
      render: (props) => <ContactCardsRender block={props} />,
    },
    ContactFormMap: {
      label: 'Contact Form + Map',
      fields: {
        formHeading: { type: 'text', label: 'Form heading' },
        formBody: { type: 'textarea', label: 'Form body' },
        consentText: { type: 'textarea', label: 'Consent text' },
        mapHeading: { type: 'text', label: 'Map heading' },
        mapBody: { type: 'textarea', label: 'Map body' },
        mapImage: mediaField('Static map image'),
        mapLink: { type: 'text', label: 'Google Maps URL' },
      },
      defaultProps: {
        formHeading: 'Get in Touch',
        mapHeading: 'Visit Our Office',
      },
      render: (props) => (
        <ContactFormMapRender
          block={{ ...props, mapImage: adaptMedia(props.mapImage) }}
        />
      ),
    },
    FaqSection: {
      label: 'FAQ Section',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        image: mediaField('Side image'),
        faqs: relField('faqs', { label: 'FAQs' }),
        sidePanel: {
          type: 'object',
          label: 'Side panel (contact layout)',
          objectFields: {
            eyebrow: { type: 'text', label: 'Eyebrow' },
            heading: { type: 'text', label: 'Heading' },
            body: { type: 'textarea', label: 'Body' },
            cta: linkField('CTA'),
            image: mediaField('Panel image'),
          },
        },
        panelImageFallback: { type: 'text', label: 'Fallback panel image path (static)' },
      },
      defaultProps: {
        heading: 'Frequently Asked Questions',
        faqs: [],
      },
      render: ({ heading, subheading, image, faqs, sidePanel, panelImageFallback }) => (
        <FaqSectionRender
          block={{
            heading,
            subheading,
            image: adaptMedia(image),
            faqs: adaptRefArray(faqs),
            panelImageFallback,
            sidePanel: sidePanel
              ? {
                  ...sidePanel,
                  image: adaptMedia(sidePanel.image),
                }
              : undefined,
          }}
        />
      ),
    },
    PortfolioArchiveBlock: {
      label: 'Portfolio Archive',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        items: relField('case-studies', { label: 'Case studies (empty = all)' }),
      },
      defaultProps: {
        heading: 'Our Portfolio',
        items: [],
      },
      render: ({ heading, subheading, items }) => (
        <PortfolioArchive
          heading={heading}
          subheading={subheading}
          items={adaptRefArray(items) as never}
        />
      ),
    },
    BlogIndexBlock: {
      label: 'Blog Index',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        posts: relField('posts', { label: 'Posts (empty = all)' }),
      },
      defaultProps: {
        heading: 'Latest News From Our Blog',
        posts: [],
      },
      render: ({ heading, subheading, posts }) => (
        <BlogIndexRender
          heading={heading}
          subheading={subheading}
          posts={adaptRefArray(posts) as never}
        />
      ),
    },
    ThankYou: {
      label: 'Thank-you',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        body: { type: 'textarea', label: 'Body' },
        nextSteps: {
          type: 'array',
          label: 'Next steps (checklist)',
          arrayFields: { text: { type: 'text', label: 'Text' } },
          defaultItemProps: { text: 'Next step' },
          getItemSummary: (s) => s?.text || 'Next step',
        },
        primaryCta: linkField('Primary CTA'),
        secondaryCta: linkField('Secondary CTA'),
      },
      defaultProps: {
        heading: 'Thank you!',
        primaryCta: { label: 'Back to home', href: '/', newTab: false },
      },
      render: ({ eyebrow, heading, body, nextSteps, primaryCta, secondaryCta }) => (
        <ThankYouRender
          block={{ eyebrow, heading, body, nextSteps, primaryCta, secondaryCta }}
        />
      ),
    },
    HeroVideo: {
      label: 'Hero — Video',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'textarea', label: 'Heading (use line breaks)' },
        subheading: { type: 'textarea', label: 'Subheading' },
        mp4Src: { type: 'text', label: 'MP4 URL (/video/hero.mp4 or CDN)' },
        webmSrc: { type: 'text', label: 'WebM URL (optional, smaller)' },
        poster: mediaField('Poster image (shown first + reduced-motion)'),
        posterFallback: { type: 'text', label: 'Poster fallback path (static)' },
        primaryCta: linkField('Primary CTA'),
        overlay: { type: 'select', label: 'Overlay', options: heroVideoOverlayOptions },
        height: { type: 'select', label: 'Height', options: heroVideoHeightOptions },
      },
      defaultProps: {
        heading: 'Your headline here',
        overlay: 'gradient',
        height: 'large',
      },
      render: ({ eyebrow, heading, subheading, mp4Src, webmSrc, poster, posterFallback, primaryCta, overlay, height }) => (
        <HeroVideoRender
          block={{
            eyebrow,
            heading,
            subheading,
            mp4Src,
            webmSrc,
            poster: adaptMedia(poster),
            posterFallback,
            primaryCta,
            overlay,
            height,
          }}
        />
      ),
    },
    KeyTakeaways: {
      label: 'Key Takeaways',
      fields: {
        label: { type: 'text', label: 'Label' },
        heading: { type: 'text', label: 'Heading (optional)' },
        items: {
          type: 'array',
          label: 'Takeaways',
          min: 1,
          max: 6,
          arrayFields: { text: { type: 'textarea', label: 'Text' } },
          defaultItemProps: { text: 'Key point' },
          getItemSummary: (i) => i?.text || 'Takeaway',
        },
      },
      defaultProps: { label: 'Key takeaways', items: [] },
      render: (props) => <KeyTakeawaysRender block={props} />,
    },
    MetricStrip: {
      label: 'Metric Strip',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        tone: { type: 'select', label: 'Tone', options: metricToneOptions },
        metrics: {
          type: 'array',
          label: 'Metrics',
          min: 1,
          max: 4,
          arrayFields: {
            value: { type: 'text', label: 'Value (e.g. +150%, 250)' },
            label: { type: 'text', label: 'Label' },
            delta: { type: 'text', label: 'Delta (e.g. +12% MoM)' },
            trend: { type: 'select', label: 'Trend', options: metricTrendOptions },
          },
          defaultItemProps: { value: '+150%', trend: 'up' } as never,
          getItemSummary: (m) => m?.value || 'Metric',
        },
      },
      defaultProps: { metrics: [], tone: 'light' },
      render: (props) => <MetricStripRender block={props} />,
    },
  },
} as Config<PuckProps>
