import { useAsync } from '@/hooks/useAsync'
import { eventsService } from '@/services'
import type { EventQuery } from '@/types'

export function useEvents(query: EventQuery) {
  return useAsync(`events:${JSON.stringify(query)}`, () => eventsService.getEvents(query))
}

export function useEvent(id: string | undefined) {
  return useAsync(id ? `event:${id}` : null, () => eventsService.getEventById(id ?? ''))
}

export function useEventCities() {
  return useAsync('event-cities', () => eventsService.getEventCities())
}
