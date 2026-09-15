import { Module } from "@medusajs/framework/utils"
import InvoicesModuleService from "./service"

export const INVOICES_MODULE = "invoices"

export default Module(INVOICES_MODULE, {
  service: InvoicesModuleService,
})
