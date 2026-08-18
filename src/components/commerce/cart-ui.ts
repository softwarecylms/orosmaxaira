/**
 * Bilingual UI chrome for the commerce cart components (drawer, header badge,
 * add-to-cart). el = Greek source of truth, en = English. Product data (titles,
 * prices) is localized separately in the data layer — these are labels only.
 *
 * Read the active locale with next-intl's `useLocale()` (client) at the call
 * site, then `getCartChrome(locale)`.
 */

export type CartChrome = {
  closeCart: string
  shoppingCart: string
  yourCart: string
  close: string
  empty: string
  continueShopping: string
  decreaseQty: string
  increaseQty: string
  quantity: string
  /** aria-label for the per-item remove button, e.g. "Remove {title}". */
  remove: (title: string) => string
  /** free-shipping nudge; the bold {amount} renders between `pre` and `post`. */
  freeShippingRemaining: { pre: string; post: string }
  freeShippingEarned: string
  freeShippingProgress: string
  subtotal: string
  shippingAtCheckout: string
  checkout: string
  viewCart: string
  // add-to-cart
  cartLabel: string
  adding: string
  added: string
  selectOptions: string
  addToCart: string
  viewCartArrow: string
  addError: string
}

const EL: CartChrome = {
  closeCart: 'Κλείσιμο καλαθιού',
  shoppingCart: 'Καλάθι αγορών',
  yourCart: 'Το καλάθι σας',
  close: 'Κλείσιμο',
  empty: 'Το καλάθι σας είναι άδειο.',
  continueShopping: 'Συνεχίστε τις αγορές',
  decreaseQty: 'Μείωση ποσότητας',
  increaseQty: 'Αύξηση ποσότητας',
  quantity: 'Ποσότητα',
  remove: (title) => `Αφαίρεση ${title}`,
  freeShippingRemaining: {
    pre: 'Προσθέστε ',
    post: ' ακόμη για δωρεάν μεταφορικά στην Κύπρο.',
  },
  freeShippingEarned: 'Κερδίσατε δωρεάν μεταφορικά!',
  freeShippingProgress: 'Πρόοδος για δωρεάν μεταφορικά',
  subtotal: 'Υποσύνολο',
  shippingAtCheckout: 'Τα μεταφορικά υπολογίζονται στο ταμείο.',
  checkout: 'Ταμείο',
  viewCart: 'Προβολή καλαθιού',
  cartLabel: 'Καλάθι',
  adding: 'Προσθήκη…',
  added: 'Προστέθηκε στο καλάθι',
  selectOptions: 'Επιλέξτε επιλογές',
  addToCart: 'Προσθήκη στο καλάθι',
  viewCartArrow: 'Προβολή καλαθιού →',
  addError: 'Δεν ήταν δυνατή η προσθήκη στο καλάθι.',
}

const EN: CartChrome = {
  closeCart: 'Close cart',
  shoppingCart: 'Shopping cart',
  yourCart: 'Your cart',
  close: 'Close',
  empty: 'Your cart is empty.',
  continueShopping: 'Continue shopping',
  decreaseQty: 'Decrease quantity',
  increaseQty: 'Increase quantity',
  quantity: 'Quantity',
  remove: (title) => `Remove ${title}`,
  freeShippingRemaining: {
    pre: 'Add ',
    post: ' more for free shipping to Cyprus.',
  },
  freeShippingEarned: 'You’ve earned free shipping!',
  freeShippingProgress: 'Progress toward free shipping',
  subtotal: 'Subtotal',
  shippingAtCheckout: 'Shipping is calculated at checkout.',
  checkout: 'Checkout',
  viewCart: 'View cart',
  cartLabel: 'Cart',
  adding: 'Adding…',
  added: 'Added to cart',
  selectOptions: 'Select options',
  addToCart: 'Add to cart',
  viewCartArrow: 'View cart →',
  addError: 'Could not add to cart.',
}

export function getCartChrome(locale: string): CartChrome {
  return locale === 'en' ? EN : EL
}
