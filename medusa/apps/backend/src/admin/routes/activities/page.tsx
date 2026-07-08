import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Table } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"
import { ActivityEditor } from "../../components/activity-editor"

type Activity = {
  id: string
  title: string
  slug: string
  status: string
  price_tiers?: { price: number }[] | null
}

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () =>
    sdk.client
      .fetch<{ activities: Activity[] }>("/admin/activities", { method: "GET" })
      .then((r) => setActivities(r.activities))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const priceRange = (a: Activity) => {
    const prices = (a.price_tiers ?? []).map((t) => t.price).filter((p) => p > 0)
    if (!prices.length) return "—"
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `${min}€` : `${min}–${max}€`
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Δραστηριότητες</Heading>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-ui-fg-subtle">Φόρτωση…</div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Τίτλος</Table.HeaderCell>
              <Table.HeaderCell>Permalink</Table.HeaderCell>
              <Table.HeaderCell>Τιμές</Table.HeaderCell>
              <Table.HeaderCell>Κατάσταση</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {activities.map((a) => (
              <Table.Row key={a.id}>
                <Table.Cell>{a.title}</Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">/{a.slug}</Table.Cell>
                <Table.Cell>{priceRange(a)}</Table.Cell>
                <Table.Cell>
                  <Badge
                    size="2xsmall"
                    color={a.status === "published" ? "green" : "grey"}
                  >
                    {a.status === "published" ? "Δημοσιευμένη" : "Πρόχειρη"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditingId(a.id)}
                    >
                      Επεξεργασία
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {activities.length === 0 ? (
              <Table.Row>
                <Table.Cell className="text-ui-fg-subtle">
                  Καμία δραστηριότητα ακόμη.
                </Table.Cell>
              </Table.Row>
            ) : null}
          </Table.Body>
        </Table>
      )}

      {editingId ? (
        <ActivityEditor
          activityId={editingId}
          open
          onClose={() => setEditingId(null)}
          onSaved={load}
        />
      ) : null}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Δραστηριότητες",
  icon: Calendar,
})

export default ActivitiesPage
