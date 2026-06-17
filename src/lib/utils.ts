import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mediaSrc(media: unknown): string | undefined {
  if (!media || typeof media === 'string' || typeof media === 'number') return undefined
  const m = media as { url?: string | null }
  const url = m.url ?? undefined
  if (!url) return undefined
  try {
    const parsed = new URL(url, 'http://localhost')
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // keep absolute URLs as-is
  }
  return url
}

export function mediaAlt(media: unknown, fallback = ''): string {
  if (!media || typeof media === 'string' || typeof media === 'number') return fallback
  const m = media as { alt?: string | null }
  return m.alt ?? fallback
}

export function mediaDims(media: unknown): { width?: number; height?: number } {
  if (!media || typeof media === 'string' || typeof media === 'number') return {}
  const m = media as { width?: number | null; height?: number | null }
  return { width: m.width ?? undefined, height: m.height ?? undefined }
}
