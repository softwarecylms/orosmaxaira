/**
 * Foot of the Payload dashboard (`admin.components.afterDashboard`): the
 * training video for the site's editors. Set TRAINING_VIDEO_URL to a YouTube or
 * Vimeo link, or a direct .mp4; until then the section shows a placeholder.
 */

const TRAINING_VIDEO_URL = ''

function embedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export default function TrainingVideo() {
  const url = TRAINING_VIDEO_URL.trim()
  const embed = url ? embedUrl(url) : null
  return (
    <section className="training-video">
      <h2 className="collections__label">
        <span className="dashboard-icon" aria-hidden="true">
          🎬
        </span>
        Training video
      </h2>
      <div className="training-video__frame">
        {embed ? (
          <iframe
            src={embed}
            title="Training video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : url ? (
          <video src={url} controls preload="metadata" />
        ) : (
          <div className="training-video__placeholder">
            <span aria-hidden="true">▶</span>
            <p>A video showing how to manage the website will be added here soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}
