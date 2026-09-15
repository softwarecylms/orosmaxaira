import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"
import { CONTENT_PAGES } from "../../lib/content-pages"

type EntryRow = { key: string; updated_at: string; updated_by: string | null; has_draft: boolean }

const when = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—"

/** The list of editable pages, grouped, with when each was last published. */
const ContentListPage = () => {
  const [rows, setRows] = useState<Record<string, EntryRow>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.client
      .fetch<{ entries: EntryRow[] }>("/admin/content", { method: "GET" })
      .then(({ entries }) => setRows(Object.fromEntries(entries.map((e) => [e.key, e]))))
      .catch(() => setRows({}))
      .finally(() => setLoading(false))
  }, [])

  const groups = ["Γενικά", "Σελίδες", "Νομικά"] as const

  return (
    <Container className="p-0">
      <div className="px-6 py-4">
        <Heading>Περιεχόμενο σελίδων</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Κείμενα, εικόνες, σύνδεσμοι και SEO κάθε σελίδας, στα Ελληνικά και στα Αγγλικά. Τα
          προϊόντα, οι δραστηριότητες και τα εργαστήρια έχουν τις δικές τους ενότητες.
        </Text>
      </div>
      {groups.map((group) => (
        <div key={group} className="border-t border-ui-border-base px-6 py-4">
          <Text size="xsmall" weight="plus" className="pb-2 uppercase text-ui-fg-muted">
            {group}
          </Text>
          <div className="flex flex-col divide-y divide-ui-border-base">
            {CONTENT_PAGES.filter((p) => p.group === group).map((p) => {
              const row = rows[p.key]
              return (
                <Link
                  key={p.key}
                  to={`/content/${p.key}`}
                  className="flex items-center justify-between gap-4 py-3 hover:bg-ui-bg-base-hover"
                >
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      {p.label}
                    </Text>
                    {p.description ? (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {p.description}
                      </Text>
                    ) : null}
                  </div>
                  <Text size="xsmall" className="shrink-0 text-ui-fg-muted">
                    {loading ? "…" : row ? `Ενημέρωση ${when(row.updated_at)}${row.has_draft ? " · πρόχειρο" : ""}` : "Χωρίς αποθηκευμένο περιεχόμενο"}
                  </Text>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Περιεχόμενο σελίδων",
  icon: DocumentText,
})

export default ContentListPage
