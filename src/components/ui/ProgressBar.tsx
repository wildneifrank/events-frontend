import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  label: string
  tone?: 'primary' | 'warning' | 'danger' | 'success'
  className?: string
}

const TONES = {
  primary: 'bg-primary',
  warning: 'bg-warning',
  danger: 'bg-danger',
  success: 'bg-success',
}

/** `value` between 0 and 1. */
export function ProgressBar({ value, label, tone = 'primary', className }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', TONES[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
