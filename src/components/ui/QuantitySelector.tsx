import { Minus, Plus } from 'lucide-react'

import { cn } from '@/utils/cn'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max: number
  label: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max,
  label,
  disabled = false,
  size = 'md',
}: QuantitySelectorProps) {
  const buttonClass = cn(
    'focus-ring flex items-center justify-center rounded-lg text-ink transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-35',
    size === 'sm' ? 'size-8' : 'size-10',
  )

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'border-border bg-surface inline-flex items-center rounded-xl border p-0.5',
        disabled && 'opacity-50',
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Remover um — ${label}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'text-center font-semibold tabular-nums',
          size === 'sm' ? 'w-7 text-sm' : 'w-9',
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Adicionar um — ${label}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
