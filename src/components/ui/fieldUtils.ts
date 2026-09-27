import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

export const fieldIds = (id: string) => ({ hint: `${id}-hint`, error: `${id}-error` })

export function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = fieldIds(id)
  return [error ? ids.error : null, hint ? ids.hint : null].filter(Boolean).join(' ') || undefined
}

export const controlStyles = (hasError?: boolean) =>
  cn(
    'w-full rounded-xl border bg-surface text-body text-ink placeholder:text-slate-400',
    'transition-[border-color,box-shadow] duration-150 outline-none',
    'focus:border-primary focus:ring-4 focus:ring-primary/15',
    'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted',
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-border hover:border-slate-300',
  )
