import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-off formatting fix: three product descriptions opened with a shouted
 * ALL-CAPS headline carried over from the old store, and one wrote "100 %".
 *
 * Greek capitals drop their accents, so the headline cannot simply be
 * lower-cased — «ΒΑΛΣΑΜΟ» would become «βαλσαμο». ACCENTS below restores the
 * correct form for every word that appears in these headlines.
 * Idempotent — re-run any time.
 *   npx medusa exec ./src/scripts/fix-description-headline.ts
 */

const ACCENTS: Record<string, string> = {
  φυσικη: "φυσική", φυσικο: "φυσικό", κηραλοιφη: "κηραλοιφή", βαλσαμο: "βάλσαμο",
  ευαισθητες: "ευαίσθητες", επιδερμιδες: "επιδερμίδες", χωρις: "χωρίς", αρωμα: "άρωμα",
  βιολογικο: "βιολογικό", κερι: "κερί", μελισσας: "μέλισσας", μελι: "μέλι",
  προπολη: "πρόπολη", βασιλικο: "βασιλικό", πολτο: "πολτό", πολυ: "πολύ",
  ξηρα: "ξηρά", σκασμενα: "σκασμένα", χερια: "χέρια", χειλη: "χείλη",
  αγνο: "αγνό", καλεντουλα: "καλέντουλα", για: "για", με: "με", και: "και", τα: "τα",
}

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC").toLowerCase()

function sentenceCase(line: string): string {
  const out = line.replace(/[Α-ΩΆ-ΏA-Z][Α-ΩΆ-ΏA-Z'’-]*/g, (word) => {
    if (/^[A-Z'’-]+$/.test(word)) return word.toLowerCase()
    return ACCENTS[stripAccents(word)] ?? word.toLowerCase()
  })
  return out.charAt(0).toUpperCase() + out.slice(1)
}

function isAllCaps(line: string): boolean {
  const letters = line.replace(/[^Α-Ωα-ωά-ώΆ-ΏA-Za-z]/g, "")
  const upper = (line.match(/[Α-ΩΆ-ΏA-Z]/g) ?? []).length
  return letters.length > 20 && upper / letters.length > 0.85
}

function tidy(value: string): string {
  const lines = value.split("\n")
  if (lines.length && isAllCaps(lines[0])) lines[0] = sentenceCase(lines[0])
  let out = lines.join("\n")
  // English headlines sit inline, ended by a full stop
  out = out.replace(/^([A-Z0-9%][A-Z0-9%,&'’()/ -]{20,}?)(\.)(\s)/, (m, caps: string, dot, sp) => {
    const letters = caps.replace(/[^A-Za-z]/g, "")
    const upper = (caps.match(/[A-Z]/g) ?? []).length
    if (!letters.length || upper / letters.length < 0.85) return m
    return caps.charAt(0) + caps.slice(1).toLowerCase() + dot + sp
  })
  return out.replace(/(\d)\s+%/g, "$1%")
}

export default async function fixDescriptionHeadline({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "description", "metadata"],
  })

  let changed = 0
  for (const p of products) {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const update: Record<string, unknown> = {}

    if (typeof p.description === "string") {
      const next = tidy(p.description)
      if (next !== p.description) update.description = next
    }
    if (typeof metadata.description_en === "string") {
      const next = tidy(metadata.description_en)
      if (next !== metadata.description_en) {
        update.metadata = { ...metadata, description_en: next }
      }
    }
    if (!Object.keys(update).length) continue

    await productService.updateProducts(p.id, update)
    changed++
    logger.info(`Headline tidied: ${p.handle}`)
  }

  logger.info(`✓ Description headlines tidied — products updated: ${changed}`)
}
