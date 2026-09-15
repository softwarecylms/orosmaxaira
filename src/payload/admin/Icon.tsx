/**
 * Admin navigation icon (Payload `admin.components.graphics.Icon`, shown top
 * left beside the breadcrumbs): the SoftwareCy dot in place of Payload's mark.
 */
export default function Icon() {
  return (
    <svg viewBox="0 0 64 64" width="22" height="22" role="img" aria-label="SoftwareCy" className="softwarecy-dot">
      <defs>
        <linearGradient id="softwarecy-dot-gradient" x1="0.08" y1="0.72" x2="0.92" y2="0.28">
          <stop offset="0" stopColor="#e98b2b" />
          <stop offset="0.5" stopColor="#ca21a9" />
          <stop offset="1" stopColor="#7806cf" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#softwarecy-dot-gradient)" />
    </svg>
  )
}
