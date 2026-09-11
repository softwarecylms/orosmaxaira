import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { type Transporter } from "nodemailer"

type SmtpOptions = {
  host: string
  port?: number
  secure?: boolean
  user: string
  pass: string
  /** Envelope sender for every message, e.g. "orders@orosmaxaira.com". */
  from: string
}

/**
 * Delivers Medusa notifications on the email channel over SMTP.
 *
 * Booking confirmations (src/lib/booking-payment.ts → announceBooking) go
 * through the Notification module, which until now had only the log-only
 * `notification-local` provider — so neither the customer nor the farm ever
 * received them. This sends them for real, through the same SMTP account the
 * storefront uses (Resend), so both apps share one sender and one set of
 * credentials.
 *
 * The body comes from `content.subject` / `content.text` (or `html`) on the
 * createNotifications call; `template` is kept only as a label for the logs.
 */
class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp"

  protected logger_: Logger
  protected options_: SmtpOptions
  protected transporter_: Transporter

  constructor({ logger }: { logger: Logger }, options: SmtpOptions) {
    super()
    this.logger_ = logger
    this.options_ = options
    const port = options.port ?? 465
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port,
      secure: options.secure ?? port === 465,
      auth: { user: options.user, pass: options.pass },
    })
  }

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["host", "user", "pass", "from"]) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `smtp notification provider: missing option "${key}"`,
        )
      }
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const subject = notification.content?.subject
    const text = notification.content?.text
    const html = notification.content?.html
    if (!notification.to || !subject || !(text || html)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Email "${notification.template}" needs a recipient, a subject and a body`,
      )
    }

    const info = await this.transporter_.sendMail({
      from: this.options_.from,
      to: notification.to,
      subject,
      text: text ?? undefined,
      html: html ?? undefined,
    })
    this.logger_.info(`[smtp] sent "${notification.template}" to ${notification.to} (${info.messageId})`)
    return { id: info.messageId }
  }
}

export default SmtpNotificationService
