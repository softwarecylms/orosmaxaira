'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Minus, Plus, Tag, Truck, X } from 'lucide-react'
import { useCart, formatCents, type CartItem } from '@/components/commerce/cart-store'
import { placeMedusaOrder } from '@/lib/medusa/place-order'
import { REFRIGERATED_HANDLES } from '@/components/shop/shop-content'
import { cn } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 7000 // €70,00 — free HOME delivery above this (Cyprus)
const HOME_SHIPPING = 500 // €5,00 home delivery (Cyprus, below threshold)
const ACS_SHIPPING = 250 // €2,50 ACS pickup (Cyprus)
const GREECE_SHIPPING = 700 // €7,00 (Greece — never free)

type Country = 'Κύπρος' | 'Ελλάδα'

// Refrigerated products (REFRIGERATED_HANDLES): home delivery only (no ACS
// pickup) and NOT to Paphos / Famagusta (Cyprus) or Greece.
const CY_DISTRICTS = ['Λευκωσία', 'Λεμεσός', 'Λάρνακα', 'Πάφος', 'Αμμόχωστος'] as const
const REFRIGERATED_BLOCKED_DISTRICTS: string[] = ['Πάφος', 'Αμμόχωστος']

/** Demo discount codes (client-side only — swap for a real promotions engine later). */
const COUPONS: Record<string, { kind: 'pct' | 'fixed'; value: number }> = {
  MELI10: { kind: 'pct', value: 10 }, // 10% έκπτωση στο υποσύνολο
  WELCOME5: { kind: 'fixed', value: 500 }, // €5,00 έκπτωση
}

/**
 * ACS pickup points per country, divided by town (shown when ACS delivery is
 * chosen). Cyprus is the full official network (cyp.acscourier.net). Greece's
 * ~840-point network is API-served and cannot be hardcoded reliably — only the
 * verified HQ is listed; wire the ACS Points Locator API for full coverage.
 */
