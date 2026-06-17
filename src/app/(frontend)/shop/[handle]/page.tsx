import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { AddToCart } from '@/components/commerce/add-to-cart'
import { getProductByHandle } from '@/lib/medusa/products'
import { getCheapestPrice } from '@/lib/medusa/prices'
import { cn } from '@/lib/utils'

type Params = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) return { title: 'Product not found' }
  return {
    title: product.title ?? 'Product',
    description: product.description ?? undefined,
  }
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  const price = getCheapestPrice(product)
  const images = product.images?.length
    ? product.images
    : product.thumbnail
      ? [{ id: 'thumb', url: product.thumbnail }]
      : []

  return (
    <Section spacing="lg">
      <Container className="flex flex-col gap-8">
        <Link href="/shop" className="text-sm text-muted hover:text-foreground">
          ← Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div
                key={img.id ?? i}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-2xl border border-border bg-card',
                  images.length === 1 && 'col-span-2',
                )}
              >
                <Image
                  src={img.url}
                  alt={product.title ?? ''}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {product.title}
              </h1>
              {price ? (
                <p className="mt-3 text-xl text-muted">{price.formatted}</p>
              ) : null}
            </div>

            {product.description ? (
              <p className="leading-relaxed text-muted">
                {product.description}
              </p>
            ) : null}

            <AddToCart product={product} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
