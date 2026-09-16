'use client'

import { useEffect, useRef } from 'react'
import { trackViewItem, type ShopItem } from '@/lib/analytics'

/**
 * Reports a page view of something bookable (an activity, a workshop) to Google
 * Analytics as GA4's `view_item`. Shop products fire it from their own client
 * component; this one lets a server-rendered page do the same. Renders nothing.
 */
export function TrackViewItem({ item }: { item: ShopItem }) {
  const sent = useRef<string | null>(null)
  useEffect(() => {
    if (sent.current === item.item_id) return
    sent.current = item.item_id
    trackViewItem(item)
  }, [item])
  return null
}
