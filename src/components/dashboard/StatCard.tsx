import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'
import { formatPercent } from '@/utils/format'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  /** Relative change vs. previous period (0.12 = +12%). */
  change?: number
  changeLabel?: string
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeLabel = 'vs. mês anterior',
}: StatCardProps) {
  const positive = (change ?? 0) >= 0
  const Arrow = positive ? ArrowUpRight : ArrowDownRight

  return (
    <Card padded className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-small text-muted font-medium">{label}</p>
        <span
          className="bg-primary-50 text-primary flex size-10 items-center justify-center rounded-xl [&>svg]:size-5"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <p className="text-h1 text-ink break-words tabular-nums">{value}</p>
      {change !== undefined && (
        <p className="text-small text-muted flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold',
              positive ? 'bg-success-soft text-green-800' : 'bg-danger-soft text-red-800',
            )}
          >
            <Arrow className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{positive ? 'Alta de' : 'Queda de'}</span>
            {formatPercent(change)}
          </span>
          {changeLabel}
        </p>
      )}
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card padded className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-4 w-40" />
    </Card>
  )
}
