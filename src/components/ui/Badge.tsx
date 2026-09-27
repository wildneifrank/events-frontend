import type { HTMLAttributes } from 'react'

import type { Tone } from '@/constants/status'
import { cn } from '@/utils/cn'

const SOFT: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-dark',
  success: 'bg-success-soft text-green-800',
  warning: 'bg-warning-soft text-amber-800',
  danger: 'bg-danger-soft text-red-800',
  info: 'bg-info-soft text-blue-800',
}

const SOLID: Record<Tone, string> = {
  neutral: 'bg-slate-800 text-white',
  primary: 'bg-primary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-ink',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
}

const DOT: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  variant?: 'soft' | 'solid' | 'glass'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variant === 'soft' && SOFT[tone],
        variant === 'solid' && SOLID[tone],
        variant === 'glass' && 'text-ink bg-white/90 shadow-sm backdrop-blur',
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOT[tone])} />}
      {children}
    </span>
  )
}
