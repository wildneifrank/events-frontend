import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import { fieldIds } from './fieldUtils'

export interface FieldProps {
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + hint/error wiring shared by every form control. */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const ids = fieldIds(id)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-small text-ink font-medium">
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={ids.error} className="text-small text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={ids.hint} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
