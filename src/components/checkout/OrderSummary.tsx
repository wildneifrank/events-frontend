import { CalendarDays, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'

import { EventBanner } from '@/components/events/EventBanner'
import { Card } from '@/components/ui'
import type { SelectionLine } from '@/features/checkout/selection'
import type { Event } from '@/types'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'

interface OrderSummaryProps {
  event: Event
  lines: SelectionLine[]
  subtotal: number
  fee: number
  total: number
  footer?: ReactNode
}

export function OrderSummary({ event, lines, subtotal, fee, total, footer }: OrderSummaryProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-border flex gap-4 border-b p-5">
        <EventBanner
          src={event.bannerUrl}
          category={event.category}
          width={200}
          className="size-16 shrink-0 rounded-xl"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-h4 text-ink">{event.title}</h2>
          <p className="text-small text-muted flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          </p>
          <p className="text-small text-muted flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue.name}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <h3 className="text-caption text-muted font-semibold tracking-wide uppercase">
          Resumo do pedido
        </h3>
        <ul className="flex flex-col gap-3">
          {lines.map((line) => (
            <li key={line.batchId} className="text-small flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-ink font-medium">{line.name}</span>
                <span className="text-muted">
                  {line.quantity} × {formatCurrency(line.unitPrice)}
                </span>
              </div>
              <span className="text-ink font-medium tabular-nums">
                {formatCurrency(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="border-border text-small flex flex-col gap-2 border-t pt-4">
          <div className="text-muted flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="text-muted flex justify-between">
            <dt>Taxa de serviço (10%)</dt>
            <dd className="tabular-nums">{formatCurrency(fee)}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <dt className="text-body text-ink font-semibold">Total</dt>
            <dd className="text-h3 text-ink tabular-nums">{formatCurrency(total)}</dd>
          </div>
        </dl>
        {footer}
      </div>
    </Card>
  )
}
