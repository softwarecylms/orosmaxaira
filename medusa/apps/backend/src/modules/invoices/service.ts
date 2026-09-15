import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaError,
  MedusaService,
  generateEntityId,
} from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import { DEFAULT_CONFIG, FIRST_INVOICE_NUMBER, formatCode, withDefaults, type InvoiceConfig } from "../../lib/invoice/config"
import { Invoice, InvoiceSettings } from "./models/definitions"

const SETTINGS_KEY = "default"

type Sql = { execute: (sql: string, params?: unknown[]) => Promise<unknown> }
const rowsOf = (res: unknown) => (Array.isArray(res) ? res : ((res as { rows?: unknown[] })?.rows ?? [])) as any[]

export type SettingsView = {
  next_number: number
  config: InvoiceConfig
  logo: string | null
  /** The highest number already issued, or null — next_number must stay above it. */
  last_number: number | null
}

/**
 * Invoices module service. On top of the generated CRUD:
 *  - `getSettings` / `saveSettings` — the single settings row, created with the
 *    defaults (numbering from 1584) the first time it is read.
 *  - `issueInvoice` — takes the next number and stores the invoice in ONE
 *    transaction: the counter row is locked by its UPDATE, so two orders can
 *    never share a number, and a failed insert (the order already has an
 *    invoice) rolls the counter back instead of leaving a gap.
 */
class InvoicesModuleService extends MedusaService({ Invoice, InvoiceSettings }) {
  @InjectManager()
  async getSettings(@MedusaContext() sharedContext?: Context): Promise<SettingsView> {
    const sql = sharedContext!.manager as unknown as Sql
    await sql.execute(
      `INSERT INTO invoice_settings (id, key, next_number, config, created_at, updated_at)
       VALUES (?, ?, ?, ?::jsonb, now(), now())
       ON CONFLICT DO NOTHING`,
      [generateEntityId(undefined, "invset"), SETTINGS_KEY, FIRST_INVOICE_NUMBER, JSON.stringify(DEFAULT_CONFIG)]
    )
    const [row] = rowsOf(
      await sql.execute(`SELECT next_number, config, logo FROM invoice_settings WHERE key = ? AND deleted_at IS NULL`, [
        SETTINGS_KEY,
      ])
    )
    const [max] = rowsOf(await sql.execute(`SELECT MAX(number) AS max FROM invoice WHERE deleted_at IS NULL`))
    return {
      next_number: Number(row.next_number),
      config: withDefaults(row.config),
      logo: row.logo ?? null,
      last_number: max?.max == null ? null : Number(max.max),
    }
  }

  @InjectManager()
  async saveSettings(
    input: { config?: InvoiceConfig; logo?: string | null; next_number?: number },
    @MedusaContext() sharedContext?: Context
  ): Promise<SettingsView> {
    const current = await this.getSettings(sharedContext)
    if (input.next_number != null) {
      if (!Number.isInteger(input.next_number) || input.next_number < 1) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Ο επόμενος αριθμός πρέπει να είναι θετικός ακέραιος.")
      }
      if (current.last_number != null && input.next_number <= current.last_number) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Ο επόμενος αριθμός πρέπει να είναι μεγαλύτερος από τον τελευταίο που εκδόθηκε (${current.last_number}).`
        )
      }
    }
    const sql = sharedContext!.manager as unknown as Sql
    await sql.execute(
      `UPDATE invoice_settings
          SET config = ?::jsonb, logo = ?, next_number = ?, updated_at = now()
        WHERE key = ?`,
      [
        JSON.stringify(withDefaults(input.config ?? current.config)),
        input.logo === undefined ? current.logo : input.logo,
        input.next_number ?? current.next_number,
        SETTINGS_KEY,
      ]
    )
    return this.getSettings(sharedContext)
  }

  @InjectTransactionManager()
  async issueInvoice(
    input: { order_id: string; order_display_id: number | null; issued_at: Date; data: Record<string, unknown> },
    @MedusaContext() sharedContext?: Context
  ): Promise<{ id: string; number: number; code: string }> {
    await this.getSettings(sharedContext)
    const sql = sharedContext!.transactionManager as unknown as Sql
    const [counter] = rowsOf(
      await sql.execute(
        `UPDATE invoice_settings SET next_number = next_number + 1, updated_at = now()
          WHERE key = ? RETURNING next_number - 1 AS number, config`,
        [SETTINGS_KEY]
      )
    )
    const number = Number(counter.number)
    const code = formatCode(number, withDefaults(counter.config))
    const id = generateEntityId(undefined, "inv")
    await sql.execute(
      `INSERT INTO invoice (id, order_id, order_display_id, number, code, issued_at, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, now(), now())`,
      [id, input.order_id, input.order_display_id, number, code, input.issued_at, JSON.stringify({ ...input.data, code })]
    )
    return { id, number, code }
  }
}

export default InvoicesModuleService
