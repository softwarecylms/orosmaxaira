import { useEffect, useRef, useState } from "react"
import { IconButton, Text } from "@medusajs/ui"
import { ArrowPath, ComputerDesktop, Phone, ArrowUpRightOnBox } from "@medusajs/icons"
import { publicPath, useStorefrontOrigin } from "../lib/storefront"

/**
 * Live preview of the public page beside the editor.
 *
 * These pages are a fixed, booking-aware template rather than a block
 * composition, so there is nothing to drag; what an editor actually needs is to
 * see the effect of a field change. The iframe reloads whenever `reloadToken`
 * changes — pass the save counter — and can be refreshed by hand.
 *
 * The storefront sends `X-Frame-Options: SAMEORIGIN`, which would block this,
 * so the URL carries `?preview=1`; `next.config.ts` answers that request with a
 * CSP `frame-ancestors` allow-list naming the admin instead. Ordinary visitors
 * keep SAMEORIGIN.
 *
 * Generic on purpose (`kind` + `slug`) so the activity and workshop editors can
 * reuse it unchanged.
 */
export function PagePreview({
  kind,
  slug,
  reloadToken = 0,
}: {
  kind: "activity" | "workshop" | "school"
  slug?: string | null
  /** Bump to force a reload — e.g. a counter incremented after each save. */
  reloadToken?: number
}) {
  const origin = useStorefrontOrigin()
  const path = publicPath(kind, slug)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [nonce, setNonce] = useState(0)
  const frame = useRef<HTMLIFrameElement>(null)

  // Reload when the record is saved.
  useEffect(() => {
    if (reloadToken) setNonce((n) => n + 1)
  }, [reloadToken])

  if (!origin || !path) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle p-6">
        <Text size="small" className="text-ui-fg-muted">
          {path ? "Φόρτωση προεπισκόπησης…" : "Αποθηκεύστε πρώτα για προεπισκόπηση."}
        </Text>
      </div>
    )
  }

  // `r` busts the iframe's own cache; `preview=1` unlocks framing.
  const src = `${origin}${path}?preview=1&r=${nonce}`

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
      <div className="flex items-center justify-between gap-2 border-b border-ui-border-base px-3 py-2">
        <Text size="xsmall" weight="plus" className="truncate text-ui-fg-subtle">
          Προεπισκόπηση · {path}
        </Text>
        <div className="flex items-center gap-0.5">
          <IconButton
            size="small"
            variant={device === "desktop" ? "primary" : "transparent"}
            type="button"
            title="Υπολογιστής"
            onClick={() => setDevice("desktop")}
          >
            <ComputerDesktop />
          </IconButton>
          <IconButton
            size="small"
            variant={device === "mobile" ? "primary" : "transparent"}
            type="button"
            title="Κινητό"
            onClick={() => setDevice("mobile")}
          >
            <Phone />
          </IconButton>
          <IconButton
            size="small"
            variant="transparent"
            type="button"
            title="Ανανέωση"
            onClick={() => setNonce((n) => n + 1)}
          >
            <ArrowPath />
          </IconButton>
          <IconButton
            size="small"
            variant="transparent"
            type="button"
            title="Άνοιγμα σε νέα καρτέλα"
            onClick={() => window.open(`${origin}${path}`, "_blank", "noopener,noreferrer")}
          >
            <ArrowUpRightOnBox />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-1 justify-center overflow-hidden bg-ui-bg-base p-2">
        <iframe
          ref={frame}
          key={src}
          src={src}
          title="Προεπισκόπηση σελίδας"
          className={`h-full rounded border border-ui-border-base bg-white ${
            device === "mobile" ? "w-[390px]" : "w-full"
          }`}
        />
      </div>
    </div>
  )
}
