import { CalendarPlus, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { EventBanner } from '@/components/events/EventBanner'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ButtonLink,
  Card,
  type Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingRegion,
  Pagination,
  ProgressBar,
  SearchBar,
  Select,
  Skeleton,
  StatusBadge,
  useToast,
} from '@/components/ui'
import { ADMIN_PAGE_SIZE } from '@/constants/filters'
import { ROUTES } from '@/constants/routes'
import { EVENT_STATUS } from '@/constants/status'
import { useEvents } from '@/features/events/hooks'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { eventsService } from '@/services'
import type { Event, EventStatus } from '@/types'
import { cn } from '@/utils/cn'
import { toErrorMessage } from '@/utils/errors'
import { eventCapacity, eventRevenue, eventSoldRatio, eventTicketsSold } from '@/utils/event'
import { formatCurrency, formatDate, formatNumber, formatTime } from '@/utils/format'

const STATUS_OPTIONS = (Object.keys(EVENT_STATUS) as EventStatus[]).map((status) => ({
  value: status,
  label: EVENT_STATUS[status].label,
}))

function RowActions({ event, onDelete }: { event: Event; onDelete: (event: Event) => void }) {
  const actionClass =
    'focus-ring inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-100 hover:text-ink'
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={ROUTES.adminEvent(event.id)}
        className={actionClass}
        aria-label={`Visualizar ${event.title}`}
        title="Visualizar"
      >
        <Eye className="size-4" aria-hidden="true" />
      </Link>
      <Link
        to={ROUTES.adminEventEdit(event.id)}
        className={actionClass}
        aria-label={`Editar ${event.title}`}
        title="Editar"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(event)}
        className={cn(actionClass, 'hover:bg-danger-soft hover:text-danger')}
        aria-label={`Excluir ${event.title}`}
        title="Excluir"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function SalesCell({ event }: { event: Event }) {
  const ratio = eventSoldRatio(event)
  return (
    <div className="flex min-w-32 flex-col gap-1.5">
      <span className="text-small text-ink font-medium tabular-nums">
        {formatNumber(eventTicketsSold(event))}
        <span className="text-muted"> / {formatNumber(eventCapacity(event))}</span>
      </span>
      <ProgressBar
        value={ratio}
        label={`${Math.round(ratio * 100)}% vendido`}
        tone={ratio >= 0.9 ? 'warning' : 'primary'}
      />
    </div>
  )
}

export default function AdminEventsPage() {
  useDocumentTitle('Eventos')
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const debouncedSearch = useDebouncedValue(search, 300)
  const statusFilter = (params.get('status') as EventStatus | null) ?? undefined
  const page = Number(params.get('page')) || 1

  const events = useEvents({
    status: statusFilter ?? 'all',
    search: debouncedSearch || undefined,
    sort: 'date',
    page,
    pageSize: ADMIN_PAGE_SIZE,
  })

  const [toDelete, setToDelete] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  const setParam = (key: string, value: string | null) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await eventsService.deleteEvent(toDelete.id)
      toast.success('Evento excluído com sucesso.', toDelete.title)
      setToDelete(null)
      events.reload()
    } catch (err) {
      toast.error('Não foi possível excluir o evento.', toErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const columns: Column<Event>[] = [
    {
      id: 'event',
      header: 'Evento',
      cell: (event) => (
        <div className="flex min-w-60 items-center gap-3">
          <EventBanner
            src={event.bannerUrl}
            category={event.category}
            width={120}
            className="size-11 shrink-0 rounded-lg"
          />
          <Link
            to={ROUTES.adminEvent(event.id)}
            className="focus-ring text-ink hover:text-primary-dark rounded font-semibold"
          >
            {event.title}
          </Link>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Data',
      cell: (event) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="text-ink">{formatDate(event.startsAt)}</span>
          <span className="text-caption text-muted">{formatTime(event.startsAt)}</span>
        </div>
      ),
    },
    {
      id: 'venue',
      header: 'Local',
      cell: (event) => (
        <div className="flex max-w-48 flex-col">
          <span className="text-ink truncate">{event.venue.name}</span>
          <span className="text-caption text-muted">
            {event.venue.city}, {event.venue.state}
          </span>
        </div>
      ),
    },
    { id: 'tickets', header: 'Ingressos', cell: (event) => <SalesCell event={event} /> },
    {
      id: 'revenue',
      header: 'Vendas',
      cell: (event) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {formatCurrency(eventRevenue(event))}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (event) => <StatusBadge kind="event" status={event.status} />,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Ações</span>,
      headerClassName: 'text-right',
      cell: (event) => <RowActions event={event} onDelete={setToDelete} />,
    },
  ]

  const data = events.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Eventos"
        description="Crie, edite e acompanhe as vendas dos seus eventos."
        actions={
          <ButtonLink
            to={ROUTES.adminEventNew}
            leftIcon={<Plus className="size-4" aria-hidden="true" />}
          >
            Novo evento
          </ButtonLink>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, local ou cidade..."
            label="Buscar eventos"
            className="sm:max-w-sm sm:flex-1"
          />
          <Select
            aria-label="Filtrar por status"
            placeholder="Todos os status"
            value={statusFilter ?? ''}
            onChange={(event) => setParam('status', event.target.value || null)}
            options={STATUS_OPTIONS}
            containerClassName="sm:w-48"
          />
        </div>

        {events.status === 'loading' && !data && (
          <LoadingRegion label="Carregando eventos" className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </LoadingRegion>
        )}
        {events.status === 'error' && (
          <div className="p-4">
            <ErrorState message={events.error} onRetry={events.reload} />
          </div>
        )}
        {data &&
          events.status !== 'error' &&
          (data.items.length > 0 ? (
            <div className={cn('transition-opacity', events.status === 'loading' && 'opacity-60')}>
              <DataTable
                caption="Lista de eventos"
                rows={data.items}
                columns={columns}
                rowKey={(event) => event.id}
                mobileCard={(event) => (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <EventBanner
                        src={event.bannerUrl}
                        category={event.category}
                        width={120}
                        className="size-12 shrink-0 rounded-lg"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <Link
                          to={ROUTES.adminEvent(event.id)}
                          className="focus-ring text-ink truncate rounded font-semibold"
                        >
                          {event.title}
                        </Link>
                        <span className="text-caption text-muted">
                          {formatDate(event.startsAt)} · {event.venue.city}
                        </span>
                      </div>
                      <StatusBadge kind="event" status={event.status} />
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <SalesCell event={event} />
                      <RowActions event={event} onDelete={setToDelete} />
                    </div>
                  </div>
                )}
              />
              <div className="border-border border-t p-4">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  total={data.total}
                  pageSize={data.pageSize}
                  onChange={(next) => setParam('page', String(next))}
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={<CalendarPlus />}
                title="Nenhum evento encontrado"
                description={
                  search || statusFilter
                    ? 'Ajuste a busca ou os filtros.'
                    : 'Crie seu primeiro evento e comece a vender.'
                }
                action={<ButtonLink to={ROUTES.adminEventNew}>Criar evento</ButtonLink>}
              />
            </div>
          ))}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        tone="danger"
        title="Excluir evento?"
        description={
          <>
            <strong className="text-ink">{toDelete?.title}</strong> será removido permanentemente.
            Pedidos já realizados continuam registrados. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir evento"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}
