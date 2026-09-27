import type { HTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
}

export function Card({ className, padded = false, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border-border bg-surface shadow-card border',
        padded && 'p-5 sm:p-6',
        interactive &&
          'hover:shadow-elevated transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-slate-300',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-h4 text-ink', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-small text-muted', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-border flex flex-wrap items-center gap-3 border-t px-5 py-4 sm:px-6',
        className,
      )}
      {...props}
    />
  )
}
