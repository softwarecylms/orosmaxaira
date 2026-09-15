import { model } from "@medusajs/framework/utils"

/**
 * Content module data models — the site's editable copy (pages, header/footer,
 * blog), edited from the Medusa admin and read by the storefront.
 *
 * Notes:
 * - A page is ONE `content_entry` row whose `data` is the page's whole Greek
 *   content tree, in exactly the shape the storefront's static
 *   `*-content.ts` objects have. `translations.en` holds only the leaves that
 *   differ in English; the storefront overlays it.
 * - Every publish also writes a `content_revision` snapshot, so an edit can be
 *   rolled back from the admin.
 * - Dates are **text** (`YYYY-MM-DD`), as in the bookings module, to avoid the
 *   UTC off-by-one `dateTime` introduces (Europe/Nicosia).
 * - This file lives in `models/` (not `models/index.ts`) because Medusa's module
 *   loader scans the `models` directory and skips any `index.*` file.
 */

export const ContentEntry = model.define("content_entry", {
  id: model.id({ prefix: "cnt" }).primaryKey(),
  // "site", "home", "about", "legal.terms", …
  key: model.text().unique(),
  data: model.json().nullable(),
  translations: model.json().nullable(), // { en: { …changed leaves } }
  // An unpublished edit, previewable in the admin before it goes live.
  draft_data: model.json().nullable(),
  draft_translations: model.json().nullable(),
  updated_by: model.text().nullable(), // admin user id
})

export const ContentRevision = model.define("content_revision", {
  id: model.id({ prefix: "crev" }).primaryKey(),
  entry_key: model.text().index(),
  data: model.json().nullable(),
  translations: model.json().nullable(),
  created_by: model.text().nullable(),
})

export const BlogPost = model.define("blog_post", {
  id: model.id({ prefix: "post" }).primaryKey(),
  slug: model.text().unique(), // served at /<slug>, like the old WordPress site
  status: model.enum(["draft", "published"]).default("draft"),
  published_at: model.text().nullable(), // YYYY-MM-DD
  title: model.text(),
  excerpt: model.text().nullable(),
  cover_image: model.text().nullable(),
  cover_alt: model.text().nullable(),
  body: model.text().nullable(),
  // "html" for the articles imported from WordPress, "markdown" for new ones.
  body_format: model.enum(["html", "markdown"]).default("markdown"),
  read_minutes: model.number().nullable(),
  categories: model.json().nullable(), // category slugs
  seo_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  // A near-duplicate article points its canonical at this slug.
  canonical_slug: model.text().nullable(),
  translations: model.json().nullable(), // { en: { title, excerpt, body, … } }
})

export const BlogCategory = model.define("blog_category", {
  id: model.id({ prefix: "bcat" }).primaryKey(),
  slug: model.text().unique(),
  name: model.text(),
  rank: model.number().default(0),
  translations: model.json().nullable(), // { en: { name } }
})

/** An image uploaded from the admin (the file itself lives in the file module's
 *  storage). Width/height let the storefront size it without a probe. */
export const MediaAsset = model.define("media_asset", {
  id: model.id({ prefix: "media" }).primaryKey(),
  url: model.text(),
  file_key: model.text().nullable(), // the file provider's id, for deletion
  name: model.text(),
  mime_type: model.text().nullable(),
  width: model.number().nullable(),
  height: model.number().nullable(),
  size: model.number().nullable(), // bytes
  alt: model.text().nullable(),
})
