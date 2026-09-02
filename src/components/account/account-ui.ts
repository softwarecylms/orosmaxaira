/**
 * Bilingual UI chrome for the account area — the shell/nav, the forms, and the
 * account pages (overview, orders, addresses, profile, login, register).
 * el = Greek source of truth, en = English. Customer/order DATA (names, emails,
 * product titles, prices) comes from Medusa and is not localized here.
 *
 * Read the active locale with `useLocale()` (client) / `getLocale()` (server).
 */

/** Locale tags for `toLocaleDateString` / price formatting on account pages. */
export function accountIntlLocale(locale: string): string {
  return locale === 'en' ? 'en-GB' : 'el-GR'
}

export type AccountUi = {
  // shell
  myAccount: string
  welcome: string
  navOverview: string
  navOrders: string
  navAddresses: string
  navProfile: string
  logout: string
  // shared form
  pleaseWait: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  save: string
  cancel: string
  update: string
  close: string
  country: string
  countryCyprus: string
  countryGreece: string
  // login
  loginTitle: string
  loginSubtitle: string
  loginSubmit: string
  noAccount: string
  registerLink: string
  /** Guest-checkout escape hatch on the sign-in screen. */
  guestCheckout: string
  // register
  registerTitle: string
  registerSubtitle: string
  passwordHint: string
  registerSubmit: string
  haveAccount: string
  loginLink: string
  // profile
  profileTitle: string
  profileSubtitle: string
  profileSaved: string
  emailImmutable: string
  // addresses
  addressesTitle: string
  addressesSubtitle: string
  address1: string
  address2: string
  city: string
  postal: string
  noAddresses: string
  noAddressesHint: string
  addAddress: string
  editAddress: string
  newAddress: string
  edit: string
  delete: string
  // orders
  ordersTitle: string
  noOrdersTitle: string
  noOrdersHint: string
  toShop: string
  orderNumber: (id: string | number) => string
  // overview
  overviewMyDetails: string
  overviewEditDetails: string
  overviewOrders: string
  overviewAllOrders: string
  overviewAddresses: string
  overviewManageAddresses: string
  overviewAddAddress: string
  overviewContinueShopping: string
  overviewContinueBlurb: string
  overviewNoOrders: string
  overviewNoAddresses: string
  moreCount: (n: number) => string
  orderStatus: Record<string, string>
}

/** Medusa order status → localized label + badge class. Classes are shared. */
export const ORDER_STATUS_CLASS: Record<string, string> = {
  pending: 'bg-accent/10 text-gold-strong',
  completed: 'bg-green-50 text-green-700',
  archived: 'bg-offwhite text-muted',
  canceled: 'bg-red-50 text-red-700',
  requires_action: 'bg-red-50 text-red-700',
}

const STATUS_EL: Record<string, string> = {
  pending: 'Σε εκκρεμότητα',
  completed: 'Ολοκληρωμένη',
  archived: 'Αρχειοθετημένη',
  canceled: 'Ακυρωμένη',
  requires_action: 'Απαιτεί ενέργεια',
}

const STATUS_EN: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  archived: 'Archived',
  canceled: 'Canceled',
  requires_action: 'Requires action',
}

