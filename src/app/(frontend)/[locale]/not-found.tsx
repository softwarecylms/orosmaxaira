import { getLocale } from 'next-intl/server'
import { Container, Section } from '@/components/ui/section'
import { ArrowRight } from '@/components/home/icons'

export default async function NotFound() {
  const en = (await getLocale()) === 'en'
  // Build the home href explicitly: not-found.tsx loses next-intl's Link locale
  // context, so a locale-aware <Link> would not prefix. `getLocale()` still
  // works, so we prefix by hand → English 404 → /en/, Greek 404 → /.
  const homeHref = en ? '/en/' : '/'
  return (
    <Section spacing="lg">
      <Container className="flex flex-col items-center gap-4 text-center">
        <span className="eyebrow">404</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {en ? 'Page not found' : 'Η σελίδα δεν βρέθηκε'}
        </h1>
        <p className="text-muted max-w-md">
          {en
            ? "The page you're looking for doesn't exist or has been moved."
            : 'Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.'}
        </p>
        {/* Same style as the site's primary buttons (CtaLink 'gold'): square with
            border radius, gold, darkens on hover. */}
        <a
          href={homeHref}
          className="mt-2 inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[4px] bg-accent p-[15px] text-[17px] font-normal leading-[24px] text-white transition-colors hover:bg-foreground"
        >
          {en ? 'Back to home' : 'Επιστροφή στην αρχική'}
          <ArrowRight className="size-[15px]" />
        </a>
      </Container>
    </Section>
  )
}
