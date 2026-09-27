import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Você está em" className={cn('min-w-0', className)}>
      <ol className="text-small text-muted flex min-w-0 items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li
              key={`${item.label}-${index}`}
              className={cn('flex min-w-0 items-center gap-1.5', last && 'truncate')}
            >
              {item.to && !last ? (
                <Link to={item.to} className="focus-ring hover:text-ink rounded transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn('truncate', last && 'text-ink font-medium')}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
