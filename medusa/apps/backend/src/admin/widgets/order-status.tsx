import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import { ChevronDownMini } from "@medusajs/icons"
import { Button, Container, DropdownMenu, Heading, toast, usePrompt } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { sdk } from "../lib/sdk"

/**
 * "Κατάσταση" — change an order's status from the order header, next to the
 * Captured / Not fulfilled badges.
 *
 * Medusa has no editable status: an order moves forward through fulfillment →
 * shipment → delivery → completion, or is canceled. Picking a status runs every
 * step between the current one and the target, through the same admin endpoints
 * the dashboard's own forms use. Going back is only possible from "fulfilled"
 * (the fulfillment is canceled); anything shipped needs a return instead.
 *
 * Like product-view.tsx, the admin has no widget zone inside that header, so the
 * widget mounts in `order.details.before` and portals the button into the badge
 * row, falling back to its own card if the header never appears.
 */

type Status = "pending" | "fulfilled" | "shipped" | "delivered" | "completed" | "canceled"

const STEPS: { value: Status; label: string }[] = [
  { value: "pending", label: "Εκκρεμεί" },
  { value: "fulfilled", label: "Έτοιμη για αποστολή" },
  { value: "shipped", label: "Απεστάλη" },
  { value: "delivered", label: "Παραδόθηκε" },
  { value: "completed", label: "Ολοκληρώθηκε" },
]
const RANK = Object.fromEntries(STEPS.map((s, i) => [s.value, i])) as Record<Status, number>

const MARKER = "data-oros-order-status"
const GIVE_UP_MS = 2000
const ORDER_FIELDS =
  "id,status,fulfillment_status,*items,*items.detail,*shipping_methods,*fulfillments,*fulfillments.items"

type Order = HttpTypes.AdminOrder

function currentStatus(order: Order): Status {
  if (order.status === "canceled") return "canceled"
  if (order.status === "completed") return "completed"
  const f = order.fulfillment_status
  if (f === "delivered" || f === "partially_delivered") return "delivered"
  if (f === "shipped" || f === "partially_shipped") return "shipped"
  if (f === "fulfilled" || f === "partially_fulfilled") return "fulfilled"
  return "pending"
}

const liveFulfillments = (order: Order) => (order.fulfillments ?? []).filter((f) => !f.canceled_at)

async function load(id: string): Promise<Order> {
  const { order } = await sdk.admin.order.retrieve(id, { fields: ORDER_FIELDS })
  return order
}

/** The stock location behind the order's shipping option, else the first one. */
async function fulfillmentTarget(order: Order) {
  const optionId = order.shipping_methods?.[0]?.shipping_option_id ?? undefined
  if (optionId) {
    try {
      const { shipping_option } = await sdk.admin.shippingOption.retrieve(optionId, {
        fields: "id,*service_zone,*service_zone.fulfillment_set,*service_zone.fulfillment_set.location",
      })
      const location = (shipping_option as any).service_zone?.fulfillment_set?.location?.id
      if (location) return { location_id: location as string, shipping_option_id: optionId }
    } catch {
      // Option deleted since the order was placed — fall through.
    }
  }
  const { stock_locations } = await sdk.admin.stockLocation.list({ limit: 1 })
  return { location_id: stock_locations[0]?.id, shipping_option_id: undefined }
}

async function fulfill(order: Order) {
  const items = (order.items ?? [])
    .map((i) => ({ id: i.id, quantity: i.quantity - (i.detail?.fulfilled_quantity ?? 0) }))
    .filter((i) => i.quantity > 0)
  if (!items.length) return
  const target = await fulfillmentTarget(order)
  await sdk.admin.order.createFulfillment(order.id, {
    items,
    location_id: target.location_id,
    ...(target.shipping_option_id ? { shipping_option_id: target.shipping_option_id } : {}),
  } as HttpTypes.AdminCreateOrderFulfillment)
}

async function ship(order: Order) {
  for (const f of liveFulfillments(order).filter((f) => !f.shipped_at)) {
    // `items` is on the response when requested, but missing from the type.
    const fItems: { line_item_id?: string | null; quantity: number }[] = (f as any).items ?? []
    const items = fItems
      .filter((i) => !!i.line_item_id)
      .map((i) => ({ id: i.line_item_id!, quantity: i.quantity }))
    await sdk.admin.order.createShipment(order.id, f.id, { items })
  }
}

async function deliver(order: Order) {
  for (const f of liveFulfillments(order).filter((f) => !f.delivered_at)) {
    await sdk.admin.order.markAsDelivered(order.id, f.id)
  }
}

async function unfulfill(order: Order) {
  for (const f of liveFulfillments(order).filter((f) => !f.shipped_at)) {
    await sdk.admin.order.cancelFulfillment(order.id, f.id, {})
  }
}

