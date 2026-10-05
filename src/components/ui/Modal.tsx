import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'

import { cn } from '@/utils/cn'

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof SIZES
  dismissible?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'backdrop:animate-fade-in open:animate-slide-up m-0 mt-auto w-full max-w-none bg-transparent p-0',
        'sm:m-auto sm:w-[calc(100%-2rem)]',
        SIZES[size],
      )}
    >
      {open && (
        <div className="bg-surface shadow-elevated flex max-h-[90dvh] flex-col rounded-t-3xl sm:rounded-2xl">
          <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-h3 text-ink">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-small text-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="focus-ring text-muted hover:text-ink -mt-1 -mr-2 rounded-lg p-2 transition-colors hover:bg-slate-100"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </header>
          {children && <div className="overflow-y-auto px-5 py-4 sm:px-6">{children}</div>}
          {footer && (
            <footer className="flex flex-col-reverse gap-2 px-5 pt-2 pb-5 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  )
}
