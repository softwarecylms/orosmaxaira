import type { Metadata } from 'next'
import { ProductsPage } from '@/components/shop/products-page'

export const metadata: Metadata = {
  title: 'Προϊόντα',
  description: 'Όλα τα προϊόντα Όρος Μαχαιρά — αγνό μέλι, προϊόντα μέλισσας, φυσικά καλλυντικά και πακέτα δώρων.',
}

/** Products listing (Figma 209:4095) — live permalink /proionta/. */
export default function ProiontaPage() {
  return <ProductsPage />
}
