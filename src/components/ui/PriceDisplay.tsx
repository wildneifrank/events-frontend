import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/format'

const SIZES = {
  sm: 'text-sm font-semibold',
  md: 'text-lg font-bold',
  lg: 'text-2xl font-bold tracking-tight',
  xl: 'text-3xl font-extrabold tracking-tight',
}

interface PriceDisplayProps {
  value: number
  prefix?: string
  suffix?: string
  size?: keyof typeof SIZES
  className?: string
}

export function PriceDisplay({ value, prefix, suffix, size = 'md', className }: PriceDisplayProps) {
  const free = value === 0
  return (
    <p className={cn('flex flex-col', className)}>
      {prefix && !free && <span className="text-caption text-muted font-medium">{prefix}</span>}
      <span className={cn('text-ink tabular-nums', SIZES[size], free && 'text-success')}>
        {free ? 'Gratuito' : formatCurrency(value)}
        {suffix && !free && (
          <span className="text-small text-muted ml-1 font-medium">{suffix}</span>
        )}
      </span>
    </p>
  )
}
