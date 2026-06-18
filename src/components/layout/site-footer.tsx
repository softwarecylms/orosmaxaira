import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { FOOTER, CONTACT } from '@/components/home/home-content'
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
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookSolid,
  Instagram: InstagramSolid,
  YouTube: YoutubeSolid,
  Pinterest: PinterestSolid,
  LinkedIn: LinkedinSolid,
}

/** OROS MACHAIRA footer (Figma 156:1342). */
export function SiteFooter(_props: SiteFooterProps) {
  return (
    <footer data-testid="site-footer" className="bg-white pt-12 md:pt-[50px]">
      <div className="container-wide">
        <RevealUp className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          {/* Logo block */}
          <div className="flex w-full flex-col items-center gap-7 text-center lg:w-[320px] lg:shrink-0 lg:items-start lg:text-left">
            <Link href="/" aria-label="Όρος Μαχαιρά — Αρχική">
              <Image
                src="/images/home/logo.svg"
                alt="Όρος Μαχαιρά"
                width={165}
                height={59}
                className="h-[59px] w-auto"
              />
            </Link>
            <p className="max-w-[300px] text-[17px] leading-[24px] text-muted">{FOOTER.tagline}</p>
            <div className="flex items-center gap-3">
              <Image
                src="/images/home/iso-badge.webp"
                alt="Πιστοποίηση ISO 14001"
                width={67}
                height={67}
                className="size-[67px] object-contain"
              />
              <div className="flex h-[67px] items-center justify-center bg-black px-3.5">
                <Image
                  src="/images/home/iso-20000-badge.webp"
                  alt="Πιστοποίηση ISO 20000-1"
                  width={400}
                  height={518}
                  className="h-[51px] w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Link columns + contact/social */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 text-center sm:grid-cols-3 sm:text-left lg:flex lg:gap-[25px]">
            {(
              FOOTER.columns as Array<{
                title: string
                links?: { label: string; href: string }[]
                lines?: string[]
              }>
            ).map((col) => (
              <div
                key={col.title}
                className="flex flex-col items-center gap-4 sm:items-start lg:w-[240px]"
              >
                <h3 className="text-[22px] font-medium leading-[26.4px] text-foreground">{col.title}</h3>
                <ul className="flex flex-col gap-0.5">
                  {col.links
                    ? col.links.map((l) => (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className="text-[17px] leading-[27px] text-muted transition-colors hover:text-accent"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))
                    : (col.lines ?? []).map((line) => {
                        const href = line.startsWith('Τηλ')
                          ? `tel:${line.replace(/[^+\d]/g, '')}`
                          : line.includes('@')
                            ? `mailto:${line.trim()}`
                            : null
                        return (
                          <li key={line} className="text-[17px] leading-[27px] text-muted">
                            {href ? (
                              <a href={href} className="transition-colors hover:text-accent">
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
            <div className="flex flex-col items-center gap-10 text-center sm:col-span-3 sm:items-start sm:text-left lg:w-[353px] lg:gap-[69px]">
              <div className="flex flex-col items-center gap-5 sm:items-start">
                <p className="font-display text-[22px] leading-[26.4px] text-foreground">{FOOTER.tagline}</p>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-3.5 text-[22px] font-medium text-accent"
                >
                  <Phone className="size-[34px] shrink-0" aria-hidden="true" />
                  {CONTACT.phoneShort}
                </a>
              </div>
              <ul className="flex items-center justify-center gap-3 sm:justify-start">
                {FOOTER.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.name]
                  return (
                    <li key={s.name}>
                      <Link
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="flex size-9 items-center justify-center text-foreground transition-colors hover:text-accent"
                      >
                        {Icon ? <Icon className="size-[28px]" /> : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </RevealUp>

        {/* Bottom legal bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border py-5 text-center text-[15px] text-muted md:flex-row md:items-center md:justify-between md:text-left md:text-[17px]">
          <p>
            {FOOTER.legal}{' '}
            <Link
              href={FOOTER.legalBrandHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {FOOTER.legalBrand}
            </Link>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {FOOTER.policies.split(' | ').map((item, i) => (
              <span key={item} className="flex items-center gap-x-2">
                {i > 0 ? <span aria-hidden="true">|</span> : null}
                <Link href="/" className="transition-colors hover:text-accent">
                  {item}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
