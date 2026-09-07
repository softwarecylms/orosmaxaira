import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ViewPageButton } from "../components/view-page-button"
import { publicPath } from "../lib/storefront"

/**
 * "Προβολή στο κατάστημα" — the eye button that opens a product's public page,
 * the same one the Δραστηριότητες / Εργαστήρια / Επισκέψεις Σχολείων editors
 * already carry. Products are a core Medusa page, so it arrives as a widget.
 *
 * The button belongs beside the product title, and the admin has no widget zone
 * inside that header — the nearest zone renders a separate card above it. So the
 * widget mounts in `product.details.before` and portals the button into the
 * title's <h1> (Medusa renders the general section's <Heading> as an h1 whose
 * text is the product title).
 *
 * It goes *inside* the h1 on purpose: the header row is `justify-between` with
 * exactly two children (title / status + menu), and adding a third would space
 * the three apart and strand the icon mid-row.
 *
 * If the heading never appears — a dashboard restyle, a slow mount — the widget
 * falls back to its own card, so the button is never simply lost.
 */

const MARKER = "data-oros-view-product"
const GIVE_UP_MS = 2000

/** The <h1> holding the product title, or null while the section is mounting. */
function findTitleHeading(title: string): HTMLElement | null {
  const wanted = title.trim()
  if (!wanted) return null
  for (const h1 of Array.from(document.querySelectorAll("h1"))) {
    if (h1.textContent?.trim() === wanted) return h1 as HTMLElement
  }
  return null
}

const ProductViewWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    let slot: HTMLElement | null = null

    const attach = () => {
      const heading = findTitleHeading(data.title)
      if (!heading) return false
      slot = heading.querySelector<HTMLElement>(`[${MARKER}]`)
      if (!slot) {
        slot = document.createElement("span")
        slot.setAttribute(MARKER, "")
        slot.className = "ml-2 inline-flex align-middle"
        heading.appendChild(slot)
      }
      setHost(slot)
      return true
    }

    if (attach()) return

    // The general section can mount after the widget zone above it.
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
  }, [data.id, data.title])

  const button = <ViewPageButton kind="product" slug={data.handle} />

  if (host) return createPortal(button, host)
  if (!gaveUp) return null

  const path = publicPath("product", data.handle)
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col">
          <Heading level="h2">Προβολή στο κατάστημα</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {path || "Το προϊόν χρειάζεται handle για να έχει δημόσια σελίδα."}
          </Text>
        </div>
        {button}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductViewWidget
