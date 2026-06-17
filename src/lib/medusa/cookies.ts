// `next/headers` is inherently server-only — importing it in a client component
// throws at build time, so it already guards these helpers.
import { cookies as nextCookies } from 'next/headers'

const CART_COOKIE = '_medusa_cart_id'

const baseOptions = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

/** Read the current cart id from the cookie (safe during render). */
export async function getCartId(): Promise<string | undefined> {
  const cookies = await nextCookies()
  return cookies.get(CART_COOKIE)?.value
}

/** Persist the cart id. Only valid inside a Server Action or Route Handler. */
export async function setCartId(cartId: string): Promise<void> {
  const cookies = await nextCookies()
  cookies.set(CART_COOKIE, cartId, baseOptions)
}

/** Clear the cart id (e.g. after an order is placed). */
export async function removeCartId(): Promise<void> {
  const cookies = await nextCookies()
  cookies.set(CART_COOKIE, '', { ...baseOptions, maxAge: -1 })
}
