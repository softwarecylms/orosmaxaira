import { ExternalLink, BadgeCheck, Clock, Leaf, Mail, MapPin, Phone, Users } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { ContactContent, ContactIcon, ValueIcon } from '@/components/contact/contact-content'
import type { HomeContent } from '@/components/home/home-content'
import { RichText } from '@/components/activities/detail/rich-text'
import { ContactMessageForm } from '@/components/contact/contact-message-form'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'
import {
  FacebookSolid,
  InstagramSolid,
  YoutubeSolid,
  PinterestSolid,
  LinkedinSolid,
} from '@/components/layout/social-icons'

/**
 * «Επικοινωνία» sections. Each takes its slice of the page copy as `content`
 * and fetches nothing, so the same component renders the live page and the
 * visual editor. (The hero is the existing ContactHero.)
 */

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

/** Contact body — info column and message form. `social` is the site's
 *  social links (site settings), shown under the contact cards. */
export function ContactConnect({
  content,
  social,
}: {
  content: { connect: ContactContent['connect']; form: ContactContent['form'] }
  social: HomeContent['FOOTER']['social']
}) {
  return (
    <section data-edit="connect" className="bg-white py-14 md:py-[80px]">
      <div className="container-wide flex flex-col items-start gap-12 lg:flex-row lg:justify-center lg:gap-[77px]">
        {/* Info column — centered on mobile, left-aligned on desktop */}
        <div className="flex w-full flex-col items-center gap-10 text-center lg:w-[651px] lg:items-start lg:text-left">
          <RevealUp className="flex flex-col gap-[15px]">
            <h2 className="font-display text-[28px] font-semibold leading-[1.05] text-foreground md:text-[41px] md:leading-[40px]">
              {content.connect.heading}
            </h2>
            <p className="max-w-[600px] text-[17px] leading-[24px] text-muted">
              {content.connect.body.map((seg, i) =>
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
            {content.connect.items.map((item) => {
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
            {social.map((s) => {
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
        {/* Full width on mobile, the form’s own width beside the info column. */}
        <div data-edit="form" className="w-full lg:w-auto">
          <ContactMessageForm form={content.form} />
        </div>
      </div>
    </section>
  )
}

/** Full-width embedded Google Map pinning the apiary location. */
export function ContactMapSection({ content: m }: { content: ContactContent['map'] }) {
  return (
    <section aria-label={m.title} className="w-full">
      <div className="relative">
        <iframe
          title={m.label}
          src={m.embedSrc}
          className="block h-[360px] w-full border-0 md:h-[460px] lg:h-[380px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={m.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[15px] font-medium text-foreground shadow-[0_4px_14px_-4px_rgba(35,31,32,0.4)] backdrop-blur transition-colors hover:text-accent"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {m.openLabel}
        </a>
      </div>
    </section>
  )
}

/** Values band. */
export function ContactValues({ content }: { content: ContactContent['values'] }) {
  return (
    <section data-edit="values" className="bg-offwhite py-14 md:py-[80px]">
      <RevealGroup
        className="container-wide grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-10 lg:gap-[80px]"
        stagger={0.1}
      >
        {content.map((v) => {
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
              <p className="text-[17px] leading-[24px] text-foreground">
                <RichText text={v.text} />
              </p>
            </RevealItem>
          )
        })}
      </RevealGroup>
    </section>
  )
}
