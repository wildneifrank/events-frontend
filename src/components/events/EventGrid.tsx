import { LoadingRegion } from '@/components/ui'
import type { Event } from '@/types'
import { cn } from '@/utils/cn'

import { EventCard, EventCardSkeleton } from './EventCard'

const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'

export function EventGrid({ events, className }: { events: Event[]; className?: string }) {
  return (
    <ul className={cn(GRID, className)}>
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  )
}

export function EventGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <LoadingRegion label="Carregando eventos" className={cn(GRID, className)}>
      {Array.from({ length: count }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </LoadingRegion>
  )
}
