import { Clock, MapPin } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

import { Badge, PriceDisplay, Skeleton } from '@/components/ui'
import { getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import type { Event } from '@/types'
import { cn } from '@/utils/cn'
import { eventMinPrice, eventRemaining, eventSoldRatio } from '@/utils/event'
import { formatNumber, formatTime, formatWeekday } from '@/utils/format'

import { EventBanner } from './EventBanner'
import { EventDateBadge } from './EventDateBadge'

const SCARCITY_RATIO = 0.85

interface EventCardProps {
  event: Event
  className?: string
}

/**
 * The whole card is a single link (one tab stop). "Ver evento" is a visual
 * affordance inside it, not a nested interactive element.
 */
export const EventCard = memo(function EventCard({ event, className }: EventCardProps) {
  const category = getCategory(event.category)
  const remaining = eventRemaining(event)
  const scarce = eventSoldRatio(event) >= SCARCITY_RATIO && remaining > 0
  const soldOut = remaining === 0

  return (
    <article className={cn('group relative h-full', className)}>
      <Link
        to={ROUTES.event(event.id)}
        className="focus-ring rounded-card border-border bg-surface shadow-card hover:shadow-elevated flex h-full flex-col overflow-hidden border transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-slate-300"
      >
        <div className="relative">
          <EventBanner
            src={event.bannerUrl}
            category={event.category}
            width={640}
            className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <Badge variant="glass">{category.label}</Badge>
            <EventDateBadge date={event.startsAt} />
          </div>
          {(scarce || soldOut) && (
            <Badge
              tone={soldOut ? 'neutral' : 'warning'}
              variant="solid"
              className="absolute bottom-3 left-3"
            >
              {soldOut ? 'Esgotado' : `Últimos ${formatNumber(remaining)} ingressos`}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-h4 text-ink group-hover:text-primary-dark line-clamp-2 transition-colors">
              {event.title}
            </h3>
            <p className="text-small text-muted flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              {formatWeekday(event.startsAt)} · {formatTime(event.startsAt)}
            </p>
            <p className="text-small text-muted flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {event.venue.name} · {event.venue.city}
              </span>
            </p>
          </div>

          <div className="border-border mt-auto flex items-end justify-between gap-3 border-t pt-3">
            <PriceDisplay value={eventMinPrice(event)} prefix="A partir de" />
            <span
              aria-hidden="true"
              className="bg-primary-50 text-primary-dark group-hover:bg-primary inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors group-hover:text-white"
            >
              Ver evento
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
})

export function EventCardSkeleton() {
  return (
    <div className="rounded-card border-border bg-surface overflow-hidden border">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="border-border mt-2 flex items-end justify-between border-t pt-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
