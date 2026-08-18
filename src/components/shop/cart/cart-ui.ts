/**
 * Bilingual UI chrome for the cart page (`cart-view.tsx`). el = Greek source of
 * truth, en = English. Product data (titles, prices) is localized separately —
 * these are labels only. Read the active locale with `useLocale()` (client).
 */

export type CartViewUi = {
  cartTitle: string
  empty: string
  continueShopping: string
  decreaseQty: string
  increaseQty: string
  quantity: string
  remove: string
  orderSummary: string
  subtotal: string
  shipping: string
  calculatedAtCheckout: string
  /** free-shipping nudge; the bold {amount} renders between `pre` and `post`. */
  freeShippingRemaining: { pre: string; post: string }
  freeShippingEarned: string
  freeShippingProgress: string
  total: string
  checkout: string
}

const EL: CartViewUi = {
  cartTitle: 'Καλάθι',
  empty: 'Το καλάθι σας είναι άδειο.',
  continueShopping: 'Συνεχίστε τις αγορές',
  decreaseQty: 'Μείωση ποσότητας',
  increaseQty: 'Αύξηση ποσότητας',
  quantity: 'Ποσότητα',
  remove: 'Αφαίρεση',
  orderSummary: 'Σύνοψη παραγγελίας',
  subtotal: 'Υποσύνολο',
  shipping: 'Μεταφορικά',
  calculatedAtCheckout: 'Υπολογίζονται στο ταμείο',
  freeShippingRemaining: {
    pre: 'Προσθέστε ',
    post: ' ακόμη για δωρεάν μεταφορικά στην Κύπρο.',
  },
  freeShippingEarned: 'Κερδίσατε δωρεάν μεταφορικά!',
  freeShippingProgress: 'Πρόοδος για δωρεάν μεταφορικά',
  total: 'Σύνολο',
  checkout: 'Ταμείο',
}

const EN: CartViewUi = {
  cartTitle: 'Cart',
  empty: 'Your cart is empty.',
  continueShopping: 'Continue shopping',
  decreaseQty: 'Decrease quantity',
  increaseQty: 'Increase quantity',
  quantity: 'Quantity',
  remove: 'Remove',
  orderSummary: 'Order summary',
  subtotal: 'Subtotal',
  shipping: 'Shipping',
  calculatedAtCheckout: 'Calculated at checkout',
  freeShippingRemaining: {
    pre: 'Add ',
    post: ' more for free shipping to Cyprus.',
  },
  freeShippingEarned: 'You’ve earned free shipping!',
  freeShippingProgress: 'Progress toward free shipping',
  total: 'Total',
  checkout: 'Checkout',
}

export function getCartViewUi(locale: string): CartViewUi {
  return locale === 'en' ? EN : EL
}
