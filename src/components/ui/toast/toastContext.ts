import { createContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  durationMs?: number
}

export interface ToastApi {
  show: (options: ToastOptions) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