const ACS_STORES: Record<Country, { town: string; points: string[] }[]> = {
  Κύπρος: [
    {
      town: 'Λευκωσία',
      points: [
        'Ευαγόρου 30, 1097 Λευκωσία',
        'Λεωφ. Κων. Παλαιολόγου 6Α, 1011 Λευκωσία (Πλατεία Ελευθερίας)',
        'Α. Μιχαλακοπούλου 22, 1075 Λευκωσία',
        'Λεωφ. Αθαλάσσας 70, 2012 Στρόβολος',
        'Βάρκιζας 14, 2033 Στρόβολος',
        '28ης Οκτωβρίου 34Β, 2414 Έγκωμη',
        'Λεωφ. Μακαρίου 40Η, 2324 Λακατάμια',
        'Λεωφ. Κέννεντυ 68Α, 1046 Παλλουριώτισσα',
        'Λεωφ. Αρχ. Μακαρίου 33, 2220 Λατσιά',
        'Μακαρίου 27Γ, 2572 Πέρα Χωριό Νήσου',
        'Λεωφ. Αρχ. Μακαρίου Γ΄ 351, 2313 Πάνω Λακατάμια',
        'Γρ. Αυξεντίου & Αυλώνας 2, 2660 Κοκκινοτριμιθιά',
        'Μεγάλου Αλεξάνδρου 2, 2643 Εργάτες',
        'Γρίβα Διγενή 70Α, 2722 Αστρομερίτης',
        'Μακαρίου 47, 2800 Κακοπετριά',
      ],
    },
    {
      town: 'Λεμεσός',
      points: [
        'Στ. Κυριακίδη 41, 3080 Λεμεσός',
        'Ρήγα Φεραίου 3, 3095 Λεμεσός',
        'Βασιλέως Παύλου 35Α, 3052 Λεμεσός',
        '16ης Ιουνίου 1943 αρ. 18, 3022 Λεμεσός',
        'Λεωφ. Σπ. Κυπριανού 17, 4043 Γερμασόγεια',
        'Ηλία Καννάουρου 38, 4180 Ύψωνας',
        'Αρχ. Μακαρίου 31, 4620 Επισκοπή',
        'Στ. Χατζηπετρή 17, Αγρός',
        'Μαξιμιανού 6, 4607 Πισσούρι',
      ],
    },
    {
      town: 'Λάρνακα',
      points: [
        'Αρχ. Κυπριανού 18, 6016 Λάρνακα',
        'Λεωφ. Αρτέμιδος 24, 6030 Λάρνακα',
        'Λεωφ. Μακαρίου Γ΄ 127, 7102 Αραδίππου',
        'Αρχ. Μακαρίου 56, 7550 Κίτι',
        'Ελευθερίας 16, 7520 Ξυλοφάγου',
        'Μετοχίου 21, 7530 Ορμίδια',
        'Ελ. Βενιζέλου 38, 7600 Αθηαίνου',
        'Αγίας Παρασκευής 41, 7741 Χοιροκοιτία',
        'Αρχ. Μακαρίου 102Α, 7640 Κόρνος',
      ],
    },
    {
      town: 'Πάφος',
      points: [
        'Λεωφ. Μεσόγης 53, 8280 Πάφος',
        'Ν. Νικολαΐδη & Κινύρα 4, 8010 Πάφος',
        'Λεωφ. Χλώρακας, 8220 Χλώρακα',
        'Βασιλέως Στασίοικου 11, 8820 Πόλη Χρυσοχούς',
      ],
    },
    {
      town: 'Αμμόχωστος',
      points: [
        'Σταδίου 84, 5280 Παραλίμνι',
        '1ης Απριλίου 5, 5320 Λιοπέτρι',
        'Ελευθερίας 4, 5380 Δερύνεια',
        'Διονυσίου Σολωμού 1, 5330 Αγία Νάπα',
      ],
    },
  ],
  Ελλάδα: [
    {
      town: 'Αθήνα',
      points: ['Κεντρικά Γραφεία ACS — Π. Ράλλη 36-38, 12241 Αιγάλεω'],
    },
  ],
}

type Delivery = 'acs' | 'home'
type Payment = 'card' | 'cod' | 'bank'

export type Contact = {
  // Billing details
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  address2: string
  city: string
  postal: string
  country: Country
  company: string
  vat: string
  // Ship to a different address
  shipDifferent: boolean
  shipFirstName: string
  shipLastName: string
  shipAddress: string
  shipAddress2: string
  shipCity: string
  shipPostal: string
  // Order
  notes: string
  delivery: Delivery
  acsPoint: string
  /** Cyprus district — used for home delivery + the refrigerated-area restriction */
  district: string
  payment: Payment
}

export type OrderSnapshot = {
  id: string
  date: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  coupon: string | null
  total: number
  contact: Contact
}

const EMPTY: Contact = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  address2: '',
  city: '',
  postal: '',
  country: 'Κύπρος',
  company: '',
  vat: '',
  shipDifferent: false,
  shipFirstName: '',
  shipLastName: '',
  shipAddress: '',
  shipAddress2: '',
  shipCity: '',
  shipPostal: '',
  notes: '',
  delivery: 'acs',
  acsPoint: '',
  district: '',
  payment: 'card',
}

/** Checkout: billing address + notes on the left; order summary with delivery,
 *  payment, totals and submit on the right. Mirrors the reference checkout's
 *  field set (in Greek). No real payment — places a local order snapshot. */
