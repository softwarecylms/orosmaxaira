import type { Metadata } from 'next'
import { Section, Container, SectionHeading } from '@/components/ui/section'
import { ProductCard } from '@/components/commerce/product-card'
import { listProducts } from '@/lib/medusa/products'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse the full collection.',
}

export default async function ShopPage() {
  const { products } = await listProducts({ limit: 24 })

  return (
    <Section spacing="lg">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="Shop" heading="All products" align="left" />

        {products.length === 0 ? (
          <p className="text-muted">
            No products are available yet. Add some in the Medusa admin.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
