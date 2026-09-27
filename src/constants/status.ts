import type { EventStatus, OrderStatus, TicketStatus } from '@/types'

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface StatusMeta {
  label: string
  tone: Tone
}

export const EVENT_STATUS: Record<EventStatus, StatusMeta> = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  published: { label: 'Publicado', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
  finished: { label: 'Encerrado', tone: 'info' },
}

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  paid: { label: 'Pago', tone: 'success' },
  pending: { label: 'Pendente', tone: 'warning' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
}

export const TICKET_STATUS: Record<TicketStatus, StatusMeta> = {
  processing: { label: 'Em preparação', tone: 'warning' },
  valid: { label: 'Válido', tone: 'success' },
  used: { label: 'Utilizado', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
}
