/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import { serverFunction } from './server-function'

import '@/styles/payload-overrides.css'

type Args = { children: React.ReactNode }

const Layout = ({ children }: Args) =>
  RootLayout({ config, importMap, children, serverFunction } as any)

export default Layout
