import { Search, X } from 'lucide-react'
import { type FormEvent, useId } from 'react'

import { cn } from '@/utils/cn'

import { Button } from './Button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  label?: string
  size?: 'md' | 'lg'
  submitLabel?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar eventos, artistas ou locais...',
  label = 'Buscar eventos',
  size = 'md',
  submitLabel,
  className,
}: SearchBarProps) {
  const id = useId()
  const large = size === 'lg'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit?.(value.trim())
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'border-border bg-surface focus-within:border-primary focus-within:ring-primary/15 flex items-center gap-2 rounded-2xl border transition-[box-shadow,border-color] focus-within:ring-4',
        large ? 'shadow-elevated p-2 pl-4 sm:pl-5' : 'h-11 pr-1.5 pl-3.5',
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className={cn('text-muted shrink-0', large ? 'size-5' : 'size-[18px]')}
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'text-ink min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden',
          large ? 'h-12 text-base sm:text-lg' : 'text-body',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="focus-ring text-muted hover:text-ink rounded-lg p-1.5 transition-colors hover:bg-slate-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
      {submitLabel && (
        <Button type="submit" size={large ? 'lg' : 'sm'} className="max-sm:px-4">
          <Search className="size-4 sm:hidden" aria-hidden="true" />
          <span className="max-sm:sr-only">{submitLabel}</span>
        </Button>
      )}
    </form>
  )
}
