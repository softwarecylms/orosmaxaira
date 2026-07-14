import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Table } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"
import { WorkshopEditor } from "../../components/workshop-editor"

type Workshop = {
  id: string
  title: string
  slug: string
  status: string
  season_label?: string | null
  months?: number[] | null
}

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () =>
    sdk.client
      .fetch<{ workshops: Workshop[] }>("/admin/workshops", { method: "GET" })
      .then((r) => setWorkshops(r.workshops))
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Εργαστήρια</Heading>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-ui-fg-subtle">Φόρτωση…</div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Τίτλος</Table.HeaderCell>
              <Table.HeaderCell>Permalink</Table.HeaderCell>
              <Table.HeaderCell>Εποχή</Table.HeaderCell>
              <Table.HeaderCell>Μήνες</Table.HeaderCell>
              <Table.HeaderCell>Κατάσταση</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {workshops.map((w) => (
              <Table.Row key={w.id}>
                <Table.Cell>{w.title}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">/{w.slug}</Table.Cell>
                <Table.Cell>{w.season_label ?? "—"}</Table.Cell>
                <Table.Cell>{(w.months ?? []).join(", ") || "κατόπιν ραντεβού"}</Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={w.status === "published" ? "green" : "grey"}>
                    {w.status === "published" ? "Δημοσιευμένο" : "Πρόχειρο"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <Button size="small" variant="secondary" onClick={() => setEditingId(w.id)}>
                      Επεξεργασία
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {workshops.length === 0 ? (
              <Table.Row>
                <Table.Cell className="text-ui-fg-subtle">Κανένα εργαστήρι ακόμη.</Table.Cell>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table>
      )}

      {editingId ? (
        <WorkshopEditor
          workshopId={editingId}
          open
          onClose={() => setEditingId(null)}
          onSaved={load}
        />
      ) : null}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Εργαστήρια",
  icon: Sparkles,
})

export default WorkshopsPage
