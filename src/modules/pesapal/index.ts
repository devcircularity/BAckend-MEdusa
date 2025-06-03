// src/modules/pesapal/index.ts
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PesapalProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [PesapalProviderService],
})
