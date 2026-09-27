import {
  CalendarDays,
  CalendarX2,
  DollarSign,
  ExternalLink,
  MapPin,
  Pencil,
  Percent,
  Ticket,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { StatCard } from '@/components/dashboard/StatCard'
import { EventBanner } from '@/components/events/EventBanner'
import {
  Breadcrumb,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingRegion,
  ProgressBar,
  Skeleton,
  StatusBadge,
  useToast,
} from '@/components/ui'
import { getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useOrders } from '@/features/admin/hooks'
import { useEvent } from '@/features/events/hooks'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { eventsService } from '@/services'
import type { Event, Order, TicketBatch } from '@/types'
import { toErrorMessage } from '@/utils/errors'
import {
  batchRemaining,
  eventCapacity,
  eventRevenue,
  eventSoldRatio,
  eventTicketsSold,
} from '@/utils/event'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatLongDate,
  formatNumber,
  formatTime,
} from '@/utils/format'

function RecentOrders({ eventId }: { eventId: string }) {
  const { status, data, error, reload } = useOrders({ eventId, pageSize: 5 })
  if (status === 'loading' && !data) return <Skeleton className="m-5 h-40" />
  if (status === 'error')
    return (
      <div className="p-5">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  if (!data || data.items.length === 0) {
    return <p className="text-small text-muted p-5">Nenhum pedido para este evento ainda.</p>
  }
  return (
    <DataTable<Order>
      caption="Pedidos recentes"
      rows={data.items}
      rowKey={(order) => order.id}
      columns={[
        {
          id: 'number',
          header: 'Pedido',
          cell: (order) => <span className="font-mono font-medium">{order.number}</span>,
        },
        { id: 'customer', header: 'Cliente', cell: (order) => order.customerName },
        {
          id: 'date',
          header: 'Data',
          cell: (order) => (
            <span className="whitespace-nowrap">{formatDateTime(order.createdAt)}</span>
          ),
        },
        {
          id: 'total',
          header: 'Valor',
          cell: (order) => <span className="tabular-nums">{formatCurrency(order.total)}</span>,
        },
        {
          id: 'status',
          header: 'Status',
          cell: (order) => <StatusBadge kind="order" status={order.status} />,
        },
      ]}
      mobileCard={(order) => (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-small text-ink font-mono font-medium">{order.number}</span>
            <span className="text-caption text-muted">{order.customerName}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-small font-semibold tabular-nums">
              {formatCurrency(order.total)}
            </span>
            <StatusBadge kind="order" status={order.status} />
          </div>
        </div>
      )}
    />
  )
}

function BatchesTable({ event }: { event: Event }) {
  return (
    <DataTable<TicketBatch>
      caption="Lotes do evento"
      rows={event.batches}
      rowKey={(batch) => batch.id}
      columns={[
        {
          id: 'name',
          header: 'Lote',
          cell: (batch) => <span className="font-medium">{batch.name}</span>,
        },
        {
          id: 'price',
          header: 'Preço',
          cell: (batch) => <span className="tabular-nums">{formatCurrency(batch.price)}</span>,
        },
        {
          id: 'sold',
          header: 'Vendidos',
          cell: (batch) => (
            <div className="flex min-w-36 flex-col gap-1.5">
              <span className="tabular-nums">
                {formatNumber(batch.sold)}{' '}
                <span className="text-muted">/ {formatNumber(batch.quantity)}</span>
              </span>
              <ProgressBar value={batch.sold / batch.quantity} label={`${batch.name}: vendidos`} />
            </div>
          ),
        },
        {
          id: 'remaining',
          header: 'Restantes',
          cell: (batch) => (
            <span className="tabular-nums">{formatNumber(batchRemaining(batch))}</span>
          ),
        },
        {
          id: 'window',
          header: 'Vendas',
          cell: (batch) => (
            <span className="text-muted whitespace-nowrap">
              {formatDate(batch.startsAt)} – {formatDate(batch.endsAt)}
            </span>
          ),
        },
        {
          id: 'revenue',
          header: 'Receita',
          cell: (batch) => (
            <span className="font-medium tabular-nums">
              {formatCurrency(batch.sold * batch.price)}
            </span>
          ),
        },
      ]}
      mobileCard={(batch) => (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-3">
            <span className="text-ink font-medium">{batch.name}</span>
            <span className="tabular-nums">{formatCurrency(batch.price)}</span>
          </div>
          <ProgressBar value={batch.sold / batch.quantity} label={`${batch.name}: vendidos`} />
          <span className="text-caption text-muted">
            {formatNumber(batch.sold)} de {formatNumber(batch.quantity)} vendidos ·{' '}
            {formatCurrency(batch.sold * batch.price)}
          </span>
        </div>
      )}
    />
  )
}

export default function AdminEventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { status, data: event, error, errorStatus, reload } = useEvent(id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  useDocumentTitle(event?.title ?? 'Evento')

  if (status === 'loading') {
    return (
      <LoadingRegion label="Carregando evento" className="flex flex-col gap-6">
        <Skeleton className="rounded-card h-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="rounded-card h-36" />
          ))}
        </div>
        <Skeleton className="rounded-card h-64" />
      </LoadingRegion>
    )
  }

  if (status === 'error' || !event) {
    return errorStatus === 404 ? (
      <EmptyState
        icon={<CalendarX2 />}
        title="Evento não encontrado"
        action={<ButtonLink to={ROUTES.adminEvents}>Voltar para eventos</ButtonLink>}
      />
    ) : (
      <ErrorState message={error} onRetry={reload} />
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await eventsService.deleteEvent(event.id)
      toast.success('Evento excluído com sucesso.', event.title)
      navigate(ROUTES.adminEvents)
    } catch (err) {
      toast.error('Não foi possível excluir o evento.', toErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: 'Eventos', to: ROUTES.adminEvents }, { label: event.title }]} />

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <EventBanner
            src={event.bannerUrl}
            category={event.category}
            width={800}
            className="aspect-[16/9] w-full md:aspect-auto md:w-80"
          />
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind="event" status={event.status} />
              <span className="text-caption text-muted font-semibold tracking-wide uppercase">
                {getCategory(event.category).label}
              </span>
            </div>
            <h1 className="text-h1 text-ink">{event.title}</h1>
            <div className="text-small text-muted flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatLongDate(event.startsAt)} · {formatTime(event.startsAt)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <ButtonLink
                to={ROUTES.adminEventEdit(event.id)}
                leftIcon={<Pencil className="size-4" aria-hidden="true" />}
              >
                Editar
              </ButtonLink>
              <ButtonLink
                to={ROUTES.event(event.id)}
                variant="outline"
                leftIcon={<ExternalLink className="size-4" aria-hidden="true" />}
              >
                Ver página pública
              </ButtonLink>
              <Button
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                onClick={() => setConfirmOpen(true)}
                leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <section
        aria-label="Indicadores do evento"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Ingressos vendidos"
          value={formatNumber(eventTicketsSold(event))}
          icon={<Ticket />}
        />
        <StatCard
          label="Receita"
          value={formatCompactCurrency(eventRevenue(event))}
          icon={<DollarSign />}
        />
        <StatCard
          label="Capacidade"
          value={formatNumber(eventCapacity(event))}
          icon={<CalendarDays />}
        />
        <StatCard
          label="Ocupação"
          value={`${Math.round(eventSoldRatio(event) * 100)}%`}
          icon={<Percent />}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>Lotes de ingressos</CardTitle>
        </CardHeader>
        <div className="border-border border-t">
          <BatchesTable event={event} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>Pedidos recentes</CardTitle>
          <Link
            to={`${ROUTES.adminOrders}?event=${event.id}`}
            className="focus-ring text-small text-primary hover:text-primary-dark rounded font-semibold"
          >
            Ver todos
          </Link>
        </CardHeader>
        <div className="border-border border-t">
          <RecentOrders eventId={event.id} />
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        tone="danger"
        title="Excluir evento?"
        description={
          <>
            O evento <strong className="text-ink">{event.title}</strong> será removido
            permanentemente.
          </>
        }
        confirmLabel="Excluir evento"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
