import type { Event, TicketBatch } from '@/types'

export type BatchAvailability = 'available' | 'last-units' | 'sold-out' | 'not-started' | 'ended'

export const LAST_UNITS_THRESHOLD = 0.1

export function batchRemaining(batch: TicketBatch): number {
  return Math.max(batch.quantity - batch.sold, 0)
}

export function batchAvailability(batch: TicketBatch, now = Date.now()): BatchAvailability {
  const remaining = batchRemaining(batch)
  if (remaining === 0) return 'sold-out'
  if (new Date(batch.startsAt).getTime() > now) return 'not-started'
  if (new Date(batch.endsAt).getTime() < now) return 'ended'
  if (remaining / batch.quantity <= LAST_UNITS_THRESHOLD) return 'last-units'
  return 'available'
}

export function isBatchPurchasable(batch: TicketBatch, now = Date.now()): boolean {
  const status = batchAvailability(batch, now)
  return status === 'available' || status === 'last-units'
}

export function eventMinPrice(event: Event): number {
  const purchasable = event.batches.filter((batch) => isBatchPurchasable(batch))
  const pool = purchasable.length > 0 ? purchasable : event.batches
  return pool.reduce((min, batch) => Math.min(min, batch.price), Number.POSITIVE_INFINITY)
}

export function eventCapacity(event: Event): number {
  return event.batches.reduce((sum, batch) => sum + batch.quantity, 0)
}

export function eventTicketsSold(event: Event): number {
  return event.batches.reduce((sum, batch) => sum + batch.sold, 0)
}

export function eventRemaining(event: Event): number {
  return eventCapacity(event) - eventTicketsSold(event)
}

export function eventRevenue(event: Event): number {
  return event.batches.reduce((sum, batch) => sum + batch.sold * batch.price, 0)
}

export function eventSoldRatio(event: Event): number {
  const capacity = eventCapacity(event)
  return capacity === 0 ? 0 : eventTicketsSold(event) / capacity
}

export function isEventPast(event: Pick<Event, 'endsAt'>, now = Date.now()): boolean {
  return new Date(event.endsAt).getTime() < now
}
