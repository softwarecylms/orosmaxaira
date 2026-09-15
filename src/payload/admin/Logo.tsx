/**
 * Login-page logo (Payload `admin.components.graphics.Logo`): the SoftwareCy
 * wordmark on a white card, so it reads on both the light and dark admin
 * themes.
 */
export default function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Payload renders this outside next/image's config
    <img src="/admin/softwarecy-logo.webp" alt="SoftwareCy" width={1032} height={200} className="softwarecy-login-logo" />
  )
}
