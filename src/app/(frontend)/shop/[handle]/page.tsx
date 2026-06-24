import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  getProductByHandle,
  getProductDetail,
  getRelatedProducts,
  handleOf,
} from '@/components/shop/shop-content'
import { ProductView } from '@/components/shop/product/product-view'
import type { AddonProduct } from '@/components/shop/product/product-purchase'
import { ProductTabs } from '@/components/shop/product/product-tabs'
import { BenefitsBar } from '@/components/shop/product/benefits-bar'
import { ShopProductCard } from '@/components/shop/shop-product-card'
import { RevealUp, RevealGroup, RevealItem } from '@/components/home/reveal-up'

type Params = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params
  const product = getProductByHandle(handle)
  if (!product) return { title: 'Προϊόν' }
  const detail = getProductDetail(handle)
  return { title: product.title, description: detail.description ?? product.title }
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params
  const product = getProductByHandle(handle)
  if (!product) notFound()

  const detail = getProductDetail(handle)
  const related = getRelatedProducts(product)

  const addons: AddonProduct[] = (detail.addons ?? [])
    .map((h) => getProductByHandle(h))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ handle: handleOf(p), title: p.title, image: p.image, price: p.price }))

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-wide pb-2.5 pt-4">
        <RevealUp>
          <nav
            aria-label="breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[15px] text-muted md:text-[17px]"
          >
            <Link href="/shop" className="transition-colors hover:text-accent">
              Προϊόντα
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{product.category}</span>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </RevealUp>
      </div>

      {/* Gallery + purchase */}
      <section className="container-wide pb-12 pt-4 md:pb-[60px]">
        <ProductView handle={handle} product={product} detail={detail} addons={addons} />
      </section>

      <BenefitsBar />

      {/* Description / nutrition — narrower than the full-width info section */}
      {detail.sections?.length || detail.nutrition ? (
        <section className="container-page py-12 md:py-[60px]">
          <RevealUp>
            <ProductTabs sections={detail.sections ?? []} nutrition={detail.nutrition} />
          </RevealUp>
        </section>
      ) : null}

      {/* Related products — narrower, mixed categories */}
      {related.length ? (
        <section className="bg-offwhite py-12 md:py-[70px]">
          <div className="container-page">
            <RevealUp>
              <h2 className="text-center font-display text-[26px] font-semibold leading-[1.1] text-foreground md:text-[36px]">
                Προϊόντα που ίσως σας ενδιαφέρουν
              </h2>
            </RevealUp>
            <RevealGroup
              className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-12 md:grid-cols-4"
              stagger={0.08}
            >
              {related.map((p) => (
                <RevealItem key={p.title} className="h-full">
                  <ShopProductCard product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}
    </>
  )
}
