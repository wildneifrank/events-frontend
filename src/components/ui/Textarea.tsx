import { type ReactNode, type TextareaHTMLAttributes, useId } from 'react'

import { cn } from '@/utils/cn'

import { Field } from './Field'
import { controlStyles, describedBy } from './fieldUtils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
}

export function Textarea({
  label,
  hint,
  error,
  id,
  required,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(controlStyles(Boolean(error)), 'resize-y px-3.5 py-3', className)}
        {...props}
      />
    </Field>
  )
}
