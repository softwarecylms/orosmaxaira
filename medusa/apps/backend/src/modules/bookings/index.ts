import { Module } from "@medusajs/framework/utils"
import BookingsModuleService from "./service"

export const BOOKINGS_MODULE = "bookings"

export default Module(BOOKINGS_MODULE, {
  service: BookingsModuleService,
})
