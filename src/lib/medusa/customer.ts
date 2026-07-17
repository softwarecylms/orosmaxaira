import { cookies as nextCookies } from 'next/headers'
import { sdk } from './client'

/**
 * Customer session + data helpers (server-only). The Medusa customer auth JWT
 * lives in an httpOnly cookie; every authenticated Store API call passes it as
 * `Authorization: Bearer …` explicitly via `sdk.client.fetch`, so no token is
 * ever stored on the shared SDK instance (which would leak across requests).
 */

const AUTH_COOKIE = '_medusa_jwt'

const authCookieOptions = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookies = await nextCookies()
  return cookies.get(AUTH_COOKIE)?.value
}

/** Persist the auth token. Only valid inside a Server Action / Route Handler. */
export async function setAuthToken(token: string): Promise<void> {
  const cookies = await nextCookies()
  cookies.set(AUTH_COOKIE, token, authCookieOptions)
}

export async function removeAuthToken(): Promise<void> {
  const cookies = await nextCookies()
  cookies.set(AUTH_COOKIE, '', { ...authCookieOptions, maxAge: -1 })
}

export type Customer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  addresses?: CustomerAddress[]
}

export type CustomerAddress = {
  id: string
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
  company?: string | null
}

export type Order = {
  id: string
  display_id: number
  status: string
  created_at: string
  currency_code: string
  total: number
  items?: { id: string; title: string; quantity: number; thumbnail?: string | null }[]
}

/** The signed-in customer (with addresses), or null when not authenticated. */
export async function getCustomer(): Promise<Customer | null> {
  const token = await getAuthToken()
  if (!token) return null
  try {
    const { customer } = await sdk.client.fetch<{ customer: Customer }>(
      '/store/customers/me',
      {
        query: { fields: '*addresses' },
        headers: { authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )
    return customer ?? null
  } catch {
    return null
  }
}

/** The signed-in customer's orders, newest first (empty when unauthenticated). */
export async function getCustomerOrders(): Promise<Order[]> {
  const token = await getAuthToken()
  if (!token) return []
  try {
    const { orders } = await sdk.client.fetch<{ orders: Order[] }>('/store/orders', {
      query: { limit: 50, order: '-created_at', fields: 'id,display_id,status,created_at,currency_code,total,*items' },
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return orders ?? []
  } catch {
    return []
  }
}
