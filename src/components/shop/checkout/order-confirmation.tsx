'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { formatCents } from '@/components/commerce/cart-store'
import type { OrderSnapshot } from './checkout-form'

/** Order confirmation — reads the snapshot stashed at checkout from localStorage. */
export function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderSnapshot | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`oros_order_${id}`)
      if (raw) setOrder(JSON.parse(raw) as OrderSnapshot)
    } catch {
      // ignore
    }
    setReady(true)
  }, [id])

  if (!ready) return <div className="container-wide py-20" aria-hidden="true" />

  return (
    <div className="container-wide flex flex-col items-center gap-8 py-16 text-center md:py-24">
      <span className="flex size-16 items-center justify-center rounded-full bg-cream text-accent">
        <CheckCircle2 className="size-9" strokeWidth={1.6} aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[32px] font-bold text-foreground md:text-[41px]">
          Ευχαριστούμε για την παραγγελία σας!
        </h1>
        <p className="text-[17px] text-muted">
          Αριθμός παραγγελίας: <span className="font-medium text-foreground">{id}</span>
        </p>
      </div>

      {order ? (
        <div className="flex w-full max-w-[560px] flex-col gap-4 rounded-[4px] border border-border bg-white p-6 text-left">
          <div className="flex flex-col divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 py-3">
                <span className="relative size-[52px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite">
                  <Image src={item.image} alt={item.title} fill sizes="52px" className="object-cover" />
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-[14px] font-medium text-foreground">{item.title}</span>
                  <span className="text-[13px] text-muted">
                    {item.size ? `${item.size} · ` : ''}× {item.quantity}
                  </span>
                </div>
                <span className="text-[14px] text-foreground">
                  {formatCents(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4 text-[15px]">
            <div className="flex justify-between text-foreground">
              <span className="text-muted">Υποσύνολο</span>
              <span>{formatCents(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span className="text-muted">Μεταφορικά</span>
              <span>{order.shipping === 0 ? 'Δωρεάν' : formatCents(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-[17px] font-semibold text-foreground">
              <span>Σύνολο</span>
              <span>{formatCents(order.total)}</span>
            </div>
          </div>
          <p className="text-[14px] leading-[20px] text-muted">
            Θα στείλουμε επιβεβαίωση στο {order.contact.email}.
          </p>
        </div>
      ) : (
        <p className="max-w-[480px] text-[15px] text-muted">
          Η παραγγελία σας καταχωρήθηκε. Θα λάβετε σύντομα επιβεβαίωση μέσω email.
        </p>
      )}

      <Link
        href="/shop"
        className="inline-flex items-center rounded-[4px] bg-accent px-5 py-3 text-[17px] text-white transition-colors hover:bg-foreground"
      >
        Συνεχίστε τις αγορές
      </Link>
    </div>
  )
}
