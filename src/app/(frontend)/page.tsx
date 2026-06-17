import { Render } from '@measured/puck/rsc'
import { getPageBySlug } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'
import { puckConfig } from '@/puck/config'
import { populatePuckData } from '@/puck/hydrate'
import { Container } from '@/components/ui/section'
import type { Data } from '@measured/puck'

export const revalidate = 60

export async function generateMetadata() {
  const page = await getPageBySlug('home')
  return pageMetadata(page)
}

/**
 * The homepage renders the CMS page whose slug is "home", using the same Puck
 * pipeline as every other page — so it's fully editable in the visual editor.
 */
export default async function HomePage() {
  const page = await getPageBySlug('home')

  if (!page) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl text-foreground">Welcome 👋</h1>
        <p className="mt-4 max-w-md text-muted">
          Create a page with the slug <code>home</code> in the CMS at{' '}
          <a href="/admin" className="text-accent underline">
            /admin
          </a>{' '}
          to build your homepage.
        </p>
      </Container>
    )
  }

  const data = await populatePuckData(page.content as unknown as Data | null)
  return <Render config={puckConfig} data={data as never} />
}
