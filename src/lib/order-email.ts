import 'server-only'
import type { HttpTypes } from '@medusajs/types'
import { orderNotificationRecipients, sendMail } from './email'
import { EMAIL_COPY, euro, renderOrderEmailHtml, variantLabel, type EmailCopy } from './order-email-html'

/**
 * Order confirmation — one mail to the customer, one to the shop.
 *
 * Built from the Medusa order returned by `cart.complete()`, never from the
 * client's cart snapshot: the email must state what was actually charged. With
 * Stripe live, an email that disagreed with the card statement would be worse
 * than no email at all.
 *
 * Each message is branded HTML (src/lib/order-email-html.ts) with a plain-text
 * alternative, for clients that don't render HTML and for spam filters.
 *
 * Nothing here throws. It runs after the order exists, so a mail server problem
 * must never turn a paid order into a failed one.
 */

type Order = HttpTypes.StoreOrder

const TEXT = {
  el: {
    subject: (ref: string) => `Επιβεβαίωση παραγγελίας ${ref} — Όρος Μαχαιρά`,
    opsSubject: (ref: string) => `Νέα παραγγελία ${ref}`,
    items: 'Προϊόντα',
    orderNo: 'Αριθμός παραγγελίας',
    customer: 'Πελάτης',
    phone: 'Τηλέφωνο',
    deliverTo: 'Παράδοση',
  },
  en: {
    subject: (ref: string) => `Order confirmation ${ref} — Oros Machaira`,
    opsSubject: (ref: string) => `New order ${ref}`,
    items: 'Items',
    orderNo: 'Order number',
    customer: 'Customer',
    phone: 'Phone',
    deliverTo: 'Delivery',
  },
}

const lines = (order: Order, t: EmailCopy, x: (typeof TEXT)['el']) => {
  const items = (order.items ?? []).map((i) => {
    const size = variantLabel(i)
    return `  ${i.quantity} × ${i.product_title || i.title}${size ? ` (${size})` : ''} — ${euro(i.subtotal)}`
  })

  const discount = Number(order.discount_total ?? 0)
  const shipping = Number(order.shipping_total ?? 0)

  return [
    `${x.items}:`,
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
  const lang = locale === 'en' ? 'en' : 'el'
  const t = EMAIL_COPY[lang]
  const x = TEXT[lang]
  const ref = order.display_id ? `#${order.display_id}` : order.id
  const name = [order.shipping_address?.first_name, order.shipping_address?.last_name]
    .filter(Boolean)
    .join(' ')
  const where = address(order)

  try {
    await sendMail('order', {
      to: order.email ?? undefined,
      subject: x.subject(ref),
      html: renderOrderEmailHtml(order, t, 'customer'),
      text: [
        t.greeting(name),
        '',
        t.customerIntro,
        '',
        `${x.orderNo}: ${ref}`,
        '',
        ...lines(order, t, x),
        ...(where ? ['', `${x.deliverTo}: ${where}`] : []),
        '',
        t.outro,
        '',
        t.signoff,
        t.team,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[order] customer confirmation failed', { order: order.id, err })
  }

  // The shop reads its notice in Greek, whatever language the customer used.
  const ops = EMAIL_COPY.el
  const opsText = TEXT.el
  try {
    await sendMail('order', {
      // ORDER_NOTIFICATION_EMAILS, else the enquiry recipients (CONTACT_TO_EMAIL).
      to: orderNotificationRecipients(),
      replyTo: order.email ?? undefined,
      subject: opsText.opsSubject(ref),
      html: renderOrderEmailHtml(order, ops, 'shop'),
      text: [
        `${opsText.orderNo}: ${ref}`,
        `${opsText.customer}: ${name || '—'} (${order.email ?? '—'})`,
        ...(order.shipping_address?.phone ? [`${opsText.phone}: ${order.shipping_address.phone}`] : []),
        ...(where ? [`${opsText.deliverTo}: ${where}`] : []),
        '',
        ...lines(order, ops, opsText),
      ].join('\n'),
    })
  } catch (err) {
    console.error('[order] shop notification failed', { order: order.id, err })
  }
}
