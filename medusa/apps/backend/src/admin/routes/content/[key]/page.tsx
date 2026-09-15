import { Badge, Button, Container, Drawer, Heading, Text, toast } from "@medusajs/ui"
import { ArrowUturnLeft, History } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { LangToggle } from "../../../components/lang-toggle"
import { VisualEditor, type EditorSection } from "../../../components/visual-editor"
import { Node } from "../../../components/content-form"
import { isSharedLeaf, labelFor, orderSections, pageFor } from "../../../lib/content-pages"
import {
  diff,
  overlay,
  rebaseEnglish,
  sameContent,
  setAt,
  type Json,
  type Obj,
  type Path,
} from "../../../lib/content-tree"

type Entry = {
  key: string
  data: Obj | null
  translations: { en?: Json } | null
  updated_at: string
  updated_by: string | null
}
type Revision = { id: string; created_at: string; created_by: string | null }

const when = (iso: string) =>
  new Date(iso).toLocaleString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

/**
 * Editor for one content entry: the live page on the left, the clicked
 * section's fields on the right (see VisualEditor), a Greek/English switch,
 * and Publish. The editor keeps a full Greek tree and a full English tree;
 * publishing stores the Greek tree plus only what differs in English.
 */
const ContentEditorPage = () => {
  const { key = "" } = useParams()
  const page = pageFor(key)

  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [el, setEl] = useState<Obj>({})
  const [en, setEn] = useState<Obj>({})
  const [saved, setSaved] = useState<{ el: Obj; en: Obj }>({ el: {}, en: {} })
  const [lang, setLang] = useState<"el" | "en">("el")
  const [saving, setSaving] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [users, setUsers] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { entry } = await sdk.client.fetch<{ entry: Entry | null }>(`/admin/content/${key}`, { method: "GET" })
      if (!entry?.data) {
        setMissing(true)
        return
      }
      const elTree = entry.data
      const enTree = (overlay(elTree, entry.translations?.en) ?? elTree) as Obj
      setEl(elTree)
      setEn(enTree)
      setSaved({ el: elTree, en: enTree })
      setMissing(false)
    } catch (e: any) {
      toast.error("Η σελίδα δεν φορτώθηκε: " + (e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    sdk.client
      .fetch<{ users: { id: string; email: string; first_name?: string | null }[] }>("/admin/users", {
        method: "GET",
        query: { limit: 100 },
      })
      .then(({ users }) => setUsers(Object.fromEntries(users.map((u) => [u.id, u.first_name || u.email]))))
      .catch(() => {})
  }, [])

  const dirty = !sameContent(el, saved.el) || !sameContent(en, saved.en)

  // Warn before leaving with unpublished changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const onSet = useCallback(
    (path: Path, value: Json) => {
      if (lang === "en") {
        setEn(setAt(en, path, value) as Obj)
        return
      }
      const next = setAt(el, path, value) as Obj
      setEl(next)
      // Keep English aligned with the Greek structure, and following Greek text
      // it has not translated.
      setEn(rebaseEnglish(next, el, en, (k) => isSharedLeaf(k, undefined, page)) as Obj)
    },
    [el, en, lang, page]
  )

  const publish = async () => {
    setSaving(true)
    try {
      const translations = { en: diff(el, en) ?? {} }
      const res = await sdk.client.fetch<{ revalidated: boolean }>(`/admin/content/${key}`, {
        method: "POST",
        body: { data: el, translations },
      })
      setSaved({ el, en })
      setReloadToken((n) => n + 1)
      toast.success(
        res.revalidated
          ? "Δημοσιεύτηκε — οι αλλαγές φαίνονται ήδη στο site"
          : "Δημοσιεύτηκε — θα φανεί στο site σε λίγα λεπτά"
      )
    } catch (e: any) {
      toast.error("Η δημοσίευση απέτυχε: " + (e?.message ?? e))
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    if (!window.confirm("Να απορριφθούν οι αλλαγές που δεν έχουν δημοσιευτεί;")) return
    setEl(saved.el)
    setEn(saved.en)
  }

  const openHistory = async () => {
    setHistoryOpen(true)
    try {
      const { revisions } = await sdk.client.fetch<{ revisions: Revision[] }>(`/admin/content/${key}/revisions`, {
        method: "GET",
      })
      setRevisions(revisions)
    } catch {
      setRevisions([])
    }
  }

  const restore = async (rev: Revision) => {
    if (!window.confirm(`Επαναφορά της έκδοσης της ${when(rev.created_at)}; Θα δημοσιευτεί αμέσως.`)) return
    try {
      await sdk.client.fetch(`/admin/content/${key}/revisions/${rev.id}/restore`, { method: "POST" })
      toast.success("Η έκδοση επαναφέρθηκε")
      setHistoryOpen(false)
      await load()
      setReloadToken((n) => n + 1)
    } catch (e: any) {
      toast.error("Η επαναφορά απέτυχε: " + (e?.message ?? e))
    }
  }

  const current = lang === "en" ? en : el
  const sections: EditorSection[] = useMemo(
    () =>
      orderSections(Object.keys(el), page)
        .filter((k) => k !== "_id")
        .map((k) => ({
          key: k,
          label: labelFor(k, page, true),
          render: () => (
            <Node page={page} lang={lang} value={current[k]} greek={el[k]} path={[k]} onSet={onSet} k={k} depth={0} />
          ),
        })),
    [el, current, lang, page, onSet]
  )

  if (!page) {
    return (
      <Container className="px-6 py-8">
        <Text>Άγνωστη σελίδα «{key}».</Text>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/content" className="text-ui-fg-muted hover:text-ui-fg-base" title="Όλες οι σελίδες">
            <ArrowUturnLeft />
          </Link>
          <Heading>{page.label}</Heading>
          {dirty ? <Badge color="orange" size="small">Μη δημοσιευμένες αλλαγές</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" variant="transparent" onClick={openHistory} disabled={missing}>
            <History />
            Ιστορικό
          </Button>
          <Button size="small" variant="secondary" onClick={discard} disabled={!dirty || saving}>
            Απόρριψη
          </Button>
          <Button size="small" onClick={publish} isLoading={saving} disabled={!dirty || missing}>
            Δημοσίευση
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-ui-fg-subtle">Φόρτωση…</div>
      ) : missing ? (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">
            Δεν υπάρχει ακόμη αποθηκευμένο περιεχόμενο για αυτή τη σελίδα — το site δείχνει το αρχικό
            κείμενο. Φορτώστε το με το script seed-content.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-6 pb-6">
          <LangToggle lang={lang} onChange={setLang} />
          <VisualEditor path={lang === "en" ? `/en${page.path === "/" ? "" : page.path}` : page.path} sections={sections} reloadToken={reloadToken} />
          {dirty ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              Η προεπισκόπηση δείχνει τη δημοσιευμένη σελίδα· οι αλλαγές σας εμφανίζονται εκεί μετά τη
              «Δημοσίευση».
            </Text>
          ) : null}
        </div>
      )}

      <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Ιστορικό δημοσιεύσεων</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-2 overflow-y-auto">
            {revisions.length === 0 ? (
              <Text size="small" className="text-ui-fg-subtle">
                Καμία έκδοση ακόμη.
              </Text>
            ) : (
              revisions.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-ui-border-base px-3 py-2">
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      {when(r.created_at)}
                      {i === 0 ? <span className="font-normal text-ui-fg-muted"> · τρέχουσα</span> : null}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {r.created_by ? users[r.created_by] ?? "Διαχειριστής" : "Αρχική φόρτωση"}
                    </Text>
                  </div>
                  {i > 0 ? (
                    <Button size="small" variant="secondary" onClick={() => restore(r)}>
                      Επαναφορά
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export default ContentEditorPage
