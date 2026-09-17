import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { EllipsisHorizontal, PencilSquare, Photo, Plus, Trash } from "@medusajs/icons"
import { Badge, Button, Container, DropdownMenu, Heading, IconButton, Table, Text, toast, usePrompt } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { displaySrc } from "../components/media-picker"
import { VariantDrawer } from "../components/variant-drawer"
import { sdk } from "../lib/sdk"

/**
 * «Παραλλαγές» — the product page's variants section, replacing the native one.
 *
 * The native table can't be extended: a row click navigates to the variant page
 * and its «Edit» opens a form with only half of a variant's data. This section
 * sits exactly where the native one was (`product.details.after` renders right
 * after the main column, whose last section is Variants), is built only on the
 * public Admin API, and opens the variant drawer (components/variant-drawer.tsx)
 * for a row click, a row's «Επεξεργασία» and «Νέα παραλλαγή».
 *
 * Each row shows the variant's own picture — its thumbnail, else its first
 * linked image — and a placeholder otherwise. It never falls back to the
 * product's thumbnail, so a variant without a picture stands out.
 *
 * The native section is hidden once found (by its create link, else by its
 * heading and table). If a future dashboard changes that markup, the native
 * section simply shows again next to this one; nothing breaks.
 */

const MARK_OURS = "data-oros-variants"
const MARK_HIDDEN = "data-oros-native-variants"
const HIDE_STYLE = `[${MARK_HIDDEN}] { display: none !important; }`
const NATIVE_HEADINGS = ["Variants", "Παραλλαγές"]

const VARIANT_FIELDS =
  "id,title,sku,thumbnail,variant_rank,manage_inventory,inventory_quantity,*options,*prices,+prices.price_rules.attribute"
const IMAGE_FIELDS = "id,images.id,images.url,images.rank,images.variants.id"

type Price = { id: string; amount: number; currency_code: string; rules?: Record<string, string>; min_quantity?: number | null; max_quantity?: number | null }
type Variant = {
  id: string
  title: string | null
  sku: string | null
  thumbnail: string | null
  variant_rank?: number | null
  manage_inventory: boolean
  inventory_quantity?: number | null
  options?: { id: string; value: string; option?: { title?: string } | null }[] | null
  prices?: Price[] | null
}
type ProductImage = { id: string; url: string; rank?: number | null; variants?: ({ id: string } | null)[] | null }

/** The native section's card, found by its create link, else by its heading and table — never ours. */
function findNativeSection(productId: string): HTMLElement | null {
  const card = (el: Element | null | undefined) => el?.closest<HTMLElement>(".shadow-elevation-card-rest")
  const link = document.querySelector(`a[href$="/products/${CSS.escape(productId)}/variants/create"]`)
  const byLink = card(link)
  if (byLink && !byLink.hasAttribute(MARK_OURS)) return byLink
  for (const h2 of Array.from(document.querySelectorAll("h2"))) {
    if (!NATIVE_HEADINGS.includes(h2.textContent?.trim() ?? "")) continue
    const c = card(h2)
    if (c && !c.hasAttribute(MARK_OURS) && !c.closest(`[${MARK_OURS}]`) && c.querySelector("table")) return c
  }
  return null
}

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: currency.toUpperCase() }).format(amount)
  } catch {
    return `${amount} ${currency.toUpperCase()}`
  }
}

const plainPrices = (v: Variant) =>
  (v.prices ?? []).filter((p) => !Object.keys(p.rules ?? {}).length && p.min_quantity == null && p.max_quantity == null)