export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, ready, clear, setQty, removeItem } = useCart()
  const [c, setC] = useState<Contact>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')

  if (!ready) return <div className="container-wide py-20" aria-hidden="true" />

  if (items.length === 0) {
    return (
      <div className="container-wide flex flex-col items-start gap-5 py-16 md:py-24">
        <p className="text-[17px] text-muted">Το καλάθι σας είναι άδειο.</p>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-[4px] bg-accent px-5 py-3 text-[17px] text-white transition-colors hover:bg-foreground"
        >
          Συνεχίστε τις αγορές
        </Link>
      </div>
    )
  }

  // Refrigerated products (royal jelly / bee pollen) can only ship to a Cyprus
  // home address — never ACS pickup, never Paphos/Famagusta, never Greece.
  const refrigeratedItems = items.filter((i) => REFRIGERATED_HANDLES.includes(i.handle))
  const hasRefrigerated = refrigeratedItems.length > 0
  const refrigeratedNames = [...new Set(refrigeratedItems.map((i) => i.title))]
  const inGreece = c.country === 'Ελλάδα'
  // Refrigerated orders force home delivery.
  const delivery: Delivery = hasRefrigerated ? 'home' : c.delivery
  const refrigeratedBlocked =
    hasRefrigerated && (inGreece || REFRIGERATED_BLOCKED_DISTRICTS.includes(c.district))

  // Free shipping applies to Cyprus HOME delivery over the threshold.
  const homeDelivery = !inGreece && delivery === 'home'
  const homeFree = homeDelivery && subtotal >= FREE_SHIPPING_THRESHOLD

  const shipping = inGreece
    ? GREECE_SHIPPING
    : delivery === 'acs'
      ? ACS_SHIPPING
      : homeFree
        ? 0
        : HOME_SHIPPING

  // Exact Medusa shipping-option name to book for this choice.
  const shippingOptionName = inGreece
    ? 'Παράδοση Ελλάδα'
    : delivery === 'acs'
      ? 'ACS Κύπρος'
      : homeFree
        ? 'Δωρεάν μεταφορικά'
        : 'Παράδοση στο σπίτι'

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
  const appliedCoupon = coupon ? COUPONS[coupon] : null
  const discount = appliedCoupon
    ? Math.min(
        subtotal,
        appliedCoupon.kind === 'pct' ? Math.round((subtotal * appliedCoupon.value) / 100) : appliedCoupon.value,
      )
    : 0
  const total = subtotal + shipping - discount

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    if (COUPONS[code]) {
      setCoupon(code)
      setCouponError('')
    } else {
      setCoupon(null)
      setCouponError('Μη έγκυρος κωδικός κουπονιού.')
    }
  }
  function removeCoupon() {
    setCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }))
  const toggle = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.checked }))
  // Country drives the ACS store list, so clear a stale pickup point on change.
  const onCountry = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setC((prev) => ({ ...prev, country: e.target.value as Country, acsPoint: '', district: '' }))

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    setOrderError('')

    // Every line must carry a Medusa variant id to become a real order line.
    if (items.some((i) => !i.variantId)) {
      setOrderError(
        'Κάποια προϊόντα στο καλάθι σας χρειάζονται ανανέωση — αφαιρέστε τα και προσθέστε τα ξανά.',
      )
      return
    }

    // Refrigerated products can't reach Paphos/Famagusta or Greece.
    if (refrigeratedBlocked) {
      setOrderError(
        `Τα προϊόντα ψυγείου (Βασιλικός πολτός, Γύρη) δεν αποστέλλονται ${
          inGreece ? 'στην Ελλάδα' : `στην επαρχία ${c.district}`
        }. Αφαιρέστε τα ή επιλέξτε άλλη περιοχή παράδοσης.`,
      )
      return
    }

    setSubmitting(true)
    const countryCode = c.country === 'Κύπρος' ? ('cy' as const) : ('gr' as const)
    const shippingAddr = {
      first_name: c.shipDifferent ? c.shipFirstName : c.firstName,
      last_name: c.shipDifferent ? c.shipLastName : c.lastName,
      address_1: c.shipDifferent ? c.shipAddress : c.address,
      address_2: c.shipDifferent ? c.shipAddress2 : c.address2,
      city: c.shipDifferent ? c.shipCity : c.city,
      postal_code: c.shipDifferent ? c.shipPostal : c.postal,
      country_code: countryCode,
      phone: c.phone,
      company: c.company,
    }
    const billingAddr = {
      first_name: c.firstName,
      last_name: c.lastName,
      address_1: c.address,
      address_2: c.address2,
      city: c.city,
      postal_code: c.postal,
      country_code: countryCode,
      phone: c.phone,
      company: c.company,
    }

    const res = await placeMedusaOrder({
      items: items.map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
      email: c.email,
      shipping: shippingAddr,
      billing: billingAddr,
      shippingOptionName,
      coupon,
      metadata: {
        customer_name: `${c.firstName} ${c.lastName}`,
        phone: c.phone,
        delivery,
        acs_point: c.acsPoint,
        district: c.district,
        payment_method: c.payment,
        vat: c.vat,
        company: c.company,
        notes: c.notes,
      },
    })

    if ('error' in res) {
      setSubmitting(false)
      setOrderError(res.error)
      return
    }

    const id = res.orderId
    const snapshot: OrderSnapshot = { id, date: new Date().toISOString(), items, subtotal, shipping, discount, coupon, total, contact: c }
    try {
      localStorage.setItem(`oros_order_${id}`, JSON.stringify(snapshot))
    } catch {
      // ignore storage errors — confirmation page falls back gracefully
    }
    clear()
    router.push(`/order/${id}`)
  }

  return (
    <form onSubmit={placeOrder} className="container-wide grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_400px]">
      {/* Billing details */}
      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="mb-2 text-[20px] font-semibold text-foreground">Στοιχεία χρέωσης</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Όνομα" value={c.firstName} onChange={set('firstName')} required autoComplete="given-name" />
          <Field label="Επώνυμο" value={c.lastName} onChange={set('lastName')} required autoComplete="family-name" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Τηλέφωνο" type="tel" value={c.phone} onChange={set('phone')} required autoComplete="tel" />
          <Field label="Διεύθυνση Email" type="email" value={c.email} onChange={set('email')} required autoComplete="email" />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] text-muted">
            Χώρα / Περιοχή<Req />
          </span>
          <select
            value={c.country}
            onChange={onCountry}
            required
            className="w-full min-w-0 rounded-[4px] border border-border bg-white px-4 py-3 text-[16px] text-foreground outline-none focus:border-accent"
          >
            <option value="Κύπρος">Κύπρος</option>
            <option value="Ελλάδα">Ελλάδα</option>
          </select>
        </label>

        <Field
          label="Διεύθυνση"
          value={c.address}
          onChange={set('address')}
          required
          autoComplete="address-line1"
          placeholder="Αριθμός και όνομα οδού"
        />
        <Field
          label=""
          aria-label="Διαμέρισμα, όροφος, κ.λπ. (προαιρετικό)"
          value={c.address2}
          onChange={set('address2')}
          autoComplete="address-line2"
          placeholder="Διαμέρισμα, όροφος, κ.λπ. (προαιρετικό)"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Πόλη" value={c.city} onChange={set('city')} required autoComplete="address-level2" />
          <Field label="Ταχ. Κώδικας" value={c.postal} onChange={set('postal')} required autoComplete="postal-code" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Επωνυμία εταιρείας (προαιρετικό)" value={c.company} onChange={set('company')} autoComplete="organization" />
          <Field label="Α.Φ.Μ. (προαιρετικό)" value={c.vat} onChange={set('vat')} />
        </div>

        <Checkbox checked={c.shipDifferent} onChange={toggle('shipDifferent')}>
          Αποστολή σε διαφορετική διεύθυνση
        </Checkbox>

        {c.shipDifferent ? (
          <div className="mt-1 flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Όνομα" value={c.shipFirstName} onChange={set('shipFirstName')} required />
              <Field label="Επώνυμο" value={c.shipLastName} onChange={set('shipLastName')} required />
            </div>
            <Field label="Διεύθυνση" value={c.shipAddress} onChange={set('shipAddress')} required placeholder="Αριθμός και όνομα οδού" />
            <Field
              label=""
              aria-label="Διαμέρισμα, όροφος, κ.λπ. (προαιρετικό)"
              value={c.shipAddress2}
              onChange={set('shipAddress2')}
              placeholder="Διαμέρισμα, όροφος, κ.λπ. (προαιρετικό)"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Πόλη" value={c.shipCity} onChange={set('shipCity')} required />
              <Field label="Ταχ. Κώδικας" value={c.shipPostal} onChange={set('shipPostal')} required />
            </div>
          </div>
        ) : null}

        <label className="mt-1 flex flex-col gap-1.5">
          <span className="text-[14px] text-muted">Σημειώσεις παραγγελίας (προαιρετικό)</span>
          <textarea
            value={c.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Σημειώσεις για την παραγγελία σας, π.χ. ειδικές οδηγίες για την παράδοση."
            className="w-full min-w-0 resize-y rounded-[4px] border border-border bg-white px-4 py-3 text-[16px] text-foreground outline-none transition-colors focus:border-accent"
          />
        </label>
      </fieldset>

      {/* Order summary — items, delivery, payment, totals, submit */}
      <aside className="flex h-fit min-w-0 flex-col gap-5 rounded-[4px] border border-border bg-white p-6">
        <h2 className="text-[20px] font-semibold text-foreground">Η παραγγελία σας</h2>

        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div key={item.key} className="flex gap-3 py-3">
              <Link
                href={`/shop/${item.handle}`}
                className="relative size-[52px] shrink-0 overflow-hidden rounded-[4px] bg-offwhite"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="52px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/shop/${item.handle}`}
                  className="text-[14px] font-medium leading-[18px] text-foreground transition-colors hover:text-accent"
                >
                  {item.title}
                </Link>
                {item.size ? <span className="text-[13px] text-muted">{item.size}</span> : null}
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex w-[88px] items-center justify-between rounded-[5px] border border-border px-2">
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.quantity - 1)}
                      aria-label="Μείωση ποσότητας"
                      className="flex size-6 items-center justify-center text-foreground transition-colors hover:text-accent"
                    >
                      <Minus className="size-3.5" strokeWidth={2} />
                    </button>
                    <span className="text-[14px] font-semibold text-foreground">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.quantity + 1)}
                      aria-label="Αύξηση ποσότητας"
                      className="flex size-6 items-center justify-center text-foreground transition-colors hover:text-accent"
                    >
                      <Plus className="size-3.5" strokeWidth={2} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Αφαίρεση ${item.title}`}
                    className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-accent"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Αφαίρεση
                  </button>
                </div>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[14px] text-foreground">
                {formatCents(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery method */}
        <fieldset className="flex flex-col gap-2.5 border-t border-border pt-4">
          <legend className="mb-1 text-[15px] font-semibold text-foreground">Τρόπος παράδοσης</legend>

          {hasRefrigerated ? (
            <p className="rounded-[4px] bg-accent-soft px-3 py-2.5 text-[13px] font-semibold leading-[18px] text-foreground">
              ❄️ Η παραγγελία περιέχει {refrigeratedNames.length === 1 ? 'προϊόν' : 'προϊόντα'}{' '}
              ψυγείου ({refrigeratedNames.join(', ')}) —{' '}
              {refrigeratedNames.length === 1 ? 'παραδίδεται' : 'παραδίδονται'} μόνο κατ’ οίκον και όχι
              σε Πάφο, Αμμόχωστο ή Ελλάδα.
            </p>
          ) : null}

          {inGreece ? (
            <RadioRow
              name="delivery"
              checked
              readOnly
              onChange={() => {}}
              label="Αποστολή με courier"
              price={formatCents(GREECE_SHIPPING)}
            />
          ) : (
            <>
              <RadioRow
                name="delivery"
                checked={delivery === 'acs'}
                disabled={hasRefrigerated}
                onChange={() => setC((p) => ({ ...p, delivery: 'acs' }))}
                label="Παραλαβή από κατάστημα ACS"
                price={formatCents(ACS_SHIPPING)}
              />
              <RadioRow
                name="delivery"
                checked={delivery === 'home'}
                onChange={() => setC((p) => ({ ...p, delivery: 'home' }))}
                label="Παράδοση κατ’ οίκον"
                price={homeFree ? 'Δωρεάν' : formatCents(HOME_SHIPPING)}
              />
            </>
          )}

          {/* ACS pickup point — Cyprus ACS only */}
          {!inGreece && delivery === 'acs' ? (
            <label className="mt-0.5 flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">
                Επιλέξτε σημείο παραλαβής ACS<Req />
              </span>
              <select
                value={c.acsPoint}
                onChange={set('acsPoint')}
                required
                className="w-full min-w-0 rounded-[4px] border border-border bg-white px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-accent"
              >
                <option value="">Επιλέξτε σημείο παραλαβής…</option>
                {ACS_STORES['Κύπρος'].map((group) => (
                  <optgroup key={group.town} label={group.town}>
                    {group.points.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ) : null}

          {/* District — Cyprus home delivery (enforces the refrigerated-area rule) */}
          {!inGreece && delivery === 'home' ? (
            <label className="mt-0.5 flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">
                Επαρχία<Req />
              </span>
              <select
                value={c.district}
                onChange={set('district')}
                required
                className="w-full min-w-0 rounded-[4px] border border-border bg-white px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-accent"
              >
                <option value="">Επιλέξτε επαρχία…</option>
                {CY_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {refrigeratedBlocked ? (
            <p className="text-[13px] leading-[18px] text-red-600">
              Δεν είναι δυνατή η παράδοση προϊόντων ψυγείου{' '}
              {inGreece ? 'στην Ελλάδα' : `στην επαρχία ${c.district}`}.
            </p>
          ) : null}
        </fieldset>

        {/* Payment method */}
        <fieldset className="flex flex-col gap-2.5 border-t border-border pt-4">
          <legend className="mb-1 text-[15px] font-semibold text-foreground">Τρόπος πληρωμής</legend>
          <RadioRow
            name="payment"
            checked={c.payment === 'card'}
            onChange={() => setC((p) => ({ ...p, payment: 'card' }))}
            label="Πιστωτική / Χρεωστική κάρτα"
          />
        </fieldset>

        {/* Coupon */}
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {coupon ? (
            <div className="flex items-center justify-between rounded-[4px] bg-accent-soft px-3 py-2.5">
              <span className="flex items-center gap-2 text-[14px] text-foreground">
                <Tag className="size-4 text-accent" aria-hidden="true" />
                Κουπόνι «{coupon}» ενεργό
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-[13px] text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                Αφαίρεση
              </button>
            </div>
          ) : (
            <>
              <span className="text-[14px] text-muted">Κωδικός κουπονιού</span>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      applyCoupon()
                    }
                  }}
                  aria-label="Κωδικός κουπονιού"
                  className="min-w-0 flex-1 rounded-[4px] border border-border bg-white px-3 py-2.5 text-[15px] text-foreground outline-none transition-colors focus:border-accent"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="shrink-0 rounded-[4px] border border-foreground px-4 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-white"
                >
                  Εφαρμογή
                </button>
              </div>
              {couponError ? <p className="text-[13px] text-red-600">{couponError}</p> : null}
            </>
          )}
        </div>

        {/* Totals */}
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-[15px]">
          <Row label="Υποσύνολο" value={formatCents(subtotal)} />
          {discount > 0 ? <Row label="Έκπτωση" value={`−${formatCents(discount)}`} accent /> : null}
          <Row label="Μεταφορικά" value={shipping === 0 ? 'Δωρεάν' : formatCents(shipping)} />
          {/* Free-shipping progress — Cyprus home delivery only */}
          {!homeDelivery ? null : homeFree ? (
            <p className="flex items-center gap-2 pt-1 text-[13px] font-medium leading-[18px] text-success">
              <Check className="size-[18px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
              Κερδίσατε δωρεάν παράδοση κατ’ οίκον!
            </p>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <p className="flex items-center gap-2 text-[13px] leading-[18px] text-foreground">
                <Truck className="size-[18px] shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
                <span>
                  Προσθέστε <span className="font-semibold">{formatCents(remaining)}</span> ακόμη για δωρεάν
                  παράδοση κατ’ οίκον.
                </span>
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={shippingProgress}
                aria-label="Πρόοδος για δωρεάν μεταφορικά"
                className="h-2 w-full overflow-hidden rounded-full bg-cream"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between border-t border-border pt-4 text-[18px] font-semibold text-foreground">
          <span>Σύνολο</span>
          <span>{formatCents(total)}</span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] leading-[19px] text-muted">
            Τα προσωπικά σας δεδομένα θα χρησιμοποιηθούν για την επεξεργασία της παραγγελίας σας, την
            υποστήριξη της εμπειρίας σας σε αυτόν τον ιστότοπο και για άλλους σκοπούς που περιγράφονται
            στην{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              πολιτική απορρήτου
            </Link>{' '}
            μας.
          </p>
          <Checkbox required name="terms">
            Έχω διαβάσει και αποδέχομαι τους{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              όρους και προϋποθέσεις
            </Link>{' '}
            του ιστότοπου
            <Req />
          </Checkbox>
        </div>

        {orderError ? (
          <p className="rounded-[4px] bg-red-50 px-3 py-2.5 text-[13px] leading-[18px] text-red-700">
            {orderError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || refrigeratedBlocked}
          className="flex w-full items-center justify-center rounded-[4px] bg-accent p-[15px] text-[17px] text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-75"
        >
          {submitting ? 'Επεξεργασία…' : 'Ολοκλήρωση παραγγελίας'}
        </button>
        <p className="text-center text-[13px] leading-[18px] text-muted">
          Δοκιμαστική παραγγελία — δεν πραγματοποιείται χρέωση.
        </p>
      </aside>
    </form>
  )
}

/** Accent-coloured required marker. */
function Req() {
  return (
    <span className="ml-0.5 text-accent" aria-hidden="true">
      *
    </span>
  )
}

function Field({
  label,
  required,
  ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="text-[14px] text-muted">
          {label}
          {required ? <Req /> : null}
        </span>
      ) : null}
      <input
        {...props}
        required={required}
        className="w-full min-w-0 rounded-[4px] border border-border bg-white px-4 py-3 text-[16px] text-foreground outline-none transition-colors focus:border-accent"
      />
    </label>
  )
}

function Checkbox({
  children,
  ...props
}: { children: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 size-[18px] shrink-0 rounded-[3px] [accent-color:var(--color-accent)]"
      />
      <span className="text-[14px] leading-[20px] text-foreground">{children}</span>
    </label>
  )
}

function RadioRow({
  label,
  price,
  checked,
  disabled,
  ...props
}: { label: string; price?: string; checked: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 rounded-[4px] border px-4 py-3 transition-colors',
        disabled
          ? 'cursor-not-allowed border-border opacity-50'
          : cn(
              'cursor-pointer',
              checked ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-strong',
            ),
      )}
    >
      <input type="radio" checked={checked} disabled={disabled} {...props} className="sr-only" />
      <span
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-accent' : 'border-border-strong',
        )}
        aria-hidden="true"
      >
        {checked ? <span className="size-2.5 rounded-full bg-accent" /> : null}
      </span>
      <span className="flex-1 text-[15px] text-foreground">{label}</span>
      {price ? <span className="text-[14px] font-medium text-foreground">{price}</span> : null}
    </label>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-foreground">
      <span className="text-muted">{label}</span>
      <span className={accent ? 'text-accent' : undefined}>{value}</span>
    </div>
  )
}
