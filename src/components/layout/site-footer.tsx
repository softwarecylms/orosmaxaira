import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Youtube, Phone } from 'lucide-react'
import { FOOTER, CONTACT } from '@/components/home/home-content'
import { RevealUp } from '@/components/home/reveal-up'

type SiteFooterProps = {
  footer?: unknown
  settings?: unknown
  variant?: 'default' | 'dark'
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  Pinterest: PinterestIcon,
  LinkedIn: Linkedin,
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2.01.03-2.88.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.49c0-1.39.81-2.43 1.81-2.43.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24.99.5 1.8 1.48 1.8 1.77 0 3.13-1.87 3.13-4.57 0-2.39-1.72-4.06-4.17-4.06-2.84 0-4.51 2.13-4.51 4.33 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.32-.25.99-.28 1.13-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.47 0 6.16 2.47 6.16 5.77 0 3.45-2.17 6.22-5.19 6.22-1.01 0-1.97-.53-2.29-1.15l-.62 2.38c-.23.86-.83 1.94-1.24 2.6.93.29 1.92.44 2.95.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  )
}

/** OROS MACHAIRA footer (Figma 156:1342). */
export function SiteFooter(_props: SiteFooterProps) {
  return (
    <footer data-testid="site-footer" className="bg-white pt-12 md:pt-[50px]">
      <div className="container-wide">
        <RevealUp className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          {/* Logo block */}
          <div className="flex w-full flex-col gap-7 lg:w-[320px] lg:shrink-0">
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
            <Image
              src="/images/home/iso-badge.webp"
              alt="Πιστοποίηση ISO 14001"
              width={67}
              height={67}
              className="size-[67px] object-contain"
            />
          </div>

          {/* Link columns + contact/social */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:flex lg:gap-[25px]">
            {(
              FOOTER.columns as Array<{
                title: string
                links?: { label: string; href: string }[]
                lines?: string[]
              }>
            ).map((col) => (
              <div key={col.title} className="flex flex-col gap-4 lg:w-[240px]">
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
                    : (col.lines ?? []).map((line) => (
                        <li key={line} className="text-[17px] leading-[27px] text-muted">
                          {line}
                        </li>
                      ))}
                </ul>
              </div>
            ))}

            {/* Contact / social column */}
            <div className="col-span-2 flex flex-col gap-10 sm:col-span-3 lg:w-[353px] lg:gap-[69px]">
              <div className="flex flex-col gap-5">
                <p className="font-display text-[22px] leading-[26.4px] text-foreground">{FOOTER.tagline}</p>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-3.5 text-[22px] font-medium text-accent"
                >
                  <Phone className="size-[34px] shrink-0" aria-hidden="true" />
                  {CONTACT.phoneShort}
                </a>
              </div>
              <ul className="flex items-center gap-3">
                {FOOTER.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.name]
                  return (
                    <li key={s.name}>
                      <Link
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="flex size-8 items-center justify-center text-foreground transition-colors hover:text-accent"
                      >
                        {Icon ? <Icon className="size-[22px]" /> : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </RevealUp>

        {/* Bottom legal bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border py-5 text-[15px] text-muted md:flex-row md:items-center md:justify-between md:text-[17px]">
          <p>
            {FOOTER.legal}{' '}
            <Link href={FOOTER.legalBrandHref} className="text-accent hover:underline">
              {FOOTER.legalBrand}
            </Link>
          </p>
          <p>{FOOTER.policies}</p>
        </div>
      </div>
    </footer>
  )
}