const ProductVariantsWidget = ({ data }: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const productId = data.id
  const navigate = useNavigate()
  const prompt = usePrompt()
  const queryClient = useQueryClient()
  const [drawer, setDrawer] = useState<{ variantId: string | null } | null>(null)

  const variantsQuery = useQuery({
    queryKey: ["product_variants", productId, "oros-section"],
    queryFn: async () => {
      const r = await sdk.admin.product.listVariants(productId, {
        fields: VARIANT_FIELDS,
        limit: 250,
        order: "variant_rank",
      } as HttpTypes.AdminProductVariantParams)
      return r.variants as unknown as Variant[]
    },
  })
  const imagesQuery = useQuery({
    queryKey: ["products", productId, "oros-variant-images"],
    queryFn: async () => {
      const r = await sdk.admin.product.retrieve(productId, { fields: IMAGE_FIELDS })
      return ((r.product as unknown as { images?: ProductImage[] }).images ?? []) as ProductImage[]
    },
  })

  // Hide the native section; keep it hidden across its own re-renders.
  useEffect(() => {
    const hide = () => {
      const native = findNativeSection(productId)
      if (native && !native.hasAttribute(MARK_HIDDEN)) native.setAttribute(MARK_HIDDEN, "")
    }
    hide()
    const observer = new MutationObserver(hide)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      document.querySelectorAll(`[${MARK_HIDDEN}]`).forEach((el) => el.removeAttribute(MARK_HIDDEN))
    }
  }, [productId])

  const images = [...(imagesQuery.data ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const pictureOf = (v: Variant) =>
    v.thumbnail || images.find((i) => (i.variants ?? []).some((x) => x?.id === v.id))?.url || null

  const variants = variantsQuery.data ?? []

  const remove = async (v: Variant, e?: MouseEvent) => {
    e?.stopPropagation()
    const ok = await prompt({
      title: "Διαγραφή παραλλαγής;",
      description: `Η παραλλαγή «${v.title ?? v.sku ?? v.id}» θα διαγραφεί. Οι εικόνες της επιστρέφουν στη συλλογή του προϊόντος.`,
      confirmText: "Διαγραφή",
      cancelText: "Άκυρο",
    })
    if (!ok) return
    try {
      await sdk.admin.product.deleteVariant(productId, v.id)
      toast.success("Η παραλλαγή διαγράφηκε.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      await Promise.all(
        [["product_variants"], ["products"], ["inventory_items"]].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      )
    }
  }

  return (
    <>
      <style>{HIDE_STYLE}</style>
      <Container className="divide-y p-0" {...{ [MARK_OURS]: "" }}>
        <div className="flex items-center justify-between gap-x-3 px-6 py-4">
          <Heading level="h2">Παραλλαγές</Heading>
          <div className="flex items-center gap-x-2">
            <Button size="small" variant="secondary" type="button" onClick={() => setDrawer({ variantId: null })}>
              <Plus />
              Νέα παραλλαγή
            </Button>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <IconButton size="small" variant="transparent" type="button" aria-label="Περισσότερες ενέργειες">
                  <EllipsisHorizontal />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onClick={() => navigate(`/products/${productId}/prices`)}>
                  Επεξεργασία τιμών όλων των παραλλαγών
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => navigate(`/products/${productId}/stock`)}>
                  Επεξεργασία αποθέματος όλων των παραλλαγών
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>

        {variantsQuery.isLoading ? (
          <div className="flex flex-col gap-y-2 px-6 py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-ui-bg-component h-9 animate-pulse rounded-md" />
            ))}
          </div>
        ) : variantsQuery.isError ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-error">
              Οι παραλλαγές δεν φορτώθηκαν.
            </Text>
          </div>
        ) : variants.length === 0 ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              Δεν υπάρχουν παραλλαγές.
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Παραλλαγή</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>Επιλογές</Table.HeaderCell>
                  <Table.HeaderCell>Τιμή</Table.HeaderCell>
                  <Table.HeaderCell>Απόθεμα</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {variants.map((v) => {
                  const picture = pictureOf(v)
                  const prices = plainPrices(v)
                  return (
                    <Table.Row
                      key={v.id}
                      className="cursor-pointer"
                      data-variant-id={v.id}
                      onClick={() => setDrawer({ variantId: v.id })}
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-x-3">
                          <div className="bg-ui-bg-component border-ui-border-base flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                            {picture ? (
                              <img src={displaySrc(picture)} alt="" loading="lazy" className="size-full object-cover" />
                            ) : (
                              <Photo className="text-ui-fg-muted" aria-label="Χωρίς εικόνα" />
                            )}
                          </div>
                          <Text size="small" weight="plus" className="truncate">
                            {v.title || "—"}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small" className="text-ui-fg-subtle">
                          {v.sku || "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-wrap gap-1">
                          {(v.options ?? []).map((o) => (
                            <Badge key={o.id} size="2xsmall">
                              {o.value}
                            </Badge>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small">
                          {prices.length ? prices.map((p) => money(Number(p.amount), p.currency_code)).join(" · ") : "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small" className={v.manage_inventory ? "" : "text-ui-fg-subtle"}>
                          {v.manage_inventory ? `${v.inventory_quantity ?? 0} διαθέσιμα` : "Χωρίς διαχείριση"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenu.Trigger asChild>
                              <IconButton size="small" variant="transparent" type="button" aria-label="Ενέργειες παραλλαγής">
                                <EllipsisHorizontal />
                              </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content align="end">
                              <DropdownMenu.Item onClick={() => setDrawer({ variantId: v.id })}>
                                <PencilSquare className="text-ui-fg-subtle" />
                                Επεξεργασία
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item onClick={() => remove(v)} className="text-ui-fg-error">
                                <Trash />
                                Διαγραφή
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </Container>

      <VariantDrawer
        productId={productId}
        variantId={drawer?.variantId ?? null}
        open={!!drawer}
        onClose={() => setDrawer(null)}
      />
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVariantsWidget
