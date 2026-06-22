import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ChevronRight, Clock, Leaf, Mail, MapPin, Phone, Users } from 'lucide-react'
import {
  CONTACT_PAGE,
  type ContactIcon,
  type ValueIcon,
} from '@/components/contact/contact-content'
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
      {/* Breadcrumb */}
      <div className="container-wide pb-2.5 pt-4">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[15px] text-muted md:text-[17px]">
          {c.breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {b.href ? (
                <Link href={b.href} className="transition-colors hover:text-accent">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <section className="relative isolate flex min-h-[260px] items-center justify-center overflow-hidden md:min-h-[340px] lg:min-h-[401px]">
        <Image
          src={c.hero.image}
          alt={c.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" />
        <RevealUp className="relative z-10 px-6 text-center">
          <h1 className="font-display text-[32px] font-bold leading-[1.12] text-white md:text-[45px] md:leading-[55px]">
            {c.hero.title}
          </h1>
        </RevealUp>
      </section>

      {/* Contact body — info + form */}
      <section className="bg-white py-14 md:py-[80px]">
        <div className="container-wide flex flex-col items-start gap-12 lg:flex-row lg:justify-center lg:gap-[77px]">
          {/* Info column */}
          <div className="flex w-full flex-col gap-10 lg:w-[651px]">
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

            <RevealGroup className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2" stagger={0.08}>
              {c.connect.items.map((item) => {
                const Icon = CONTACT_ICONS[item.icon]
                return (
                  <RevealItem key={item.title} className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-accent">
                      <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[20px] font-medium leading-[26.4px] text-foreground md:text-[22px]">
                        {item.title}
                      </h3>
                      <div className="flex flex-col text-[17px] leading-[24px] text-foreground/80">
                        {item.lines.map((line) =>
                          item.href ? (
                            <a key={line} href={item.href} className="transition-colors hover:text-accent">
                              {line}
                            </a>
                          ) : (
                            <span key={line}>{line}</span>
                          ),
                        )}
                      </div>
                    </div>
                  </RevealItem>
                )
              })}
            </RevealGroup>

            <RevealUp className="flex items-center gap-3">
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
