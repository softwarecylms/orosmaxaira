'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sdk } from './client'
import { getAuthToken, setAuthToken, removeAuthToken } from './customer'

export type FormState = { error?: string; ok?: boolean }

function messageOf(e: unknown): string {
  const m = (e as { message?: string })?.message ?? String(e)
  return m
}

/** POST helper that always carries the current customer's bearer token. */
async function authedFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, unknown> } = {},
): Promise<T> {
  const token = await getAuthToken()
  return sdk.client.fetch<T>(path, {
    ...init,
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
}

// --- Auth --------------------------------------------------------------------

export async function loginCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Συμπληρώστε email και κωδικό.' }
  try {
    const { token } = await sdk.client.fetch<{ token: string }>('/auth/customer/emailpass', {
      method: 'POST',
      body: { email, password },
    })
    if (!token) return { error: 'Λάθος email ή κωδικός.' }
    await setAuthToken(token)
  } catch {
    return { error: 'Λάθος email ή κωδικός.' }
  }
  redirect('/account')
}

export async function registerCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name = String(formData.get('last_name') ?? '').trim()
  if (!email || !password || !first_name) {
    return { error: 'Συμπληρώστε όνομα, email και κωδικό.' }
  }
  if (password.length < 8) {
    return { error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.' }
  }
  try {
    // 1) register the auth identity → registration token
    const { token } = await sdk.client.fetch<{ token: string }>(
      '/auth/customer/emailpass/register',
      { method: 'POST', body: { email, password } },
    )
    // 2) create the customer profile with that token
    await sdk.client.fetch('/store/customers', {
      method: 'POST',
      body: { email, first_name, last_name },
      headers: { authorization: `Bearer ${token}` },
    })
    // 3) log in for a clean session token, then persist it
    const { token: authToken } = await sdk.client.fetch<{ token: string }>(
      '/auth/customer/emailpass',
      { method: 'POST', body: { email, password } },
    )
    await setAuthToken(authToken || token)
  } catch (e) {
    const m = messageOf(e).toLowerCase()
    if (m.includes('already') || m.includes('exists') || m.includes('unauthorized')) {
      return { error: 'Αυτό το email χρησιμοποιείται ήδη. Δοκιμάστε σύνδεση.' }
    }
    return { error: 'Δεν ήταν δυνατή η δημιουργία λογαριασμού. Δοκιμάστε ξανά.' }
  }
  redirect('/account')
}

export async function logoutCustomer(): Promise<void> {
  await removeAuthToken()
  redirect('/')
}

// --- Profile -----------------------------------------------------------------

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name = String(formData.get('last_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  try {
    await authedFetch('/store/customers/me', {
      method: 'POST',
      body: { first_name, last_name, phone: phone || null },
    })
  } catch {
    return { error: 'Δεν ήταν δυνατή η αποθήκευση.' }
  }
  revalidatePath('/account')
  revalidatePath('/account/profile')
  return { ok: true }
}

// --- Addresses ---------------------------------------------------------------

function addressBody(formData: FormData) {
  return {
    first_name: String(formData.get('first_name') ?? '').trim(),
    last_name: String(formData.get('last_name') ?? '').trim(),
    address_1: String(formData.get('address_1') ?? '').trim(),
    address_2: String(formData.get('address_2') ?? '').trim() || undefined,
    city: String(formData.get('city') ?? '').trim(),
    postal_code: String(formData.get('postal_code') ?? '').trim(),
    country_code: String(formData.get('country_code') ?? 'cy').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim() || undefined,
  }
}

export async function addAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await authedFetch('/store/customers/me/addresses', { method: 'POST', body: addressBody(formData) })
  } catch {
    return { error: 'Δεν ήταν δυνατή η προσθήκη διεύθυνσης.' }
  }
  revalidatePath('/account/addresses')
  revalidatePath('/account')
  return { ok: true }
}

export async function updateAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('address_id') ?? '')
  if (!id) return { error: 'Άγνωστη διεύθυνση.' }
  try {
    await authedFetch(`/store/customers/me/addresses/${id}`, { method: 'POST', body: addressBody(formData) })
  } catch {
    return { error: 'Δεν ήταν δυνατή η ενημέρωση.' }
  }
  revalidatePath('/account/addresses')
  return { ok: true }
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const id = String(formData.get('address_id') ?? '')
  if (id) {
    try {
      await authedFetch(`/store/customers/me/addresses/${id}`, { method: 'DELETE' })
    } catch {
      /* ignore */
    }
  }
  revalidatePath('/account/addresses')
  revalidatePath('/account')
}
