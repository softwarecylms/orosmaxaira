import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PuckEditor } from '@/puck/editor'

export const dynamic = 'force-dynamic'

/** The visual editor. Only for logged-in CMS users; the page content itself
 *  arrives from the Payload admin that opened it (see PuckField). */
export default async function EditorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  return <PuckEditor locale={locale} />
}
