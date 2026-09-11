/**
 * Every country's international calling code, for the checkout's phone field.
 *
 * The codes are libphonenumber-js 1.13.12's (getCountries / getCountryCallingCode
 * — Google's libphonenumber metadata, 245 regions). The English and Greek names
 * are CLDR's, taken from Intl.DisplayNames on Node 24 (ICU 78.3). They are written
 * out here rather than asked of the browser because ICU versions name some
 * countries differently ("Turkey" / "Türkiye"), and a server-rendered list that
 * differs from the browser's breaks hydration.
 */

/** [ISO 3166-1 alpha-2, calling code without the "+", English name, Greek name] */
type Row = readonly [iso: string, dial: string, en: string, el: string]

const ROWS: readonly Row[] = [
  ['AC', '247', 'Ascension Island', 'Νήσος Ασενσιόν'],
  ['AD', '376', 'Andorra', 'Ανδόρα'],
  ['AE', '971', 'United Arab Emirates', 'Ηνωμένα Αραβικά Εμιράτα'],
  ['AF', '93', 'Afghanistan', 'Αφγανιστάν'],
  ['AG', '1', 'Antigua & Barbuda', 'Αντίγκουα και Μπαρμπούντα'],
  ['AI', '1', 'Anguilla', 'Ανγκουίλα'],
  ['AL', '355', 'Albania', 'Αλβανία'],
  ['AM', '374', 'Armenia', 'Αρμενία'],
  ['AO', '244', 'Angola', 'Αγκόλα'],
  ['AR', '54', 'Argentina', 'Αργεντινή'],
  ['AS', '1', 'American Samoa', 'Αμερικανική Σαμόα'],
  ['AT', '43', 'Austria', 'Αυστρία'],
  ['AU', '61', 'Australia', 'Αυστραλία'],
  ['AW', '297', 'Aruba', 'Αρούμπα'],
  ['AX', '358', 'Åland Islands', 'Νήσοι Όλαντ'],
  ['AZ', '994', 'Azerbaijan', 'Αζερμπαϊτζάν'],
  ['BA', '387', 'Bosnia & Herzegovina', 'Βοσνία - Ερζεγοβίνη'],
  ['BB', '1', 'Barbados', 'Μπαρμπέιντος'],
  ['BD', '880', 'Bangladesh', 'Μπανγκλαντές'],
  ['BE', '32', 'Belgium', 'Βέλγιο'],
  ['BF', '226', 'Burkina Faso', 'Μπουρκίνα Φάσο'],
  ['BG', '359', 'Bulgaria', 'Βουλγαρία'],
  ['BH', '973', 'Bahrain', 'Μπαχρέιν'],
  ['BI', '257', 'Burundi', 'Μπουρούντι'],
  ['BJ', '229', 'Benin', 'Μπενίν'],
  ['BL', '590', 'St. Barthélemy', 'Άγιος Βαρθολομαίος'],
  ['BM', '1', 'Bermuda', 'Βερμούδες'],
  ['BN', '673', 'Brunei', 'Μπρουνέι'],
  ['BO', '591', 'Bolivia', 'Βολιβία'],
  ['BQ', '599', 'Caribbean Netherlands', 'Ολλανδία Καραϊβικής'],
  ['BR', '55', 'Brazil', 'Βραζιλία'],
  ['BS', '1', 'Bahamas', 'Μπαχάμες'],
  ['BT', '975', 'Bhutan', 'Μπουτάν'],
  ['BW', '267', 'Botswana', 'Μποτσουάνα'],
  ['BY', '375', 'Belarus', 'Λευκορωσία'],
  ['BZ', '501', 'Belize', 'Μπελίζ'],
  ['CA', '1', 'Canada', 'Καναδάς'],
  ['CC', '61', 'Cocos (Keeling) Islands', 'Νήσοι Κόκος (Κίλινγκ)'],
  ['CD', '243', 'Congo - Kinshasa', 'Κονγκό - Κινσάσα'],
  ['CF', '236', 'Central African Republic', 'Κεντροαφρικανική Δημοκρατία'],
  ['CG', '242', 'Congo - Brazzaville', 'Κονγκό - Μπραζαβίλ'],
  ['CH', '41', 'Switzerland', 'Ελβετία'],
  ['CI', '225', 'Côte d’Ivoire', 'Ακτή Ελεφαντοστού'],
  ['CK', '682', 'Cook Islands', 'Νήσοι Κουκ'],
  ['CL', '56', 'Chile', 'Χιλή'],
  ['CM', '237', 'Cameroon', 'Καμερούν'],
  ['CN', '86', 'China', 'Κίνα'],
  ['CO', '57', 'Colombia', 'Κολομβία'],
  ['CR', '506', 'Costa Rica', 'Κόστα Ρίκα'],
  ['CU', '53', 'Cuba', 'Κούβα'],
  ['CV', '238', 'Cape Verde', 'Πράσινο Ακρωτήριο'],
  ['CW', '599', 'Curaçao', 'Κουρασάο'],
  ['CX', '61', 'Christmas Island', 'Νήσος των Χριστουγέννων'],
  ['CY', '357', 'Cyprus', 'Κύπρος'],
  ['CZ', '420', 'Czechia', 'Τσεχία'],
  ['DE', '49', 'Germany', 'Γερμανία'],
  ['DJ', '253', 'Djibouti', 'Τζιμπουτί'],
  ['DK', '45', 'Denmark', 'Δανία'],
  ['DM', '1', 'Dominica', 'Ντομίνικα'],
  ['DO', '1', 'Dominican Republic', 'Δομινικανή Δημοκρατία'],
  ['DZ', '213', 'Algeria', 'Αλγερία'],
  ['EC', '593', 'Ecuador', 'Ισημερινός'],
  ['EE', '372', 'Estonia', 'Εσθονία'],
  ['EG', '20', 'Egypt', 'Αίγυπτος'],
  ['EH', '212', 'Western Sahara', 'Δυτική Σαχάρα'],
  ['ER', '291', 'Eritrea', 'Ερυθραία'],
  ['ES', '34', 'Spain', 'Ισπανία'],
  ['ET', '251', 'Ethiopia', 'Αιθιοπία'],
  ['FI', '358', 'Finland', 'Φινλανδία'],
  ['FJ', '679', 'Fiji', 'Φίτζι'],
  ['FK', '500', 'Falkland Islands', 'Νήσοι Φόκλαντ'],
  ['FM', '691', 'Micronesia', 'Μικρονησία'],
  ['FO', '298', 'Faroe Islands', 'Νήσοι Φερόες'],
  ['FR', '33', 'France', 'Γαλλία'],
  ['GA', '241', 'Gabon', 'Γκαμπόν'],
  ['GB', '44', 'United Kingdom', 'Ηνωμένο Βασίλειο'],
  ['GD', '1', 'Grenada', 'Γρενάδα'],
  ['GE', '995', 'Georgia', 'Γεωργία'],
  ['GF', '594', 'French Guiana', 'Γαλλική Γουιάνα'],
  ['GG', '44', 'Guernsey', 'Γκέρνζι'],
  ['GH', '233', 'Ghana', 'Γκάνα'],
  ['GI', '350', 'Gibraltar', 'Γιβραλτάρ'],
  ['GL', '299', 'Greenland', 'Γροιλανδία'],
  ['GM', '220', 'Gambia', 'Γκάμπια'],
  ['GN', '224', 'Guinea', 'Γουινέα'],
  ['GP', '590', 'Guadeloupe', 'Γουαδελούπη'],
  ['GQ', '240', 'Equatorial Guinea', 'Ισημερινή Γουινέα'],
  ['GR', '30', 'Greece', 'Ελλάδα'],
  ['GT', '502', 'Guatemala', 'Γουατεμάλα'],
  ['GU', '1', 'Guam', 'Γκουάμ'],
  ['GW', '245', 'Guinea-Bissau', 'Γουινέα Μπισάου'],
  ['GY', '592', 'Guyana', 'Γουιάνα'],
  ['HK', '852', 'Hong Kong SAR China', 'Χονγκ Κονγκ ΕΔΠ Κίνας'],
  ['HN', '504', 'Honduras', 'Ονδούρα'],
  ['HR', '385', 'Croatia', 'Κροατία'],
  ['HT', '509', 'Haiti', 'Αϊτή'],
  ['HU', '36', 'Hungary', 'Ουγγαρία'],
  ['ID', '62', 'Indonesia', 'Ινδονησία'],
  ['IE', '353', 'Ireland', 'Ιρλανδία'],
  ['IL', '972', 'Israel', 'Ισραήλ'],
  ['IM', '44', 'Isle of Man', 'Νήσος του Μαν'],
  ['IN', '91', 'India', 'Ινδία'],
  ['IO', '246', 'British Indian Ocean Territory', 'Βρετανικά Εδάφη Ινδικού Ωκεανού'],
  ['IQ', '964', 'Iraq', 'Ιράκ'],
  ['IR', '98', 'Iran', 'Ιράν'],
  ['IS', '354', 'Iceland', 'Ισλανδία'],
  ['IT', '39', 'Italy', 'Ιταλία'],
  ['JE', '44', 'Jersey', 'Τζέρζι'],
  ['JM', '1', 'Jamaica', 'Τζαμάικα'],
  ['JO', '962', 'Jordan', 'Ιορδανία'],
  ['JP', '81', 'Japan', 'Ιαπωνία'],
  ['KE', '254', 'Kenya', 'Κένυα'],
  ['KG', '996', 'Kyrgyzstan', 'Κιργιστάν'],
  ['KH', '855', 'Cambodia', 'Καμπότζη'],
  ['KI', '686', 'Kiribati', 'Κιριμπάτι'],
  ['KM', '269', 'Comoros', 'Κομόρες'],
  ['KN', '1', 'St. Kitts & Nevis', 'Σεν Κιτς και Νέβις'],
  ['KP', '850', 'North Korea', 'Βόρεια Κορέα'],
  ['KR', '82', 'South Korea', 'Νότια Κορέα'],
  ['KW', '965', 'Kuwait', 'Κουβέιτ'],
  ['KY', '1', 'Cayman Islands', 'Νήσοι Κέιμαν'],
  ['KZ', '7', 'Kazakhstan', 'Καζακστάν'],
  ['LA', '856', 'Laos', 'Λάος'],
  ['LB', '961', 'Lebanon', 'Λίβανος'],
  ['LC', '1', 'St. Lucia', 'Αγία Λουκία'],
  ['LI', '423', 'Liechtenstein', 'Λιχτενστάιν'],
  ['LK', '94', 'Sri Lanka', 'Σρι Λάνκα'],
  ['LR', '231', 'Liberia', 'Λιβερία'],
  ['LS', '266', 'Lesotho', 'Λεσότο'],
  ['LT', '370', 'Lithuania', 'Λιθουανία'],
  ['LU', '352', 'Luxembourg', 'Λουξεμβούργο'],
  ['LV', '371', 'Latvia', 'Λετονία'],
  ['LY', '218', 'Libya', 'Λιβύη'],
  ['MA', '212', 'Morocco', 'Μαρόκο'],
  ['MC', '377', 'Monaco', 'Μονακό'],
  ['MD', '373', 'Moldova', 'Μολδαβία'],
  ['ME', '382', 'Montenegro', 'Μαυροβούνιο'],
  ['MF', '590', 'St. Martin', 'Άγιος Μαρτίνος (Γαλλικό τμήμα)'],
  ['MG', '261', 'Madagascar', 'Μαδαγασκάρη'],
  ['MH', '692', 'Marshall Islands', 'Νήσοι Μάρσαλ'],
  ['MK', '389', 'North Macedonia', 'Βόρεια Μακεδονία'],
  ['ML', '223', 'Mali', 'Μάλι'],
  ['MM', '95', 'Myanmar (Burma)', 'Μιανμάρ (Βιρμανία)'],
  ['MN', '976', 'Mongolia', 'Μογγολία'],
  ['MO', '853', 'Macao SAR China', 'Μακάο ΕΔΠ Κίνας'],
  ['MP', '1', 'Northern Mariana Islands', 'Νήσοι Βόρειες Μαριάνες'],
  ['MQ', '596', 'Martinique', 'Μαρτινίκα'],
  ['MR', '222', 'Mauritania', 'Μαυριτανία'],
  ['MS', '1', 'Montserrat', 'Μονσεράτ'],
  ['MT', '356', 'Malta', 'Μάλτα'],
  ['MU', '230', 'Mauritius', 'Μαυρίκιος'],
  ['MV', '960', 'Maldives', 'Μαλδίβες'],
  ['MW', '265', 'Malawi', 'Μαλάουι'],
  ['MX', '52', 'Mexico', 'Μεξικό'],
  ['MY', '60', 'Malaysia', 'Μαλαισία'],
  ['MZ', '258', 'Mozambique', 'Μοζαμβίκη'],
  ['NA', '264', 'Namibia', 'Ναμίμπια'],
  ['NC', '687', 'New Caledonia', 'Νέα Καληδονία'],
  ['NE', '227', 'Niger', 'Νίγηρας'],
  ['NF', '672', 'Norfolk Island', 'Νήσος Νόρφολκ'],
  ['NG', '234', 'Nigeria', 'Νιγηρία'],
  ['NI', '505', 'Nicaragua', 'Νικαράγουα'],
  ['NL', '31', 'Netherlands', 'Κάτω Χώρες'],
  ['NO', '47', 'Norway', 'Νορβηγία'],
  ['NP', '977', 'Nepal', 'Νεπάλ'],
  ['NR', '674', 'Nauru', 'Ναουρού'],
  ['NU', '683', 'Niue', 'Νιούε'],
  ['NZ', '64', 'New Zealand', 'Νέα Ζηλανδία'],
  ['OM', '968', 'Oman', 'Ομάν'],
  ['PA', '507', 'Panama', 'Παναμάς'],
  ['PE', '51', 'Peru', 'Περού'],
  ['PF', '689', 'French Polynesia', 'Γαλλική Πολυνησία'],
  ['PG', '675', 'Papua New Guinea', 'Παπούα Νέα Γουινέα'],
  ['PH', '63', 'Philippines', 'Φιλιππίνες'],
  ['PK', '92', 'Pakistan', 'Πακιστάν'],
  ['PL', '48', 'Poland', 'Πολωνία'],
  ['PM', '508', 'St. Pierre & Miquelon', 'Σεν Πιερ και Μικελόν'],
  ['PR', '1', 'Puerto Rico', 'Πουέρτο Ρίκο'],
  ['PS', '970', 'Palestinian Territories', 'Παλαιστινιακά Εδάφη'],
  ['PT', '351', 'Portugal', 'Πορτογαλία'],
  ['PW', '680', 'Palau', 'Παλάου'],
  ['PY', '595', 'Paraguay', 'Παραγουάη'],
  ['QA', '974', 'Qatar', 'Κατάρ'],
  ['RE', '262', 'Réunion', 'Ρεϊνιόν'],
  ['RO', '40', 'Romania', 'Ρουμανία'],
  ['RS', '381', 'Serbia', 'Σερβία'],
  ['RU', '7', 'Russia', 'Ρωσία'],
  ['RW', '250', 'Rwanda', 'Ρουάντα'],
  ['SA', '966', 'Saudi Arabia', 'Σαουδική Αραβία'],
  ['SB', '677', 'Solomon Islands', 'Νήσοι Σολομώντος'],
  ['SC', '248', 'Seychelles', 'Σεϋχέλλες'],
  ['SD', '249', 'Sudan', 'Σουδάν'],
  ['SE', '46', 'Sweden', 'Σουηδία'],
  ['SG', '65', 'Singapore', 'Σιγκαπούρη'],
  ['SH', '290', 'St. Helena', 'Αγία Ελένη'],
  ['SI', '386', 'Slovenia', 'Σλοβενία'],
  ['SJ', '47', 'Svalbard & Jan Mayen', 'Σβάλμπαρντ και Γιαν Μαγιέν'],
  ['SK', '421', 'Slovakia', 'Σλοβακία'],
  ['SL', '232', 'Sierra Leone', 'Σιέρα Λεόνε'],
  ['SM', '378', 'San Marino', 'Άγιος Μαρίνος'],
  ['SN', '221', 'Senegal', 'Σενεγάλη'],
  ['SO', '252', 'Somalia', 'Σομαλία'],
  ['SR', '597', 'Suriname', 'Σουρινάμ'],
  ['SS', '211', 'South Sudan', 'Νότιο Σουδάν'],
  ['ST', '239', 'São Tomé & Príncipe', 'Σάο Τομέ και Πρίνσιπε'],
  ['SV', '503', 'El Salvador', 'Ελ Σαλβαδόρ'],
  ['SX', '1', 'Sint Maarten', 'Άγιος Μαρτίνος (Ολλανδικό τμήμα)'],
  ['SY', '963', 'Syria', 'Συρία'],
  ['SZ', '268', 'Eswatini', 'Εσουατίνι'],
  ['TA', '290', 'Tristan da Cunha', 'Τριστάν ντα Κούνια'],
  ['TC', '1', 'Turks & Caicos Islands', 'Νήσοι Τερκς και Κάικος'],
  ['TD', '235', 'Chad', 'Τσαντ'],
  ['TG', '228', 'Togo', 'Τόγκο'],
  ['TH', '66', 'Thailand', 'Ταϊλάνδη'],
  ['TJ', '992', 'Tajikistan', 'Τατζικιστάν'],
  ['TK', '690', 'Tokelau', 'Τοκελάου'],
  ['TL', '670', 'Timor-Leste', 'Τιμόρ-Λέστε'],
  ['TM', '993', 'Turkmenistan', 'Τουρκμενιστάν'],
  ['TN', '216', 'Tunisia', 'Τυνησία'],
  ['TO', '676', 'Tonga', 'Τόνγκα'],
  ['TR', '90', 'Türkiye', 'Τουρκία'],
  ['TT', '1', 'Trinidad & Tobago', 'Τρινιντάντ και Τομπάγκο'],
  ['TV', '688', 'Tuvalu', 'Τουβαλού'],
  ['TW', '886', 'Taiwan', 'Ταϊβάν'],
  ['TZ', '255', 'Tanzania', 'Τανζανία'],
  ['UA', '380', 'Ukraine', 'Ουκρανία'],
  ['UG', '256', 'Uganda', 'Ουγκάντα'],
  ['US', '1', 'United States', 'Ηνωμένες Πολιτείες'],
  ['UY', '598', 'Uruguay', 'Ουρουγουάη'],
  ['UZ', '998', 'Uzbekistan', 'Ουζμπεκιστάν'],
  ['VA', '39', 'Vatican City', 'Βατικανό'],
  ['VC', '1', 'St. Vincent & Grenadines', 'Άγιος Βικέντιος και Γρεναδίνες'],
  ['VE', '58', 'Venezuela', 'Βενεζουέλα'],
  ['VG', '1', 'British Virgin Islands', 'Βρετανικές Παρθένες Νήσοι'],
  ['VI', '1', 'U.S. Virgin Islands', 'Αμερικανικές Παρθένες Νήσοι'],
  ['VN', '84', 'Vietnam', 'Βιετνάμ'],
  ['VU', '678', 'Vanuatu', 'Βανουάτου'],
  ['WF', '681', 'Wallis & Futuna', 'Γουάλις και Φουτούνα'],
  ['WS', '685', 'Samoa', 'Σαμόα'],
  ['XK', '383', 'Kosovo', 'Κοσσυφοπέδιο'],
  ['YE', '967', 'Yemen', 'Υεμένη'],
  ['YT', '262', 'Mayotte', 'Μαγιότ'],
  ['ZA', '27', 'South Africa', 'Νότια Αφρική'],
  ['ZM', '260', 'Zambia', 'Ζάμπια'],
  ['ZW', '263', 'Zimbabwe', 'Ζιμπάμπουε'],
]

