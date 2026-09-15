/**
 * Foot of the Payload dashboard (`admin.components.afterDashboard`): the
 * training video for the site's editors. TRAINING_VIDEO_URL takes an Awesome
 * Screenshot, YouTube or Vimeo share link, or a direct .mp4; empty shows a placeholder.
 */

const TRAINING_VIDEO_URL = 'https://www.awesomescreenshot.com/video/56535300?key=b2a8f3861f67838569611ee3195e51ad'

function embedUrl(url: string): string | null {
  // Awesome Screenshot's share page refuses framing; its /embed endpoint doesn't.
  const awesome = url.match(/awesomescreenshot\.com\/video\/(\d+)\?key=([\w]+)/)
  if (awesome) return `https://www.awesomescreenshot.com/embed?id=${awesome[1]}&shareKey=${awesome[2]}`
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
