import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-dark active:bg-primary-dark/90',
  secondary: 'bg-primary-50 text-primary-dark hover:bg-primary-100 active:bg-primary-100/80',
  outline:
    'border border-border bg-surface text-ink hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
  ghost: 'text-ink hover:bg-slate-100 active:bg-slate-200/70',
  danger: 'bg-danger text-white shadow-sm shadow-danger/20 hover:bg-red-700 active:bg-red-800',
  success:
    'bg-success text-white shadow-sm shadow-success/20 hover:bg-green-700 active:bg-green-800',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
  icon: 'size-11 rounded-xl',
  'icon-sm': 'size-9 rounded-lg',
}

export interface StyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: StyleOptions = {}) {
  return cn(
    'focus-ring inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 select-none',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}
