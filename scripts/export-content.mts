// Export the site's built-in page copy (the `*-content.ts` files, both
// languages) as seed data for the Medusa content module. Run with:
//
//   npx tsx scripts/export-content.mts
//
// Writes medusa/apps/backend/src/scripts/content-seed/<key>.json — one file per
// content entry: `{ key, data, translations: { en } }`, where `data` is the
// Greek tree with an `_id` on every list item and `en` holds only what differs
// in English. The Medusa script seed-content.ts loads them.
//
// Every entry is checked before it is written: Greek and English must both
// come back exactly from the stored form, the same way the storefront loader
// reads it. Any mismatch aborts the export.
import { mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CONTENT_KEYS, builtInContent } from '../src/lib/content/registry.ts'
import { diff, fillFrom, isObj, overlay, sameContent, stripIds, type Json } from '../src/lib/content/merge.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, '../medusa/apps/backend/src/scripts/content-seed')

const plain = (v: unknown) => JSON.parse(JSON.stringify(v)) as Json
const id = (seed: string) => createHash('sha1').update(seed).digest('hex').slice(0, 10)

/**
 * Give every object in every list an `_id` derived from its position, in the
 * Greek tree and — at the same positions — in the English one, so the two
 * trees name the same items alike. Where the English list has a different
 * length its ids differ, which makes the overlay replace that list whole.
 */
function assignIds(el: Json, en: Json | undefined, at: string): [Json, Json | undefined] {
  if (Array.isArray(el)) {
    const sameLength = Array.isArray(en) && en.length === el.length
    const elOut = el.map((item, i) => {
      const [e] = assignIds(item, sameLength ? (en as Json[])[i] : undefined, `${at}[${i}]`)
      return isObj(e) ? { ...e, _id: id(`${at}[${i}]`) } : e
    })
    let enOut: Json | undefined = en
    if (Array.isArray(en)) {
      enOut = en.map((item, i) => {
        const [, e] = sameLength
          ? assignIds(el[i], item, `${at}[${i}]`)
          : assignIds(item, item, `${at}[${i}]#en`)
        return isObj(e) ? { ...e, _id: id(sameLength ? `${at}[${i}]` : `${at}[${i}]#en`) } : e
      })
    }
    return [elOut, enOut]
  }
  if (isObj(el)) {
    const elOut: Record<string, Json> = {}
    const enOut: Record<string, Json> | undefined = isObj(en) ? { ...en } : undefined
    for (const [k, v] of Object.entries(el)) {
      const [e, n] = assignIds(v, isObj(en) ? en[k] : undefined, `${at}.${k}`)
      elOut[k] = e
      if (enOut && n !== undefined) enOut[k] = n
    }
    // English-only keys (e.g. a separate English PDF) still need ids inside.
    if (enOut && isObj(en)) {
      for (const k of Object.keys(en)) {
        if (!(k in el)) enOut[k] = assignIds(en[k], en[k], `${at}.${k}#en`)[1] as Json
      }
    }
    return [elOut, enOut]
  }
  return [el, en]
}

mkdirSync(outDir, { recursive: true })
for (const key of CONTENT_KEYS) {
  const elBuiltIn = plain(builtInContent(key, 'el'))
  const enBuiltIn = plain(builtInContent(key, 'en'))
  const [data, enIds] = assignIds(elBuiltIn, enBuiltIn, key)
  const en = diff(data, enIds) ?? {}

  // Read it back exactly as src/lib/content/load.ts does.
  const elBack = stripIds(fillFrom(elBuiltIn, data))
  const enBack = stripIds(fillFrom(enBuiltIn, overlay(data, en)))
  if (!sameContent(elBack, elBuiltIn)) throw new Error(`${key}: Greek does not round-trip`)
  if (!sameContent(enBack, enBuiltIn)) throw new Error(`${key}: English does not round-trip`)
  // …and without the built-in fallback, so the stored copy stands on its own.
  if (!sameContent(stripIds(data), elBuiltIn)) throw new Error(`${key}: stored Greek is incomplete`)
  if (!sameContent(stripIds(overlay(data, en)), enBuiltIn)) throw new Error(`${key}: stored English is incomplete`)

  const file = path.join(outDir, `${key}.json`)
  writeFileSync(file, JSON.stringify({ key, data, translations: { en } }, null, 2) + '\n')
  const kb = (n: number) => `${(n / 1024).toFixed(1)} kB`
  console.log(
    `${key.padEnd(16)} el ${kb(JSON.stringify(data).length).padStart(8)}   en overlay ${kb(JSON.stringify(en).length).padStart(8)}`,
  )
}
