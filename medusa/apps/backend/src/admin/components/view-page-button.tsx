import { IconButton } from "@medusajs/ui"
import { Eye } from "@medusajs/icons"
import { publicPath, useStorefrontOrigin } from "../lib/storefront"

/**
 * Opens the public page for the record being edited, in a new tab.
 *
 * The origin comes from the backend's `STOREFRONT_URL` (via `GET /admin/media`)
 * rather than being hardcoded, so it points at the right site in development and
 * in production. Disabled until the origin is known or while the record has no
 * slug — a new, unsaved activity has no page to look at yet.
 */
export function ViewPageButton({
  kind,
  slug,
}: {
  kind: "activity" | "workshop" | "school"
  slug?: string | null
}) {
  const origin = useStorefrontOrigin()
  const path = publicPath(kind, slug)
  const href = origin && path ? `${origin}${path}` : ""

  const title = !path
    ? "Αποθηκεύστε πρώτα για να δείτε τη σελίδα"
    : !origin
      ? "Φόρτωση…"
      : `Προβολή σελίδας: ${path}`

  return (
    <IconButton
      size="small"
      variant="transparent"
      type="button"
      title={title}
      disabled={!href}
      onClick={() => href && window.open(href, "_blank", "noopener,noreferrer")}
    >
      <Eye />
    </IconButton>
  )
}
