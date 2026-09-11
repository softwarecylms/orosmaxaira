import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import SmtpNotificationService from "./service"

/** Email-channel provider for the Notification module — see ./service.ts. */
export default ModuleProvider(Modules.NOTIFICATION, {
  services: [SmtpNotificationService],
})
