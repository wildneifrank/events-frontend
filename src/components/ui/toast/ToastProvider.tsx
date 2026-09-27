import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

import { type ToastApi, ToastContext, type ToastOptions, type ToastTone } from './toastContext'

interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'tone'>> {
  id: number
  description?: string
}

const ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="text-success" />,
  error: <XCircle className="text-danger" />,
  warning: <AlertTriangle className="text-warning" />,
  info: <Info className="text-info" />,
}

const MAX_VISIBLE = 4

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    ({ title, description, tone = 'info', durationMs = 4500 }: ToastOptions) => {
      const id = ++nextId.current
      setToasts((current) => [
        ...current.slice(-(MAX_VISIBLE - 1)),
        { id, title, description, tone },
      ])
      window.setTimeout(() => dismiss(id), durationMs)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ title, description, tone: 'success' }),
      error: (title, description) => show({ title, description, tone: 'error', durationMs: 6000 }),
      info: (title, description) => show({ title, description, tone: 'info' }),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'animate-slide-up border-border bg-surface shadow-elevated pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4',
            )}
          >
            <span className="mt-0.5 shrink-0 [&>svg]:size-5" aria-hidden="true">
              {ICONS[toast.tone]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-small text-ink font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-small text-muted mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
              className="focus-ring text-muted hover:text-ink -m-1 rounded-md p-1"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
