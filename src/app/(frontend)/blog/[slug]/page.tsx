import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CalendarDays, Phone, Mail } from 'lucide-react'
import { BLOG_POSTS } from '@/components/blog/blog-data'
import { BLOG_CATEGORIES, POST_CATEGORIES } from '@/components/blog/blog-categories'
import { Reveal } from '@/components/motion/reveal'
import { ArticleFeaturedImage } from '@/components/blog/article-featured-image'
import { FacebookSolid, XSolid, LinkedinSolid } from '@/components/layout/social-icons'
import { absoluteUrl } from '@/lib/seo'

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return { title: 'Άρθρο' }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: post.image ? [post.image] : undefined },
  }
}

const BODY =
  'max-w-none text-[17px] leading-[1.75] text-muted ' +
  '[&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:md:text-[27px] ' +
  '[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-foreground ' +
  '[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-[17px] [&_h4]:font-semibold [&_h4]:text-foreground ' +
  '[&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 ' +
  '[&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold-strong ' +
  '[&_img]:my-7 [&_img]:w-full [&_img]:rounded-[14px] [&_strong]:font-semibold [&_strong]:text-foreground ' +
  '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)
  const categorySlug = POST_CATEGORIES[post.slug]?.[0]
  const categoryName = BLOG_CATEGORIES.find((c) => c.slug === categorySlug)?.name
  const url = absoluteUrl(`/blog/${post.slug}`)
  const shares = [
    { icon: FacebookSolid, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { icon: XSolid, label: 'X', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` },
    { icon: LinkedinSolid, label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ]

  return (
    <div className="container-wide py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        {/* ── Article (≈70%) ── */}
        <article className="min-w-0">
          {post.image ? (
            <Reveal className="mb-7">
              <ArticleFeaturedImage src={post.image} alt={post.title} label={categoryName} />
            </Reveal>
          ) : null}

          <h1 className="font-display text-[30px] font-bold leading-[1.14] text-foreground md:text-[42px]">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-5 text-[14px] text-muted">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" aria-hidden="true" />
              {post.dateText}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="text-[13px] uppercase tracking-wide">Κοινοποίηση</span>
              {shares.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Κοινοποίηση στο ${s.label}`}
                    className="flex size-8 items-center justify-center rounded-full bg-offwhite text-black ring-1 ring-border transition hover:bg-accent hover:text-white"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                )
              })}
            </span>
          </div>

          {/* eslint-disable-next-line react/no-danger */}
          <div className={`mt-7 ${BODY}`} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* ── Sidebar (≈30%) ── */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(100vh-700px)] lg:self-start">
          <div className="rounded-[16px] bg-offwhite p-6 ring-1 ring-border/60">
            <h2 className="mb-4 font-display text-[18px] font-bold text-foreground">Σχετικά Άρθρα</h2>
            <ul className="flex flex-col divide-y divide-border">
              {related.map((r) => (
                <li key={r.slug} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`/blog/${r.slug}`} className="group flex gap-3">
                    {r.image ? (
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-[8px] bg-white">
                        <Image src={r.image} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                    ) : null}
                    <span className="flex flex-col gap-0.5">
                      <span className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                        {r.title}
                      </span>
                      <span className="text-[12px] text-muted">{r.dateText}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[16px] bg-accent p-6 text-white">
            <h2 className="font-display text-[18px] font-bold">Επικοινωνήστε μαζί μας</h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-white/75">
              Έχετε απορίες για τα προϊόντα ή τις δραστηριότητές μας; Η ομάδα μας είναι εδώ για εσάς.
            </p>
            <div className="mt-4 flex flex-col gap-3 text-[14px] text-white/90">
              <a href="tel:+35725622305" className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="size-4 shrink-0 text-cream" aria-hidden="true" />
                25622305
              </a>
              <a href="mailto:info@orosmaxaira.com" className="flex items-center gap-3 transition-colors hover:text-white">
                <Mail className="size-4 shrink-0 text-cream" aria-hidden="true" />
                info@orosmaxaira.com
              </a>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center justify-center rounded-[4px] bg-white px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
            >
              Επικοινωνία
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
