import { ExternalLink } from 'lucide-react'
import { CONTACT_PAGE } from './contact-content'

/** Full-width embedded Google Map pinning the apiary location. Sits between the
 *  contact form and the values band. */
export function ContactMap() {
  const m = CONTACT_PAGE.map

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
          Άνοιγμα στο Google Maps
        </a>
      </div>
    </section>
  )
}
