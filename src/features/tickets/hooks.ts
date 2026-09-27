import { useAsync } from '@/hooks/useAsync'
import { type AdminTicketQuery, ticketsService } from '@/services'
import type { TicketScope } from '@/types'

export function useMyTickets(scope: TicketScope) {
  return useAsync(`my-tickets:${scope}`, () => ticketsService.getTickets(scope))
}

export function useTicket(id: string | undefined) {
  return useAsync(id ? `ticket:${id}` : null, () => ticketsService.getTicketById(id ?? ''))
}

export function useAllTickets(query: AdminTicketQuery) {
  return useAsync(`all-tickets:${JSON.stringify(query)}`, () => ticketsService.getAllTickets(query))
}
