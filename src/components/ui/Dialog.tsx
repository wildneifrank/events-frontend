import { AlertTriangle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Confirmation dialog for destructive or important actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const Icon = tone === 'danger' ? AlertTriangle : Info
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      dismissible={!loading}
      title={
        <span className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-primary-50 text-primary',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {title}
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-body text-muted">{description}</div>
    </Modal>
  )
}
