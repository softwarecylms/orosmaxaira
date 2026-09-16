import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductVariantWorkflowEvents, ProductWorkflowEvents } from "@medusajs/framework/utils"
import { revalidateStorefront } from "../lib/storefront"

/** Workflow events carry `{ id }`, or an array of them for a batch update. */
type ProductEvent = { id: string } | { id: string }[]

/** The variant events name a variant; the product ones name a product. */
const isVariantEvent = (name: string) => name.startsWith("product-variant.")

/**
 * How long to keep collecting tags before posting them. Medusa's `emitEventStep`
 * splits a batch into one event per id, so saving an 8-size product — or
 * importing a price list — arrives here as a burst of events that all clear the
 * same tag; without this window each one would be its own HTTP round trip.
 */
const WINDOW_MS = 1500

/** Beyond this many products in one burst the per-handle tags stop earning
 *  their lookup: `products` alone already clears every detail page. */
const MAX_HANDLES = 20

const pending = new Set<string>()
let timer: NodeJS.Timeout | null = null
let flushing: Promise<unknown> = Promise.resolve()

/**
 * Collect tags and post them once the burst dies down, one flush at a time.
 * Best effort: `revalidateStorefront` waits 3 s and never throws, so a cold
 * storefront gets a second chance and anything worse is a warning — the admin's
 * save has already succeeded, and the reads carry a TTL as the last resort.
 */
function schedule(tags: Iterable<string>, logger: Logger): void {
  for (const tag of tags) pending.add(tag)
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    const batch = [...pending]
    pending.clear()
    flushing = flushing
      .then(async () => {
        if (await revalidateStorefront(batch)) return
        if (await revalidateStorefront(batch)) return
        logger.warn(`[revalidate] storefront did not confirm ${batch.join(", ")}`)
      })
      // The chain must never stay rejected: a rejected head would skip every
      // later flush and, unhandled, take the Medusa process down with it — for
      // a cache ping the admin's save does not depend on.
      .catch(() => {})
  }, WINDOW_MS)
}

/**
 * The storefront caches its Medusa reads (`cache: 'force-cache'` with a long
 * TTL) and clears them when a tag is revalidated, so without this a catalogue
 * edit in the admin — a price, a photo moved to another size, a new product —
 * would sit invisible for up to an hour.
 *
 * Every product/variant change therefore drops the `products` tag (the shop
 * grid, the cross-sell rows, the home flatlay) plus `product-<handle>` for each
 * product touched (its detail page). A single tag would in fact be enough — the
 * detail read carries both tags and Next drops a cached fetch when ANY of its
 * tags is revalidated — but naming the handle keeps the contract explicit.
 *
 * Linking a photo to a variant emits no event at all; that route is covered by
 * a middleware instead (see src/api/middlewares.ts).
 */
export default async function revalidateProducts({ event, container }: SubscriberArgs<ProductEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ids = (Array.isArray(event.data) ? event.data : [event.data])
    .map((d) => d?.id)
    .filter((id): id is string => typeof id === "string" && !!id)

  const tags = new Set<string>(["products"])
  if (ids.length && ids.length <= MAX_HANDLES) {
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const variant = isVariantEvent(event.name)
      const { data } = await query.graph({
        entity: variant ? "variant" : "product",
        fields: variant ? ["id", "product.handle"] : ["id", "handle"],
        filters: { id: ids },
      })
      for (const row of data ?? []) {
        const handle = variant ? (row as { product?: { handle?: string } }).product?.handle : (row as { handle?: string }).handle
        if (handle) tags.add(`product-${handle}`)
      }
    } catch (e) {
      // A deleted product/variant is already gone from the read model — the
      // `products` tag alone still clears the grid and every detail page.
      logger.debug?.(`[revalidate] no handle for ${event.name}: ${(e as Error)?.message ?? e}`)
    }
  }

  schedule(tags, logger)
}

export const config: SubscriberConfig = {
  event: [
    ProductWorkflowEvents.CREATED,
    ProductWorkflowEvents.UPDATED,
    ProductWorkflowEvents.DELETED,
    ProductVariantWorkflowEvents.CREATED,
    ProductVariantWorkflowEvents.UPDATED,
    ProductVariantWorkflowEvents.DELETED,
  ],
}
