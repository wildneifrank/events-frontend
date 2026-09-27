import { EVENT_STATUS, ORDER_STATUS, TICKET_STATUS } from '@/constants/status'
import type { EventStatus, OrderStatus, TicketStatus } from '@/types'

import { Badge } from './Badge'

type StatusBadgeProps =
  | { kind: 'event'; status: EventStatus }
  | { kind: 'order'; status: OrderStatus }
  | { kind: 'ticket'; status: TicketStatus }

function resolve(props: StatusBadgeProps) {
  switch (props.kind) {
    case 'event':
      return EVENT_STATUS[props.status]
    case 'order':
      return ORDER_STATUS[props.status]
    case 'ticket':
      return TICKET_STATUS[props.status]
  }
}

export function StatusBadge(props: StatusBadgeProps & { className?: string }) {
  const meta = resolve(props)
  return (
    <Badge tone={meta.tone} dot className={props.className}>
      {meta.label}
    </Badge>
  )
}