export type DialCountry = { iso: string; dial: string; name: string }

/** Pre-selected: the farm and most of its customers are in Cyprus. */
export const DEFAULT_DIAL_COUNTRY = 'CY'

/** Listed above the full list — the two countries the shop delivers to. */
const SUGGESTED: readonly string[] = ['CY', 'GR']

const DIAL = new Map(ROWS.map(([iso, dial]) => [iso, dial]))

/**
 * Accents and case dropped, then compared code point by code point. For these
 * names that orders both languages exactly as their collators do, without
 * depending on the browser's ICU — so the server and the browser always render
 * the same list.
 */
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const groups = new Map<string, { suggested: DialCountry[]; others: DialCountry[] }>()

/** The suggested countries, then every other one — named in the page's language
 *  and sorted by that name. */
export function dialCountryGroups(locale: string) {
  const lang = locale === 'en' ? 'en' : 'el'
  let group = groups.get(lang)
  if (!group) {
    const all = ROWS.map(([iso, dial, en, el]) => ({ iso, dial, name: lang === 'en' ? en : el }))
      .map((country) => ({ country, key: fold(country.name) }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
      .map(({ country }) => country)
    group = {
      suggested: SUGGESTED.map((iso) => all.find((c) => c.iso === iso)!),
      others: all.filter((c) => !SUGGESTED.includes(c.iso)),
    }
    groups.set(lang, group)
  }
  return group
}

export const dialCodeOf = (iso: string) => DIAL.get(iso) ?? DIAL.get(DEFAULT_DIAL_COUNTRY)!

/** The country's flag emoji, built from its two regional-indicator letters. */
export const flagOf = (iso: string) =>
  String.fromCodePoint(...[...iso.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))

/**
 * The phone as the order records it — "+357 99123456". A number the customer
 * already wrote in international form (+… or 00…) is kept as written, so a
 * pasted "+30 69…" does not become "+357 +30 69…".
 */
export function internationalPhone(iso: string, number: string): string {
  const n = number.trim()
  if (!n) return ''
  if (n.startsWith('+')) return n
  if (n.startsWith('00')) return `+${n.slice(2).trimStart()}`
  return `+${dialCodeOf(iso)} ${n}`
}
