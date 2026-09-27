import { CalendarDays, MapPin, Ticket as TicketIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EventBanner } from '@/components/events/EventBanner'
import { Skeleton, StatusBadge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import type { Ticket } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate, formatTime } from '@/utils/format'

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const muted = ticket.status === 'used' || ticket.status === 'cancelled'

  return (
    <article className="group relative">
      <Link
        to={ROUTES.ticket(ticket.id)}
        className={cn(
          'focus-ring rounded-card border-border bg-surface shadow-card hover:shadow-elevated flex overflow-hidden border transition-[box-shadow,border-color] duration-200 hover:border-slate-300',
          'flex-col sm:flex-row',
        )}
      >
        <EventBanner
          src={ticket.eventBannerUrl}
          category={ticket.eventCategory}
          width={400}
          className={cn('h-32 w-full shrink-0 sm:h-auto sm:w-44', muted && 'grayscale')}
        />

        {/* Perforation between stub and body */}
        <div className="relative hidden w-0 sm:block" aria-hidden="true">
          <span className="border-border bg-background absolute -top-3 -left-3 size-6 rounded-full border" />
          <span className="border-border bg-background absolute -bottom-3 -left-3 size-6 rounded-full border" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-h4 text-ink group-hover:text-primary-dark transition-colors">
              {ticket.eventTitle}
            </h3>
            <StatusBadge kind="ticket" status={ticket.status} />
          </div>

          <dl className="text-small grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div className="text-muted flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Data</dt>
              <dd>
                {formatDate(ticket.eventStartsAt)} · {formatTime(ticket.eventStartsAt)}
              </dd>
            </div>
            <div className="text-muted flex min-w-0 items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Local</dt>
              <dd className="truncate">{ticket.venueName}</dd>
            </div>
            <div className="text-muted flex items-center gap-2">
              <TicketIcon className="size-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Tipo</dt>
              <dd className="text-ink font-medium">{ticket.batchName}</dd>
            </div>
            <div className="text-muted flex items-center gap-2">
              <dt className="text-caption uppercase">Nº</dt>
              <dd className="text-small text-ink font-mono">{ticket.code}</dd>
            </div>
          </dl>

          <div className="mt-auto flex justify-end">
            <span
              aria-hidden="true"
              className="bg-primary-50 text-primary-dark group-hover:bg-primary inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors group-hover:text-white"
            >
              Ver ingresso
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function TicketCardSkeleton() {
  return (
    <div className="rounded-card border-border bg-surface flex flex-col overflow-hidden border sm:flex-row">
      <Skeleton className="h-32 w-full rounded-none sm:h-auto sm:w-44" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
        </div>
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
    </div>
  )
}
