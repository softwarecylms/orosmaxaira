import { useEffect, useRef, useState, type ReactNode } from "react"
import { IconButton, Text } from "@medusajs/ui"
import { ArrowPath, ComputerDesktop, Phone, ArrowUpRightOnBox } from "@medusajs/icons"
import { publicPath, useStorefrontOrigin } from "../lib/storefront"

/**
 * Click-to-edit editor: the real page on the left, the selected section's fields
 * on the right, and a list of sections to jump between.
 *
 * These pages are a fixed, booking-aware template rather than a block canvas, so
 * there is nothing to drag — but everything visible can be clicked and edited in
 * place. The page marks its sections with `data-edit="<key>"` and
 * `PreviewBridge` (storefront) posts the key on click; selecting in the list
 * posts back so the preview scrolls to it.
 */

/** Width the desktop preview is rendered at before scaling to fit. */
const DESKTOP_WIDTH = 1440

export type EditorSection = {
  key: string
  label: string
  /** Fields to show when this section is selected. */
  render: () => ReactNode
}

export function VisualEditor({
  kind,
  slug,
  path: pathProp,
  sections,
  reloadToken = 0,
}: {
  kind?: "activity" | "workshop" | "school"
  slug?: string | null
  /** The page to preview, when it is not an activity/workshop/school page. */
  path?: string
  sections: EditorSection[]
  reloadToken?: number
}) {
  const origin = useStorefrontOrigin()
  const path = pathProp ?? (kind ? publicPath(kind, slug) : "")
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [nonce, setNonce] = useState(0)
  const [active, setActive] = useState(sections[0]?.key ?? "")
  /**
   * Keys the loaded page actually renders (it reports them on load). Sections
   * that are missing stay in the list — a gallery with no images yet has no
   * element to click, and hiding it would make the first image unaddable — but
   * they are dimmed so it is clear why clicking the page won't reach them.
   */
  const [present, setPresent] = useState<string[] | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  /**
   * Desktop preview renders the page at a real desktop width and scales it down
   * to the column, so editors see the desktop design rather than the tablet
   * layout a ~700px-wide frame would trigger.
   */
  const stage = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setStageSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = device === "desktop" && stageSize.w ? Math.min(1, stageSize.w / DESKTOP_WIDTH) : 1

  useEffect(() => {
    if (reloadToken) setNonce((n) => n + 1)
  }, [reloadToken])

  // Preview → panel: a section was clicked in the page.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.source !== "oros-preview") return
      if (e.data.type === "ready" && Array.isArray(e.data.keys)) {
        setPresent(e.data.keys.filter((k: unknown) => typeof k === "string"))
        return
      }
      if (e.data.type !== "select") return
      if (sections.some((s) => s.key === e.data.key)) setActive(e.data.key)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [sections])

  // Panel → preview: scroll the page to the section picked in the list.
  const pick = (key: string) => {
    setActive(key)
    frame.current?.contentWindow?.postMessage(
      { source: "oros-admin", type: "highlight", key },
      "*",
    )
  }

  const current = sections.find((s) => s.key === active) ?? sections[0]
  const src = origin && path ? `${origin}${path}?preview=1&r=${nonce}` : ""

  return (
    <div className="grid gap-4 xl:grid-cols-[170px_minmax(0,1fr)_360px]">
      {/* Section list */}
      <div className="hidden flex-col gap-1 xl:flex">
        <Text size="xsmall" weight="plus" className="px-1 pb-1 text-ui-fg-muted">
          ΕΝΟΤΗΤΕΣ
        </Text>
        {sections.map((s) => {
          const missing = !!present && !present.includes(s.key)
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => pick(s.key)}
              title={missing ? "Δεν εμφανίζεται ακόμη στη σελίδα" : undefined}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                s.key === current?.key
                  ? "bg-ui-bg-base text-ui-fg-base shadow-elevation-card-rest"
                  : "text-ui-fg-subtle hover:bg-ui-bg-base-hover"
              } ${missing ? "opacity-50" : ""}`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Preview */}
      <div className="flex h-[calc(100vh-16rem)] min-h-[520px] flex-col overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center justify-between gap-2 border-b border-ui-border-base px-3 py-2">
          <Text size="xsmall" className="truncate text-ui-fg-subtle">
            Κάντε κλικ σε μια ενότητα για επεξεργασία
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
              disabled={!src}
              onClick={() => window.open(`${origin}${path}`, "_blank", "noopener,noreferrer")}
            >
              <ArrowUpRightOnBox />
            </IconButton>
          </div>
        </div>
        <div ref={stage} className="relative flex flex-1 justify-center overflow-hidden bg-ui-bg-base">
          {src ? (
            device === "mobile" ? (
              <iframe
                ref={frame}
                key={src}
                src={src}
                title="Οπτικός επεξεργαστής"
                className="my-2 h-[calc(100%-1rem)] w-[390px] rounded border border-ui-border-base bg-white"
              />
            ) : (
              <iframe
                ref={frame}
                key={src}
                src={src}
                title="Οπτικός επεξεργαστής"
                className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                style={{
                  width: DESKTOP_WIDTH,
                  height: stageSize.h / scale,
                  transform: `scale(${scale})`,
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center">
              <Text size="small" className="text-ui-fg-muted">
                Φόρτωση προεπισκόπησης…
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Inspector */}
      <div className="flex max-h-[calc(100vh-16rem)] flex-col overflow-y-auto rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
        <Text size="small" weight="plus" className="mb-3 text-ui-fg-base">
          {current?.label ?? "Ενότητα"}
        </Text>
        <div className="flex flex-col gap-4">{current?.render()}</div>
      </div>
    </div>
  )
}
