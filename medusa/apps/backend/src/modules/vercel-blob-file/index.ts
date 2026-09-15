import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import VercelBlobFileService from "./service"

/** Vercel Blob storage provider for the File module — see ./service.ts. */
export default ModuleProvider(Modules.FILE, {
  services: [VercelBlobFileService],
})
