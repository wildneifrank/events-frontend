import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

function pageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const tokens: PageToken[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) tokens.push('ellipsis-start')
  for (let current = start; current <= end; current++) tokens.push(current)
  if (end < totalPages - 1) tokens.push('ellipsis-end')
  tokens.push(totalPages)
  return tokens
}

interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  pageSize?: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && total === undefined) return null

  const itemClass = (active = false) =>
    cn(
      'focus-ring inline-flex size-10 items-center justify-center rounded-lg text-small font-semibold transition-colors',
      active ? 'bg-primary text-white' : 'text-ink hover:bg-slate-100',
      'disabled:pointer-events-none disabled:opacity-40',
    )

  const from = total && pageSize ? (page - 1) * pageSize + 1 : null
  const to = total && pageSize ? Math.min(page * pageSize, total) : null

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}
    >
      {total !== undefined && from && to ? (
        <p className="text-small text-muted">
          Mostrando <span className="text-ink font-semibold">{from}</span>–
          <span className="text-ink font-semibold">{to}</span> de{' '}
          <span className="text-ink font-semibold">{formatNumber(total)}</span>
        </p>
      ) : (
        <span />
      )}
      {totalPages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              className={itemClass()}
              onClick={() => onChange(page - 1)}
              disabled={page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
          </li>
          {pageTokens(page, totalPages).map((token) =>
            typeof token === 'number' ? (
              <li key={token} className={cn(token !== page && 'hidden sm:block')}>
                <button
                  type="button"
                  className={itemClass(token === page)}
                  onClick={() => onChange(token)}
                  aria-current={token === page ? 'page' : undefined}
                  aria-label={`Página ${token}`}
                >
                  {token}
                </button>
              </li>
            ) : (
              <li key={token} aria-hidden="true" className="text-muted hidden px-1 sm:block">
                …
              </li>
            ),
          )}
          <li className="text-small text-muted px-2 sm:hidden" aria-hidden="true">
            de {totalPages}
          </li>
          <li>
            <button
              type="button"
              className={itemClass()}
              onClick={() => onChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </li>
        </ul>
      )}
    </nav>
  )
}
