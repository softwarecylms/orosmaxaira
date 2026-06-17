'use server'

import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import type { ServerFunctionClientArgs } from 'payload'

export const serverFunction = async (args: ServerFunctionClientArgs) => {
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}
