import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { ContactHero } from '@/components/contact/contact-hero'
import { ContactConnect, ContactMapSection, ContactValues } from '@/components/sections/contact'
import { loadContactContent, loadSiteContent } from '@/lib/content/load'
import { ManagedPage, managedMetadata } from '@/lib/cms/pages'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const { meta } = await loadContactContent(locale)
  return managedMetadata('epikoinonia', { locale, path: '/epikoinonia', title: meta.title, description: meta.description })
}

/** Contact page (Figma 146:957) — header/footer come from the shared layout. */
async function ContactPageStatic() {
  const locale = await getLocale()
  const c = await loadContactContent(locale)
  const { FOOTER } = await loadSiteContent(locale)

  return (
    <>
      <div data-edit="hero">
        <ContactHero image={c.hero.image} imageAlt={c.hero.imageAlt} title={c.hero.title} />
      </div>
      <ContactConnect content={{ connect: c.connect, form: c.form }} social={FOOTER.social} />
      <div data-edit="map">
        <ContactMapSection content={c.map} />
      </div>
      <ContactValues content={c.values} />
    </>
  )
}

/** The page as edited in Payload's visual editor; its built-in composition until then. */
export default async function ContactPage() {
  return <ManagedPage slug="epikoinonia" locale={await getLocale()} fallback={<ContactPageStatic />} />
}
