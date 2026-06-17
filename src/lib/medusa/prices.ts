import type { HttpTypes } from '@medusajs/types'

/**
 * Medusa v2 stores prices as decimal amounts (e.g. 10 = €10.00), NOT cents.
 * So we format the amount directly with Intl.NumberFormat.
 */
export function formatPrice(
  amount: number,
  currencyCode: string,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

export type VariantPrice = {
  amount: number
  currencyCode: string
  formatted: string
  original: number
  originalFormatted: string
  onSale: boolean
}

/** Extract the calculated price off a variant (requires a region-scoped fetch). */
export function getVariantPrice(
  variant?: HttpTypes.StoreProductVariant | null,
): VariantPrice | null {
  const cp = (variant as { calculated_price?: HttpTypes.StoreCalculatedPrice })
    ?.calculated_price
  if (!cp || cp.calculated_amount == null) return null

  const amount = cp.calculated_amount
  const original = cp.original_amount ?? amount
  const currencyCode = cp.currency_code ?? 'eur'

  return {
    amount,
    currencyCode,
    formatted: formatPrice(amount, currencyCode),
    original,
    originalFormatted: formatPrice(original, currencyCode),
    onSale: original > amount,
  }
}

/** Cheapest variant price for a product (used on product cards). */
export function getCheapestPrice(
  product: HttpTypes.StoreProduct,
): VariantPrice | null {
  const priced = (product.variants ?? []).filter(
    (v) =>
      (v as { calculated_price?: HttpTypes.StoreCalculatedPrice })
        .calculated_price?.calculated_amount != null,
  )
  if (!priced.length) return null

  const cheapest = [...priced].sort(
    (a, b) =>
      ((a as { calculated_price: HttpTypes.StoreCalculatedPrice })
        .calculated_price.calculated_amount ?? 0) -
      ((b as { calculated_price: HttpTypes.StoreCalculatedPrice })
        .calculated_price.calculated_amount ?? 0),
  )[0]

  return getVariantPrice(cheapest)
}
