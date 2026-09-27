import type { ReactNode } from 'react'

import { Breadcrumb, type BreadcrumbItem } from '@/components/ui'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-h1 text-ink">{title}</h1>
          {description && <p className="text-body text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}
