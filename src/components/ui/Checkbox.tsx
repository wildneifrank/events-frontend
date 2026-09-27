import { Check } from 'lucide-react'
import { type InputHTMLAttributes, type ReactNode, useId } from 'react'

import { cn } from '@/utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
  error?: string
}

export function Checkbox({ label, description, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="group flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <input
            id={inputId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'peer bg-surface size-5 cursor-pointer appearance-none rounded-md border transition-colors',
              'checked:border-primary checked:bg-primary focus-visible:ring-primary/20 focus-visible:ring-4 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-danger' : 'group-hover:border-primary border-slate-300',
            )}
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100"
          />
        </span>
        <span className="flex flex-col">
          <span className="text-small text-ink">{label}</span>
          {description && <span className="text-small text-muted">{description}</span>}
        </span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-small text-danger pl-8">
          {error}
        </p>
      )}
    </div>
  )
}
