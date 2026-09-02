import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Phone } from 'lucide-react'
import { getHomeContent } from '@/components/home/home-content'
import type { Locale } from '@/i18n/routing'
import { RevealUp } from '@/components/home/reveal-up'
import {
  FacebookSolid,
  InstagramSolid,
  YoutubeSolid,
  PinterestSolid,
  LinkedinSolid,
} from './social-icons'

type SiteFooterProps = {
  footer?: unknown
  settings?: unknown
  variant?: 'default' | 'dark'
  locale: Locale
}

/** Google Maps place link for the apiary (Melini, Larnaca) — the footer address
 *  line links here. */
const MAPS_URL =
  'https://www.google.com/maps/place/Cyprus+Honey+%22Oros+Maxaira%22/@34.8649999,33.1644093,17z/data=!3m1!4b1!4m6!3m5!1s0x14e0b239e555554f:0xc03e2e50ad7fa0f8!8m2!3d34.8649955!4d33.1669842!16s%2Fg%2F11g728vnj4'

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookSolid,
  Instagram: InstagramSolid,
  YouTube: YoutubeSolid,
  Pinterest: PinterestSolid,
  LinkedIn: LinkedinSolid,
}

/** OROS MACHAIRA footer (Figma 156:1342). Locale-aware via getHomeContent(locale). */
export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = await getTranslations('footer')
  const { FOOTER, CONTACT } = getHomeContent(locale)
  return (
    <footer data-testid="site-footer" className="bg-white pt-12 md:pt-[50px]">
      <div className="container-wide">
        <RevealUp className="flex flex-col gap-12 lg:flex-row lg:gap-6 xl:gap-8 2xl:gap-10">
          {/* Logo block */}
          <div className="flex w-full min-w-0 flex-col items-center gap-7 text-center lg:flex-1 lg:items-start lg:text-left">
            <Link href="/" aria-label={t('homeAria')}>
              <Image
                src="/images/home/logo.svg"
                alt={t('logoAlt')}
                width={165}
                height={59}
                className="h-[59px] w-auto"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/pistopioiseis#iso-14001"
                aria-label={t('isoView', { code: '14001' })}
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="/images/home/iso-badge.webp"
                  alt={t('isoAlt', { code: '14001' })}
                  width={67}
                  height={67}
                  className="size-[67px] object-contain"
                />
              </Link>
              <Link
                href="/pistopioiseis#iso-22000"
                aria-label={t('isoView', { code: '22000' })}
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src="/images/home/22000.jpg"
                  alt={t('isoAlt', { code: '22000' })}
                  width={67}
                  height={67}
                  className="size-[67px] object-contain"
                />
              </Link>
            </div>

            {/* EU / ΘΑλΕΙΑ co-funding — sits with the other credential marks,
                kept quiet: 20px logos and 11px type. */}
            <div className="flex flex-col items-center gap-3 lg:mt-auto lg:items-start">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
                <Image
                  src="/images/funding/thaleia.png"
                  alt={FOOTER.funding.thaleiaAlt}
                  width={514}
                  height={160}
                  className="h-5 w-auto opacity-70"
                />
                <Image
                  src="/images/funding/cyprus.png"
                  alt={FOOTER.funding.cyprusAlt}
                  width={196}
                  height={160}
                  className="h-5 w-auto opacity-70"
                />
                <Image
                  src="/images/funding/eu.png"
                  alt={FOOTER.funding.euAlt}
                  width={873}
                  height={160}
                  className="h-5 w-auto opacity-70"
                />
              </div>
              <p className="max-w-[300px] text-[11px] leading-[1.5] text-muted/80">
                {FOOTER.funding.text}
              </p>
            </div>
          </div>

          {/* Link columns + contact/social */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 text-center sm:grid-cols-3 sm:text-left lg:contents">
            {(
              FOOTER.columns as Array<{
                title: string
                links?: { label: string; href: string }[]
                lines?: string[]
              }>
            ).map((col) => (
              <div
                key={col.title}
                className="flex min-w-0 flex-col items-center gap-4 sm:items-start lg:flex-1"
              >
                <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">{col.title}</h3>
                <ul className="flex flex-col gap-0.5">
                  {col.links
                    ? col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className="inline-block text-[17px] leading-[36px] text-muted transition-colors hover:text-accent sm:leading-[27px]"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))
                    : (col.lines ?? []).map((line) => {
                        const isAddress = /Μελίνη|Melini|Λάρνακα|Larnaca/.test(line)
                        const href = /^(Τηλ|Tel)/.test(line)
                          ? `tel:${line.replace(/[^+\d]/g, '')}`
                          : line.includes('@')
                            ? `mailto:${line.trim()}`
                            : isAddress
                              ? MAPS_URL
                              : null
                        return (
                          <li key={line} className="text-[17px] leading-[27px] text-muted">
                            {href ? (
                              <a
                                href={href}
                                target={isAddress ? '_blank' : undefined}
                                rel={isAddress ? 'noopener noreferrer' : undefined}
                                className="transition-colors hover:text-accent"
                              >
                                {line}
                              </a>
                            ) : (
                              line
                            )}
                          </li>
                        )
                      })}
                </ul>
              </div>
            ))}

            {/* Contact / social column */}
            <div className="flex min-w-0 flex-col items-center gap-8 text-center sm:col-span-3 sm:items-start sm:text-left lg:flex-1 lg:gap-10 2xl:gap-[69px]">
              <div className="flex flex-col items-center gap-5 sm:items-start">
                <p className="max-w-full break-words font-display text-[18px] leading-[24px] text-foreground 2xl:text-[22px] 2xl:leading-[26.4px]">
                  {FOOTER.tagline}
                </p>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-2.5 text-[18px] font-medium text-accent 2xl:gap-3.5 2xl:text-[22px]"
                >
                  <Phone className="phone-ring size-[28px] shrink-0 2xl:size-[34px]" aria-hidden="true" />
                  {CONTACT.phoneShort}
                </a>
              </div>
              <ul className="flex flex-wrap items-center justify-center gap-2 sm:justify-start 2xl:gap-3">
                {FOOTER.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.name]
                  return (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="flex size-8 items-center justify-center text-foreground transition-colors hover:text-accent 2xl:size-9"
                      >
                        {Icon ? <Icon className="size-[24px] 2xl:size-[28px]" /> : null}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </RevealUp>

        {/* Bottom legal bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border py-5 text-center text-[13px] text-muted md:flex-row md:items-center md:justify-between md:text-left md:text-[15px]">
          <p>
            {FOOTER.legal}{' '}
            <a
              href={FOOTER.legalBrandHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {FOOTER.legalBrand}
            </a>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:justify-start">
            {FOOTER.policies.map((item, i) => (
              <span key={item.label} className="flex items-center gap-x-2">
                {i > 0 ? <span aria-hidden="true">|</span> : null}
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </span>
            ))}
          </p>
        </div>

      </div>
    </footer>
  )
}
