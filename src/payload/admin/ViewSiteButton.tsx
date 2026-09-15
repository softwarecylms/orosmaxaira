/**
 * «View site» in the admin header (Payload `admin.components.actions`), left of
 * the language switcher: opens the public website in a new tab.
 */
export default function ViewSiteButton() {
  return (
    <a href="/" target="_blank" rel="noopener noreferrer" className="view-site-button">
      View site
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4.5 2.5h5v5M9.5 2.5 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
