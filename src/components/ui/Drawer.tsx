import { X } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'

import { cn } from '@/utils/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  side?: 'left' | 'right'
  className?: string
}

export function Drawer({ open, onClose, label, children, side = 'left', className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        'backdrop:animate-fade-in m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none bg-transparent p-0',
        side === 'left' ? 'open:animate-slide-in-left' : 'ml-auto',
      )}
    >
      {open && (
        <div className={cn('bg-surface shadow-elevated relative flex h-full flex-col', className)}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="focus-ring text-muted hover:text-ink absolute top-4 right-4 rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  )
}
