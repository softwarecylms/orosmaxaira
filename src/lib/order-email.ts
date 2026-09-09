import 'server-only'
import type { HttpTypes } from '@medusajs/types'
import { sendMail } from './email'

/**
 * Order confirmation — one mail to the customer, one to the shop.
 *
 * Built from the Medusa order returned by `cart.complete()`, never from the
 * client's cart snapshot: the email must state what was actually charged. With
 * Stripe live, an email that disagreed with the card statement would be worse
 * than no email at all.
 *
 * Plain text, matching every other mail the site sends (the enquiry routes and
 * the Medusa booking confirmations) — there is no HTML mail anywhere in this
 * codebase, and a confirmation is not the place to introduce one.
 *
 * Nothing here throws. It runs after the order exists, so a mail server problem
 * must never turn a paid order into a failed one.
 */

/** Medusa totals are decimal euros; format them the way the storefront does. */
const euro = (n: number | string | null | undefined) =>
  `€${Number(n ?? 0).toFixed(2).replace('.', ',')}`

type Order = HttpTypes.StoreOrder

const COPY = {
  el: {
    subject: (ref: string) => `Επιβεβαίωση παραγγελίας ${ref} — Όρος Μαχαιρά`,
    opsSubject: (ref: string) => `Νέα παραγγελία ${ref}`,
    greeting: (name: string) => `Γεια σας ${name},`.trim(),
    intro: 'ευχαριστούμε για την παραγγελία σας! Παρακάτω θα βρείτε τα στοιχεία της.',
    items: 'Προϊόντα',
    subtotal: 'Υποσύνολο',
    discount: 'Έκπτωση',
    shipping: 'Μεταφορικά',
    freeShipping: 'Δωρεάν',
    total: 'Σύνολο',
    deliverTo: 'Παράδοση',
    outro:
      'Θα επικοινωνήσουμε μαζί σας μόλις η παραγγελία σας ετοιμαστεί για αποστολή.\n\nΜε εκτίμηση,\nΌρος Μαχαιρά',
    orderNo: 'Αριθμός παραγγελίας',
    customer: 'Πελάτης',
  },
  en: {
    subject: (ref: string) => `Order confirmation ${ref} — Oros Machaira`,
    opsSubject: (ref: string) => `New order ${ref}`,
    greeting: (name: string) => `Hello ${name},`.trim(),
    intro: 'thank you for your order! Here are the details.',
    items: 'Items',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    freeShipping: 'Free',
    total: 'Total',
    deliverTo: 'Delivery',
    outro:
      'We will be in touch as soon as your order is ready to ship.\n\nKind regards,\nOros Machaira',
    orderNo: 'Order number',
    customer: 'Customer',
  },
}

const lines = (order: Order, t: (typeof COPY)['el']) => {
  const items = (order.items ?? []).map((i) => {
    const size = i.variant_title && i.variant_title !== i.title ? ` (${i.variant_title})` : ''
    return `  ${i.quantity} × ${i.title}${size} — ${euro(i.subtotal)}`
  })

  const discount = Number(order.discount_total ?? 0)
  const shipping = Number(order.shipping_total ?? 0)

  return [
    `${t.items}:`,
    ...items,
    '',
    `${t.subtotal}: ${euro(order.item_subtotal ?? order.subtotal)}`,
    ...(discount > 0 ? [`${t.discount}: −${euro(discount)}`] : []),
    `${t.shipping}: ${shipping > 0 ? euro(shipping) : t.freeShipping}`,
    `${t.total}: ${euro(order.total)}`,
  ]
}

const address = (order: Order) => {
  const a = order.shipping_address
  if (!a) return null
  return [a.address_1, a.address_2, `${a.postal_code ?? ''} ${a.city ?? ''}`.trim(), a.country_code?.toUpperCase()]
    .filter(Boolean)
    .join(', ')
}

/**
 * Fire both messages. Awaited by the caller only so failures are logged in
 * order; it resolves even when SMTP is unconfigured or the server rejects.
 */
export async function sendOrderEmails(order: Order, locale: string): Promise<void> {
  const t = locale === 'en' ? COPY.en : COPY.el
  const ref = order.display_id ? `#${order.display_id}` : order.id
  const name = [order.shipping_address?.first_name, order.shipping_address?.last_name]
    .filter(Boolean)
    .join(' ')
  const where = address(order)
  const body = lines(order, t)

  try {
    await sendMail('order', {
      to: order.email ?? undefined,
      subject: t.subject(ref),
      text: [
        t.greeting(name),
        '',
        t.intro,
        '',
        `${t.orderNo}: ${ref}`,
        '',
        ...body,
        ...(where ? ['', `${t.deliverTo}: ${where}`] : []),
        '',
        t.outro,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[order] customer confirmation failed', { order: order.id, err })
  }

  try {
    await sendMail('order', {
      // `to` omitted → the shop address (CONTACT_TO_EMAIL) from getMailer().
      replyTo: order.email ?? undefined,
      subject: t.opsSubject(ref),
      text: [
        `${t.orderNo}: ${ref}`,
        `${t.customer}: ${name || '—'} (${order.email ?? '—'})`,
        ...(order.shipping_address?.phone ? [`Τηλέφωνο: ${order.shipping_address.phone}`] : []),
        ...(where ? [`${t.deliverTo}: ${where}`] : []),
        '',
        ...body,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[order] shop notification failed', { order: order.id, err })
  }
}
