/**
 * Shortcuts from the Payload sidebar to the Medusa admin, where the shop and
 * the bookable experiences are managed (Payload `admin.components.beforeNavLinks`).
 * Payload holds the site's pages, articles and settings; Medusa holds these.
 */

const MEDUSA_ADMIN = `${(process.env.MEDUSA_BACKEND_URL || 'http://localhost:9009').replace(/\/$/, '')}/app`

const LINKS = [
  { label: 'Products', path: '/products' },
  { label: 'Workshops', path: '/workshops' },
  { label: 'Activities', path: '/activities' },
  { label: 'School visits', path: '/school-program' },
]

export default function MedusaLinks() {
  return (
    <div className="medusa-links">
      <span className="medusa-links__label">Shop &amp; bookings · Medusa</span>
      {LINKS.map((l) => (
        <a
          key={l.path}
          href={`${MEDUSA_ADMIN}${l.path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="medusa-links__link"
        >
          <span>{l.label}</span>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2.5h5v5M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </div>
  )
}
