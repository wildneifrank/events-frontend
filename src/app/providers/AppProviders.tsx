import type { ReactNode } from 'react'

import { ToastProvider } from '@/components/ui'
import { AuthProvider } from '@/features/authentication/AuthProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  )
}
