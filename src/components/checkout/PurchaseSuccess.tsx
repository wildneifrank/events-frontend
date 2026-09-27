import { CheckCircle2, Loader2, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonLink, Card, StatusBadge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import type { Event, Order } from '@/types'
import { formatCurrency, formatDateTime, formatLongDate, formatTime } from '@/utils/format'

import { CheckoutSteps } from './CheckoutSteps'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="text-small text-ink font-medium sm:text-right">{children}</dd>
    </div>
  )
}

export function PurchaseSuccess({ order, event }: { order: Order; event: Event }) {
  const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
      <CheckoutSteps current={2} />
      <div className="flex flex-col items-center gap-4">
        <span className="animate-slide-up bg-success-soft text-success flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <h1 className="text-h1 text-ink">Compra realizada!</h1>
        <p className="text-body text-muted">
          Enviamos a confirmação para{' '}
          <span className="text-ink font-medium">{order.customerEmail}</span>.
        </p>
      </div>

      <Card className="w-full text-left">
        <dl className="flex flex-col gap-3 p-5 sm:p-6">
          <Row label="Número do pedido">
            <span className="font-mono">{order.number}</span>
          </Row>
          <Row label="Evento">{event.title}</Row>
          <Row label="Data">
            {formatLongDate(event.startsAt)}, {formatTime(event.startsAt)}
          </Row>
          <Row label="Ingresso">
            {order.items.map((item) => `${item.quantity}× ${item.batchName}`).join(', ')}
          </Row>
          <Row label="Total pago">{formatCurrency(order.total)}</Row>
          <Row label="Status">
            <StatusBadge kind="order" status={order.status} />
          </Row>
          <Row label="Realizado em">{formatDateTime(order.createdAt)}</Row>
        </dl>
        <div
          className="border-border bg-primary-50/50 flex items-start gap-3 border-t p-5 sm:px-6"
          role="status"
        >
          <Loader2
            className="text-primary mt-0.5 size-5 shrink-0 animate-spin"
            aria-hidden="true"
          />
          <div>
            <p className="text-small text-ink font-semibold">Seu ingresso está sendo preparado.</p>
            <p className="text-small text-muted">
              Estamos gerando {ticketCount > 1 ? `seus ${ticketCount} ingressos` : 'seu ingresso'}{' '}
              com QR code. Isso leva poucos segundos — você pode acompanhar em “Meus ingressos”.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <ButtonLink
          to={ROUTES.myTickets}
          size="lg"
          leftIcon={<Ticket className="size-4" aria-hidden="true" />}
        >
          Ver meus ingressos
        </ButtonLink>
        <ButtonLink to={ROUTES.events} size="lg" variant="outline">
          Continuar explorando
        </ButtonLink>
      </div>
    </div>
  )
}
