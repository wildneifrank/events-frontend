import type { KpiValue } from '@/types'

import { createRandom } from './mockUtils'

/**
 * Baseline traffic that represents sales made through channels not modelled
 * in the mock orders (box office, partners…). New mock orders are added on top,
 * so the dashboard reacts to purchases made during the demo.
 */
export function createDailyBaseline(days = 7) {
  const random = createRandom(7)
  return Array.from({ length: days }, (_, index) => {
    const weekendBoost = index % 7 === 5 || index % 7 === 6 ? 1.35 : 1
    const tickets = Math.round(random.int(180, 320) * weekendBoost)
    return { tickets, revenue: tickets * random.int(92, 128) }
  })
}

export const KPI_CHANGES: Record<
  'activeEvents' | 'ticketsSold' | 'revenue' | 'orders',
  KpiValue['change']
> = {
  activeEvents: 0.083,
  ticketsSold: 0.142,
  revenue: 0.186,
  orders: -0.024,
}

/** Orders sold outside the seeded list, so the KPI resembles a real operation. */
export const HISTORICAL_ORDERS = 6_812