async function moveTo(id: string, target: Status) {
  let order = await load(id)
  const from = currentStatus(order)

  if (target === "canceled") {
    if (liveFulfillments(order).some((f) => f.shipped_at)) {
      throw new Error("Η παραγγελία έχει ήδη αποσταλεί — χρησιμοποιήστε επιστροφή αντί για ακύρωση.")
    }
    await unfulfill(order)
    await sdk.admin.order.cancel(id)
    return
  }

  if (target === "pending") {
    if (from !== "fulfilled") throw new Error("Μόνο μια παραγγελία που δεν έχει αποσταλεί γυρίζει σε εκκρεμότητα.")
    await unfulfill(order)
    return
  }

  if (RANK[target] >= RANK.fulfilled && RANK[from] < RANK.fulfilled) {
    await fulfill(order)
    order = await load(id)
  }
  if (RANK[target] >= RANK.shipped && RANK[from] < RANK.shipped) {
    await ship(order)
    order = await load(id)
  }
  if (RANK[target] >= RANK.delivered && RANK[from] < RANK.delivered) {
    await deliver(order)
  }
  if (target === "completed") {
    await sdk.admin.order.complete(id, {})
  }
}

/** The badge row of the order header: the flex wrapper holding badges + ⋯ menu. */
function findBadgeRow(displayId: number | string | undefined): HTMLElement | null {
  const wanted = `#${displayId}`
  for (const h of Array.from(document.querySelectorAll("h1, h2"))) {
    if (h.textContent?.trim() !== wanted) continue
    const header = h.closest(".justify-between")
    const row = header?.lastElementChild
    if (row instanceof HTMLElement) return row
  }
  return null
}

const OrderStatusWidget = ({ data }: DetailWidgetProps<Order>) => {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [gaveUp, setGaveUp] = useState(false)
  const [busy, setBusy] = useState(false)
  const prompt = usePrompt()
  const queryClient = useQueryClient()

  useEffect(() => {
    let slot: HTMLElement | null = null

    const attach = () => {
      const row = findBadgeRow(data.display_id)
      if (!row) return false
      slot = row.querySelector<HTMLElement>(`[${MARKER}]`)
      if (!slot) {
        slot = document.createElement("div")
        slot.setAttribute(MARKER, "")
        slot.className = "flex items-center"
        row.insertBefore(slot, row.lastElementChild)
      }
      setHost(slot)
      return true
    }

    if (attach()) return

    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => {
      observer.disconnect()
      setGaveUp(true)
    }, GIVE_UP_MS)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      slot?.remove()
      setHost(null)
    }
  }, [data.id, data.display_id])

  const status = currentStatus(data)
  const locked = status === "canceled" || status === "completed"
  const currentLabel =
    status === "canceled" ? "Ακυρώθηκε" : STEPS.find((s) => s.value === status)!.label

  const choose = async (target: Status) => {
    if (target === status) return
    const label = target === "canceled" ? "Ακυρώθηκε" : STEPS.find((s) => s.value === target)!.label
    const ok = await prompt({
      title: `Αλλαγή σε «${label}»;`,
      description:
        target === "canceled"
          ? `Η παραγγελία #${data.display_id} θα ακυρωθεί και ό,τι έχει πληρωθεί θα επιστραφεί αυτόματα στην κάρτα του πελάτη. Δεν αναιρείται.`
          : target === "completed"
            ? `Η παραγγελία #${data.display_id} θα κλείσει. Μετά δεν γίνεται ακύρωση — μόνο επιστροφή.`
            : `Η παραγγελία #${data.display_id} θα περάσει σε «${label}».`,
      confirmText: "Συνέχεια",
      cancelText: "Άκυρο",
    })
    if (!ok) return

    setBusy(true)
    try {
      await moveTo(data.id, target)
      toast.success(`Η παραγγελία είναι πλέον «${label}».`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Η αλλαγή δεν ολοκληρώθηκε.")
    } finally {
      await queryClient.invalidateQueries()
      setBusy(false)
    }
  }

  const disabledFor = (target: Status) => {
    if (locked || target === status) return true
    if (target === "pending") return status !== "fulfilled"
    if (target === "canceled") return RANK[status] >= RANK.shipped
    return RANK[target] < RANK[status]
  }

  const menu = (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button size="small" variant="secondary" disabled={busy || locked} isLoading={busy}>
          Κατάσταση: {currentLabel}
          <ChevronDownMini />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {STEPS.map((s) => (
          <DropdownMenu.Item key={s.value} disabled={disabledFor(s.value)} onClick={() => choose(s.value)}>
            {s.value === status ? "✓ " : ""}
            {s.label}
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          disabled={disabledFor("canceled")}
          onClick={() => choose("canceled")}
          className="text-ui-fg-error"
        >
          Ακύρωση παραγγελίας
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )

  if (host) return createPortal(menu, host)
  if (!gaveUp) return null

  return (
    <Container className="flex items-center justify-between gap-4 px-6 py-4">
      <Heading level="h2">Κατάσταση παραγγελίας</Heading>
      {menu}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderStatusWidget
