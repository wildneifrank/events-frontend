import { type InputHTMLAttributes, type ReactNode, useId } from 'react'

import { cn } from '@/utils/cn'

import { Field } from './Field'
import { controlStyles, describedBy } from './fieldUtils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  containerClassName?: string
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  id,
  required,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <Field
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="text-muted pointer-events-none absolute inset-y-0 left-3.5 flex items-center [&>svg]:size-[18px]">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={cn(
            controlStyles(Boolean(error)),
            'h-11 px-3.5',
            leftIcon && 'pl-10',
            rightSlot && 'pr-11',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{rightSlot}</div>
        )}
      </div>
    </Field>
  )
}
