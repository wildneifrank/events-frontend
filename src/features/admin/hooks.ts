import { useAsync } from '@/hooks/useAsync'
import { dashboardService, ordersService } from '@/services'
import type { OrderQuery } from '@/types'

export function useDashboardStats() {
  return useAsync('dashboard-stats', () => dashboardService.getDashboardStats())
}

export function useOrders(query: OrderQuery) {
  return useAsync(`orders:${JSON.stringify(query)}`, () => ordersService.getOrders(query))
}
