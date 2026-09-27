import { ChevronDown } from 'lucide-react'
import { type ReactNode, type SelectHTMLAttributes, useId } from 'react'

import { cn } from '@/utils/cn'

import { Field } from './Field'
import { controlStyles, describedBy } from './fieldUtils'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  disabled?: boolean
}

interface SelectProps<T extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  options: readonly SelectOption<T>[]
  placeholder?: string
  size?: 'sm' | 'md'
  containerClassName?: string
}

/** Native select for full keyboard/screen-reader support, styled to match the design system. */
export function Select<T extends string>({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  required,
  size = 'md',
  className,
  containerClassName,
  ...props
}: SelectProps<T>) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <Field
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, hint, error)}
          className={cn(
            controlStyles(Boolean(error)),
            'appearance-none pr-10 pl-3.5',
            size === 'sm' ? 'h-9 rounded-lg text-sm' : 'h-11',
            className,
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        />
      </div>
    </Field>
  )
}
