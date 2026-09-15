import { getLocale } from 'next-intl/server'
import { loadHomeContent } from '@/lib/content/load'
import { ProductCategoriesView } from './product-categories-view'

/** Loads the section's copy, then renders ProductCategoriesView (which the visual editor renders too). */
export async function ProductCategories() {
  const { CATEGORIES } = await loadHomeContent(await getLocale())
  return <ProductCategoriesView content={CATEGORIES} />
}
