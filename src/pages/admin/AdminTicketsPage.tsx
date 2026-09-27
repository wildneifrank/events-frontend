import { Ticket as TicketIcon } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  type Column,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingRegion,
  Pagination,
  SearchBar,
  Select,
  Skeleton,
  StatusBadge,
} from '@/components/ui'
import { ADMIN_PAGE_SIZE } from '@/constants/filters'
import { TICKET_STATUS } from '@/constants/status'
import { useAllTickets } from '@/features/tickets/hooks'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Ticket, TicketStatus } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

const STATUS_OPTIONS = (Object.keys(TICKET_STATUS) as TicketStatus[]).map((status) => ({
  value: status,
  label: TICKET_STATUS[status].label,
}))

const COLUMNS: Column<Ticket>[] = [
  {
    id: 'code',
    header: 'Ingresso',
    cell: (ticket) => (
      <span className="font-mono font-semibold whitespace-nowrap">{ticket.code}</span>
    ),
  },
  {
    id: 'holder',
    header: 'Titular',
    cell: (ticket) => (
      <div className="flex min-w-44 flex-col">
        <span className="font-medium">{ticket.holderName}</span>
        <span className="text-caption text-muted">{ticket.holderEmail}</span>
      </div>
    ),
  },
  {
    id: 'event',
    header: 'Evento',
    cell: (ticket) => (
      <div className="flex min-w-44 flex-col">
        <span className="line-clamp-1">{ticket.eventTitle}</span>
        <span className="text-caption text-muted">{formatDate(ticket.eventStartsAt)}</span>
      </div>
    ),
  },
  { id: 'batch', header: 'Tipo', cell: (ticket) => ticket.batchName },
  {
    id: 'price',
    header: 'Valor',
    cell: (ticket) => <span className="tabular-nums">{formatCurrency(ticket.price)}</span>,
  },
  {
    id: 'issued',
    header: 'Emitido em',
    cell: (ticket) => <span className="whitespace-nowrap">{formatDateTime(ticket.issuedAt)}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (ticket) => <StatusBadge kind="ticket" status={ticket.status} />,
  },
]

export default function AdminTicketsPage() {
  useDocumentTitle('Ingressos')
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const status = (params.get('status') as TicketStatus | null) ?? undefined
  const page = Number(params.get('page')) || 1

  const tickets = useAllTickets({
    status: status ?? 'all',
    search: debouncedSearch || undefined,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  })
  const data = tickets.data

  const setParam = (key: string, value: string | null) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ingressos"
        description="Todos os ingressos emitidos, com status de validação."
      />

      <Card className="overflow-hidden">
        <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Código, titular ou evento..."
            label="Buscar ingressos"
            className="sm:max-w-sm sm:flex-1"
          />
          <Select
            aria-label="Filtrar por status"
            placeholder="Todos os status"
            value={status ?? ''}
            onChange={(event) => setParam('status', event.target.value || null)}
            options={STATUS_OPTIONS}
            containerClassName="sm:w-52"
          />
        </div>

        {tickets.status === 'loading' && !data && (
          <LoadingRegion label="Carregando ingressos" className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </LoadingRegion>
        )}
        {tickets.status === 'error' && (
          <div className="p-4">
            <ErrorState message={tickets.error} onRetry={tickets.reload} />
          </div>
        )}
        {data &&
          tickets.status !== 'error' &&
          (data.items.length > 0 ? (
            <div className={cn('transition-opacity', tickets.status === 'loading' && 'opacity-60')}>
              <DataTable
                caption="Lista de ingressos"
                rows={data.items}
                columns={COLUMNS}
                rowKey={(ticket) => ticket.id}
                mobileCard={(ticket) => (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-small font-mono font-semibold">{ticket.code}</span>
                      <StatusBadge kind="ticket" status={ticket.status} />
                    </div>
                    <span className="text-small text-ink">{ticket.holderName}</span>
                    <span className="text-caption text-muted truncate">
                      {ticket.eventTitle} · {ticket.batchName}
                    </span>
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
                icon={<TicketIcon />}
                title="Nenhum ingresso encontrado"
                description="Ajuste a busca ou os filtros."
              />
            </div>
          ))}
      </Card>
    </div>
  )
}
