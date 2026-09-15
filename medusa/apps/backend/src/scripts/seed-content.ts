import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CONTENT_MODULE } from "../modules/content"
import type ContentModuleService from "../modules/content/service"

/**
 * Load the site's page copy into the content module — one entry per file in
 * ./content-seed (header/footer, home, about, contact, adopt, certificates,
 * awards, nature, activities, the four legal pages).
 *
 * Only creates entries that are MISSING — content edited in the admin is never
 * overwritten. Pass FORCE=1 to re-publish the repo snapshot over what is stored
 * (it still becomes a revision, so the overwritten version can be restored).
 * ONLY=<key>[,<key>] limits the run to some entries.
 *
 *   npx tsx scripts/export-content.mts          # from the storefront, regenerates the JSON
 *   npx medusa exec ./src/scripts/seed-content.ts
 *
 * Run against local AND the Railway prod DB (see the deploy notes).
 */

type SeedFile = {
  key: string
  data: Record<string, unknown>
  translations: Record<string, unknown>
}

export default async function seedContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const content = container.resolve<ContentModuleService>(CONTENT_MODULE)
  const force = process.env.FORCE === "1"
  const only = process.env.ONLY?.split(",").map((k) => k.trim()).filter(Boolean)

  const dir = path.join(__dirname, "content-seed")
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort()

  let created = 0
  let replaced = 0
  let kept = 0
  for (const file of files) {
    const seed = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as SeedFile
    if (only && !only.includes(seed.key)) continue

    const [existing] = await content.listContentEntries({ key: seed.key }, { take: 1 })
    if (existing?.data && !force) {
      kept++
      logger.info(`content: ${seed.key} — already has content, kept`)
      continue
    }
    await content.publishEntry(seed.key, { data: seed.data, translations: seed.translations })
    if (existing?.data) replaced++
    else created++
    logger.info(`content: ${seed.key} — ${existing?.data ? "replaced (FORCE)" : "created"}`)
  }
  logger.info(`content seed done: ${created} created, ${replaced} replaced, ${kept} kept`)
}
