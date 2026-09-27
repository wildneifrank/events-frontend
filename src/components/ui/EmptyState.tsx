import { AlertCircle, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'danger'
  compact?: boolean
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card border-border bg-surface flex flex-col items-center justify-center border border-dashed text-center',
        compact ? 'gap-3 px-6 py-10' : 'gap-4 px-6 py-16',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl [&>svg]:size-7',
            tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-primary-50 text-primary',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="flex max-w-md flex-col gap-1.5">
        <h3 className="text-h4 text-ink">{title}</h3>
        {description && <p className="text-small text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Não foi possível carregar',
  message = 'Verifique sua conexão e tente novamente.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={className}>
      <EmptyState
        tone="danger"
        icon={<AlertCircle />}
        title={title}
        description={message}
        action={
          onRetry && (
            <Button variant="outline" leftIcon={<RotateCw className="size-4" />} onClick={onRetry}>
              Tentar novamente
            </Button>
          )
        }
      />
    </div>
  )
}
