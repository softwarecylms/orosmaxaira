import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import type { FileTypes, Logger } from "@medusajs/framework/types"
import { BlobNotFoundError, del, put } from "@vercel/blob"
import { randomUUID } from "crypto"
import path from "path"
import { PassThrough, Readable } from "stream"

type VercelBlobOptions = {
  /** Read-write token of the Blob store (BLOB_READ_WRITE_TOKEN). */
  token: string
  /** Folder inside the store for Medusa's files. Default "medusa/". */
  prefix?: string
}

type InjectedDependencies = {
  logger: Logger
}

/** One year: every pathname is unique, so a stored file never changes. */
const CACHE_MAX_AGE = 60 * 60 * 24 * 365

/** Greek letters to Latin for readable pathnames (after accents are stripped). */
const GREEK: Record<string, string> = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th",
  ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p",
  ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
}

/**
 * Stores Medusa's files (images uploaded from the admin, product import and
 * export CSVs) in Vercel Blob.
 *
 * Why: on Railway the default local provider writes to ./static, and that disk
 * is wiped by every deploy, so admin uploads vanished while products kept
 * pointing at dead URLs. The storefront's Payload CMS already keeps its media
 * in a Vercel Blob store (src/payload.config.ts, vercelBlobStorage). Medusa
 * uses the same store and token, under its own `medusa/` folder, so both apps
 * share one bucket and one bill without their pathnames colliding.
 *
 * medusa-config.ts registers this provider only when BLOB_READ_WRITE_TOKEN is
 * set (Railway). Locally there is no token, so the default local provider
 * stays. The File module accepts exactly one provider.
 *
 * Every file is written with `access: "public"`, because the store is public
 * (Payload serves its media straight from it). Files Medusa marks as private
 * (export CSVs) are therefore reachable only through their unguessable
 * pathname: uploads get Vercel's random suffix, streams a random UUID.
 *
 * The file key is the blob pathname (e.g. `medusa/1726400000000-logo-Ab3dE.png`);
 * the public URL is derived from it and the store id in the token.
 */
class VercelBlobFileService extends AbstractFileProviderService {
  static identifier = "vercel-blob"

  protected readonly logger_: Logger
  protected readonly token_: string
  protected readonly prefix_: string
  protected readonly baseUrl_: string

