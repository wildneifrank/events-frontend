import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const STYLES: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: {
    box: 'border-blue-200 bg-info-soft/60 text-blue-900',
    icon: <Info className="text-info" />,
  },
  success: {
    box: 'border-green-200 bg-success-soft/60 text-green-900',
    icon: <CheckCircle2 className="text-success" />,
  },
  warning: {
    box: 'border-amber-200 bg-warning-soft/60 text-amber-900',
    icon: <AlertTriangle className="text-warning" />,
  },
  danger: {
    box: 'border-red-200 bg-danger-soft/60 text-red-900',
    icon: <XCircle className="text-danger" />,
  },
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const style = STYLES[tone]
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4', style.box, className)}
    >
      <span className="mt-0.5 shrink-0 [&>svg]:size-5" aria-hidden="true">
        {style.icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="text-small font-semibold">{title}</p>}
        {children && <div className="text-small opacity-90">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dispensar"
          className="focus-ring -m-1 h-fit rounded-md p-1 opacity-70 hover:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