const EL: AccountUi = {
  myAccount: 'Ο λογαριασμός μου',
  welcome: 'Καλωσορίσατε,',
  navOverview: 'Επισκόπηση',
  navOrders: 'Παραγγελίες',
  navAddresses: 'Διευθύνσεις',
  navProfile: 'Στοιχεία',
  logout: 'Αποσύνδεση',
  pleaseWait: 'Παρακαλώ περιμένετε…',
  firstName: 'Όνομα',
  lastName: 'Επώνυμο',
  email: 'Email',
  password: 'Κωδικός',
  phone: 'Τηλέφωνο',
  save: 'Αποθήκευση',
  cancel: 'Ακύρωση',
  update: 'Ενημέρωση',
  close: 'Κλείσιμο',
  country: 'Χώρα',
  countryCyprus: 'Κύπρος',
  countryGreece: 'Ελλάδα',
  loginTitle: 'Σύνδεση',
  loginSubtitle: 'Καλώς ήρθατε ξανά',
  loginSubmit: 'Σύνδεση',
  noAccount: 'Δεν έχετε λογαριασμό;',
  registerLink: 'Δημιουργήστε έναν',
  guestCheckout: 'Συνεχίστε ως επισκέπτης',
  registerTitle: 'Δημιουργία λογαριασμού',
  registerSubtitle: 'Παρακολουθήστε τις παραγγελίες σας και αποθηκεύστε τις διευθύνσεις σας',
  passwordHint: 'Τουλάχιστον 8 χαρακτήρες',
  registerSubmit: 'Δημιουργία λογαριασμού',
  haveAccount: 'Έχετε ήδη λογαριασμό;',
  loginLink: 'Σύνδεση',
  profileTitle: 'Τα στοιχεία μου',
  profileSubtitle: 'Ενημερώστε το όνομα και το τηλέφωνό σας.',
  profileSaved: 'Τα στοιχεία σας αποθηκεύτηκαν.',
  emailImmutable: 'Το email σύνδεσης δεν μπορεί να αλλάξει.',
  addressesTitle: 'Οι διευθύνσεις μου',
  addressesSubtitle: 'Αποθηκευμένες διευθύνσεις για ταχύτερη ολοκλήρωση παραγγελίας.',
  address1: 'Διεύθυνση',
  address2: 'Διεύθυνση (2η γραμμή)',
  city: 'Πόλη',
  postal: 'Ταχ. κώδικας',
  noAddresses: 'Καμία διεύθυνση',
  noAddressesHint: 'Αποθηκεύστε μια διεύθυνση για ταχύτερη ολοκλήρωση παραγγελίας.',
  addAddress: 'Προσθήκη διεύθυνσης',
  editAddress: 'Επεξεργασία διεύθυνσης',
  newAddress: 'Νέα διεύθυνση',
  edit: 'Επεξεργασία',
  delete: 'Διαγραφή',
  ordersTitle: 'Οι παραγγελίες μου',
  noOrdersTitle: 'Καμία παραγγελία ακόμη',
  noOrdersHint: 'Μόλις κάνετε την πρώτη σας παραγγελία, θα εμφανιστεί εδώ.',
  toShop: 'Στο κατάστημα',
  orderNumber: (id) => `Παραγγελία #${id}`,
  overviewMyDetails: 'Τα στοιχεία μου',
  overviewEditDetails: 'Επεξεργασία στοιχείων',
  overviewOrders: 'Παραγγελίες',
  overviewAllOrders: 'Όλες οι παραγγελίες',
  overviewAddresses: 'Διευθύνσεις',
  overviewManageAddresses: 'Διαχείριση διευθύνσεων',
  overviewAddAddress: 'Προσθήκη διεύθυνσης',
  overviewContinueShopping: 'Συνέχεια αγορών',
  overviewContinueBlurb:
    'Ανακαλύψτε το αγνό μας μέλι, τα προϊόντα της κυψέλης και τα φυσικά καλλυντικά.',
  overviewNoOrders: 'Δεν έχετε ακόμη παραγγελίες.',
  overviewNoAddresses: 'Δεν έχετε αποθηκευμένες διευθύνσεις.',
  moreCount: (n) => `+ ${n} ακόμη`,
  orderStatus: STATUS_EL,
}

const EN: AccountUi = {
  myAccount: 'My account',
  welcome: 'Welcome,',
  navOverview: 'Overview',
  navOrders: 'Orders',
  navAddresses: 'Addresses',
  navProfile: 'Details',
  logout: 'Log out',
  pleaseWait: 'Please wait…',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  password: 'Password',
  phone: 'Phone',
  save: 'Save',
  cancel: 'Cancel',
  update: 'Update',
  close: 'Close',
  country: 'Country',
  countryCyprus: 'Cyprus',
  countryGreece: 'Greece',
  loginTitle: 'Sign in',
  loginSubtitle: 'Welcome back',
  loginSubmit: 'Sign in',
  noAccount: 'Don’t have an account?',
  registerLink: 'Create one',
    guestCheckout: 'Continue as guest',
  registerTitle: 'Create an account',
  registerSubtitle: 'Track your orders and save your addresses',
  passwordHint: 'At least 8 characters',
  registerSubmit: 'Create account',
  haveAccount: 'Already have an account?',
  loginLink: 'Sign in',
  profileTitle: 'My details',
  profileSubtitle: 'Update your name and phone number.',
  profileSaved: 'Your details have been saved.',
  emailImmutable: 'Your sign-in email cannot be changed.',
  addressesTitle: 'My addresses',
  addressesSubtitle: 'Saved addresses for faster checkout.',
  address1: 'Address',
  address2: 'Address (line 2)',
  city: 'City',
  postal: 'Postal code',
  noAddresses: 'No addresses',
  noAddressesHint: 'Save an address for faster checkout.',
  addAddress: 'Add address',
  editAddress: 'Edit address',
  newAddress: 'New address',
  edit: 'Edit',
  delete: 'Delete',
  ordersTitle: 'My orders',
  noOrdersTitle: 'No orders yet',
  noOrdersHint: 'Once you place your first order, it will appear here.',
  toShop: 'To the shop',
  orderNumber: (id) => `Order #${id}`,
  overviewMyDetails: 'My details',
  overviewEditDetails: 'Edit details',
  overviewOrders: 'Orders',
  overviewAllOrders: 'All orders',
  overviewAddresses: 'Addresses',
  overviewManageAddresses: 'Manage addresses',
  overviewAddAddress: 'Add address',
  overviewContinueShopping: 'Continue shopping',
  overviewContinueBlurb: 'Discover our pure honey, bee products and natural cosmetics.',
  overviewNoOrders: 'You have no orders yet.',
  overviewNoAddresses: 'You have no saved addresses.',
  moreCount: (n) => `+ ${n} more`,
  orderStatus: STATUS_EN,
}

export function getAccountUi(locale: string): AccountUi {
  return locale === 'en' ? EN : EL
}