  static validateOptions(options: Record<any, any>): void {
    if (!options?.token || typeof options.token !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The Vercel Blob file provider needs a `token` option (BLOB_READ_WRITE_TOKEN)."
      )
    }
  }

  constructor({ logger }: InjectedDependencies, options: VercelBlobOptions) {
    super()
    this.logger_ = logger
    this.token_ = options.token

    const prefix = (options.prefix ?? "medusa/").replace(/^\/+|\/+$/g, "")
    this.prefix_ = prefix ? `${prefix}/` : ""

    // Read-write tokens look like vercel_blob_rw_<storeId>_<secret>. The id in
    // the token is mixed-case; the URLs Vercel returns use it lowercased.
    const storeId = (options.token.split("_")[3] ?? "").toLowerCase()
    this.baseUrl_ = `https://${storeId}.public.blob.vercel-storage.com`
  }

  async upload(
    file: FileTypes.ProviderUploadFileDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file provided")
    }
    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const result = await put(
      `${this.prefix_}${Date.now()}-${this.safeName(file.filename)}`,
      this.decode(file.content ?? ""),
      {
        access: "public",
        token: this.token_,
        contentType: file.mimeType || undefined,
        addRandomSuffix: true,
        cacheControlMaxAge: CACHE_MAX_AGE,
      }
    )

    return { url: result.url, key: result.pathname }
  }

  async getUploadStream(fileData: FileTypes.ProviderUploadStreamDTO): Promise<{
    writeStream: PassThrough
    promise: Promise<FileTypes.ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    // The key and URL have to be known before the upload finishes, so the
    // pathname is made unique here instead of by Vercel's random suffix.
    const key = `${this.prefix_}${Date.now()}-${randomUUID()}-${this.safeName(fileData.filename)}`
    const writeStream = new PassThrough()

    const promise = put(key, writeStream, {
      access: "public",
      token: this.token_,
      contentType: fileData.mimeType || undefined,
      addRandomSuffix: false,
      cacheControlMaxAge: CACHE_MAX_AGE,
    }).then((result) => ({ url: result.url, key: result.pathname }))

    // A caller that never awaits the promise must not crash the process.
    promise.catch((e) => {
      this.logger_.error(`Vercel Blob: streamed upload of ${key} failed: ${e?.message ?? e}`)
    })

    return { writeStream, promise, url: this.urlFor(key), fileKey: key }
  }

  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const keys = (Array.isArray(files) ? files : [files])
      .map((f) => f?.fileKey)
      .filter((k): k is string => typeof k === "string" && k.length > 0)
    if (!keys.length) {
      return
    }

    try {
      await del(keys, { token: this.token_ })
    } catch (e) {
      // Like the S3 provider: a failed cleanup is logged, never fatal, so a
      // workflow compensation that deletes files cannot fail because of it.
      if (!(e instanceof BlobNotFoundError)) {
        this.logger_.error(`Vercel Blob: could not delete ${keys.join(", ")}: ${(e as Error)?.message ?? e}`)
      }
    }
  }

  async getPresignedDownloadUrl(fileData: FileTypes.ProviderGetFileDTO): Promise<string> {
    this.requireKey(fileData)
    // Public blobs need no signing: the permanent URL is the download URL.
    return this.urlFor(fileData.fileKey)
  }

  async getPresignedUploadUrl(
    fileData: FileTypes.ProviderGetPresignedUploadUrlDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }
    // Same as the local provider: a relative URL makes the admin fall back to a
    // multipart POST /admin/uploads, which lands in upload() above. Needed by
    // the dashboard's CSV product import.
    return { url: "/admin/uploads", key: fileData.filename }
  }

  async getDownloadStream(fileData: FileTypes.ProviderGetFileDTO): Promise<Readable> {
    const res = await this.fetchFile(fileData)
    return Readable.fromWeb(res.body as any)
  }

  async getAsBuffer(fileData: FileTypes.ProviderGetFileDTO): Promise<Buffer> {
    const res = await this.fetchFile(fileData)
    return Buffer.from(await res.arrayBuffer())
  }

  private async fetchFile(fileData: FileTypes.ProviderGetFileDTO): Promise<Response> {
    this.requireKey(fileData)
    const res = await fetch(this.urlFor(fileData.fileKey))
    if (res.status === 404) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `File with key ${fileData.fileKey} not found`
      )
    }
    if (!res.ok || !res.body) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Vercel Blob: reading ${fileData.fileKey} failed with HTTP ${res.status}`
      )
    }
    return res
  }

  private requireKey(fileData: FileTypes.ProviderGetFileDTO): void {
    if (!fileData?.fileKey) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No fileKey provided")
    }
  }

  /** Public URL of a key. Keys that are already URLs are returned as they are. */
  private urlFor(key: string): string {
    if (/^https?:\/\//i.test(key)) {
      return key
    }
    const pathname = key.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")
    return `${this.baseUrl_}/${pathname}`
  }

  /**
   * The admin sends file bytes as base64; the product import sends plain UTF-8
   * JSON. Decode the way the local and S3 providers do: base64 when it
   * round-trips, UTF-8 otherwise.
   */
  private decode(content: string): Buffer {
    const decoded = Buffer.from(content, "base64")
    return decoded.toString("base64") === content ? decoded : Buffer.from(content, "utf8")
  }

  /**
   * A pathname-safe version of an uploaded filename: `Ελαιόλαδο 1L.JPG` becomes
   * `elaiolado-1l.jpg`. multer decodes the original name as latin1, so Greek
   * names arrive garbled; they are repaired first when that round-trips.
   */
  private safeName(filename: string): string {
    let name = filename
    if (/^[\x00-\xff]*$/.test(name) && /[\x80-\xff]/.test(name)) {
      const repaired = Buffer.from(name, "latin1").toString("utf8")
      if (!repaired.includes("�")) {
        name = repaired
      }
    }

    const base = name.split(/[\\/]/).pop() ?? ""
    const ext = path.extname(base)
    const slug = (s: string) =>
      s
        .normalize("NFD")
        .replace(/\p{M}+/gu, "")
        .toLowerCase()
        .replace(/./gu, (c) => GREEK[c] ?? c)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    const stem = slug(base.slice(0, base.length - ext.length)).slice(0, 80).replace(/-+$/, "") || "file"
    const cleanExt = slug(ext).slice(0, 10)
    return cleanExt ? `${stem}.${cleanExt}` : stem
  }
}

export default VercelBlobFileService
