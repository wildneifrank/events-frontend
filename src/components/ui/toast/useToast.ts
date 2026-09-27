import { useContext } from 'react'

import { type ToastApi, ToastContext } from './toastContext'

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
