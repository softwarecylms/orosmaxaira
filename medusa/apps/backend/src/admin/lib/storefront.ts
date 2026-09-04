import { useEffect, useState } from "react"
import { sdk } from "./sdk"

/**
 * The storefront's origin and image library, as served by `GET /admin/media`.
 *
 * Both the image picker and the "view page" button need to know where the
 * public site lives, and neither should hardcode it — the origin comes from
 * `STOREFRONT_URL` on the backend. Fetched once per page load and shared.
 */

export type MediaItem = { path: string; name: string; folder: string; bytes: number }

export type Library = {
  origin: string
  folders: string[]
  items: MediaItem[]
  error?: string
}

let libraryPromise: Promise<Library> | null = null

export function loadLibrary(): Promise<Library> {
  libraryPromise ??= sdk.client
    .fetch<Library>("/admin/media", { method: "GET" })
    .catch((e) => ({
      origin: "",
      folders: [],
      items: [],
      error: (e as Error)?.message ?? "Η βιβλιοθήκη δεν φορτώθηκε",
    }))
  return libraryPromise
}

export function useLibrary(): Library | null {
  const [lib, setLib] = useState<Library | null>(null)
  useEffect(() => {
    let alive = true
    loadLibrary().then((l) => alive && setLib(l))
    return () => {
      alive = false
    }
  }, [])
  return lib
}

/** Public URL of the storefront, or "" until the library has loaded. */
export function useStorefrontOrigin(): string {
  return useLibrary()?.origin ?? ""
}

/** Public path for a piece of content, matching the storefront's routes. */
export function publicPath(kind: "activity" | "workshop" | "school", slug?: string | null): string {
  if (kind === "school") return "/drastiriotites/scholeia/"
  if (!slug) return ""
  return kind === "workshop"
    ? `/drastiriotites/ergastiria/${slug}/`
    : `/drastiriotites/${slug}/`
}
