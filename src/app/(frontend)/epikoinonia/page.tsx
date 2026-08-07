import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Clock, Leaf, Mail, MapPin, Phone, Users } from 'lucide-react'
import {
  CONTACT_PAGE,
  type ContactIcon,
  type ValueIcon,
} from '@/components/contact/contact-content'
import { ContactHero } from '@/components/contact/contact-hero'
import { ContactMap } from '@/components/contact/contact-map'
import { ContactMessageForm } from '@/components/contact/contact-message-form'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'
import { FOOTER } from '@/components/home/home-content'
import {
  FacebookSolid,
  InstagramSolid,
  YoutubeSolid,
  PinterestSolid,
  LinkedinSolid,
} from '@/components/layout/social-icons'

export const metadata: Metadata = { title: 'Επικοινωνία' }

const CONTACT_ICONS: Record<ContactIcon, typeof Clock> = {
  hours: Clock,
  phone: Phone,
  location: MapPin,
  email: Mail,
}

const VALUE_ICONS: Record<ValueIcon, typeof BadgeCheck> = {
  purity: BadgeCheck,
  eco: Leaf,
  family: Users,
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookSolid,
  Instagram: InstagramSolid,
  YouTube: YoutubeSolid,
  Pinterest: PinterestSolid,
  LinkedIn: LinkedinSolid,
}

/** Contact page (Figma 146:957) — header/footer come from the shared layout. */
export default function ContactPage() {
  const c = CONTACT_PAGE

  return (
    <>
      {/* Hero */}
      <ContactHero image={c.hero.image} imageAlt={c.hero.imageAlt} title={c.hero.title} />

      {/* Contact body — info + form */}
      <section className="bg-white py-14 md:py-[80px]">
        <div className="container-wide flex flex-col items-start gap-12 lg:flex-row lg:justify-center lg:gap-[77px]">
          {/* Info column — centered on mobile, left-aligned on desktop */}
          <div className="flex w-full flex-col items-center gap-10 text-center lg:w-[651px] lg:items-start lg:text-left">
            <RevealUp className="flex flex-col gap-[15px]">
              <h2 className="font-display text-[28px] font-semibold leading-[1.05] text-foreground md:text-[41px] md:leading-[40px]">
                {c.connect.heading}
              </h2>
              <p className="max-w-[600px] text-[17px] leading-[24px] text-muted">
                {c.connect.body.map((seg, i) =>
                  seg.accent ? (
                    <Link key={i} href={seg.href ?? '/'} className="text-accent hover:underline">
                      {seg.text}
                    </Link>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </p>
            </RevealUp>

            <RevealGroup className="grid w-full grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2" stagger={0.08}>
              {c.connect.items.map((item) => {
                const Icon = CONTACT_ICONS[item.icon]
                const external = item.href?.startsWith('http')
                const inner = (
                  <>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-accent">
                      <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[20px] font-medium leading-[26.4px] text-foreground transition-colors group-hover:text-accent md:text-[22px]">
                        {item.title}
                      </h3>
                      <div className="flex flex-col text-[17px] leading-[24px] text-foreground/80 transition-colors group-hover:text-accent">
                        {item.lines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )
                return (
                  <RevealItem key={item.title} className="group">
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="flex items-start gap-4 text-left"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-start gap-4 text-left">{inner}</div>
                    )}
                  </RevealItem>
                )
              })}
            </RevealGroup>

            <RevealUp className="flex items-center gap-3 self-start">
              {FOOTER.social.map((s) => {
                const Icon = SOCIAL_ICONS[s.name]
                return (
                  <Link
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex size-10 items-center justify-center text-foreground transition-colors hover:text-accent"
                  >
                    {Icon ? <Icon className="size-9" /> : null}
                  </Link>
                )
              })}
            </RevealUp>
          </div>

          {/* Message form */}
          <ContactMessageForm />
        </div>
      </section>

      {/* Full-width map */}
      <ContactMap />

      {/* Values band */}
      <section className="bg-offwhite py-14 md:py-[80px]">
        <RevealGroup
          className="container-wide grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-10 lg:gap-[80px]"
          stagger={0.1}
        >
          {c.values.map((v) => {
            const Icon = VALUE_ICONS[v.icon]
            return (
              <RevealItem
                key={v.title}
                className="mx-auto flex max-w-[382px] flex-col items-center gap-[17px] text-center"
              >
                <span className="flex size-[50px] items-center justify-center rounded-full bg-accent text-white">
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="text-[20px] font-medium leading-[26.4px] text-foreground md:text-[22px]">
                  {v.title}
                </h3>
                <p className="text-[17px] leading-[24px] text-foreground">{v.text}</p>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </section>
    </>
  )
}
