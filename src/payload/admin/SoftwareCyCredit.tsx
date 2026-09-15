/**
 * SoftwareCy credit at the foot of the admin sidebar (Payload
 * `admin.components.afterNavLinks`, which renders directly above the logout
 * button).
 */
export default function SoftwareCyCredit() {
  return (
    <div className="softwarecy-credit">
      <a href="https://softwarecy.com" target="_blank" rel="noopener noreferrer" className="softwarecy-credit__logo">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin chrome, outside next/image's config */}
        <img src="/admin/softwarecy-logo.webp" alt="SoftwareCy" width={1032} height={200} />
      </a>
      <p>
        This website was designed &amp; is hosted by{' '}
        <a href="https://softwarecy.com" target="_blank" rel="noopener noreferrer">
          SoftwareCy
        </a>
        .
      </p>
      <p>
        Happy with your website? We&rsquo;d love it if you recommended us to your friends &amp;
        colleagues &mdash; <a href="mailto:info@softwarecy.com">info@softwarecy.com</a>
      </p>
    </div>
  )
}
