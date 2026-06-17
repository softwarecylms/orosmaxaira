'use client'

import type { SiteSetting } from '@/payload-types'
import { LinkButton } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

type FooterCtaProps = {
  settings: SiteSetting | null | undefined
}

export function FooterCTA({ settings }: FooterCtaProps) {
  const cta = (settings as { footerCta?: {
    heading?: string; body?: string;
    cta?: { label?: string; href?: string }
  } } | null)?.footerCta

  const heading = cta?.heading ?? 'Ready to get started?'
  const body =
    cta?.body ??
    'Get in touch for anything related to your online presence.'
  const ctaLabel = cta?.cta?.label ?? 'Request a callback'
  const ctaHref = cta?.cta?.href ?? '/contact'

  return (
    <section aria-labelledby="footer-cta-heading" className="container-page pb-10 md:pb-14">
      <Reveal>
        <div className="flex flex-col gap-6 rounded-[30px] bg-surface-dark px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:gap-8 md:px-12 md:py-[50px]">
          <div className="flex max-w-[524px] flex-col gap-[9px]">
            <h2
              id="footer-cta-heading"
              className="font-display text-[20px] leading-[30px] text-white"
            >
              {heading}
            </h2>
            <p className="text-[16px] leading-[26.4px] text-white/85">{body}</p>
          </div>
          <LinkButton
            href={ctaHref}
            variant="light"
            withIcon
            className="self-start rounded-[40px] px-9 py-[14px] text-[15px] md:self-auto"
          >
            {ctaLabel}
          </LinkButton>
        </div>
      </Reveal>
    </section>
  )
}
