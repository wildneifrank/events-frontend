import { Receipt } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  type Column,
  DataTable,
  DatePicker,
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
import { ORDER_STATUS } from '@/constants/status'
import { useOrders } from '@/features/admin/hooks'
import { useEvents } from '@/features/events/hooks'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Order, OrderStatus } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate, formatTime } from '@/utils/format'

const STATUS_OPTIONS = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((status) => ({
  value: status,
  label: ORDER_STATUS[status].label,
}))

const quantityOf = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0)

const COLUMNS: Column<Order>[] = [
  {
    id: 'number',
    header: 'Pedido',
    cell: (order) => <span className="font-mono font-semibold">{order.number}</span>,
  },
  {
    id: 'customer',
    header: 'Cliente',
    cell: (order) => (
      <div className="flex min-w-44 flex-col">
        <span className="text-ink font-medium">{order.customerName}</span>
        <span className="text-caption text-muted">{order.customerEmail}</span>
      </div>
    ),
  },
  {
    id: 'event',
    header: 'Evento',
    cell: (order) => <span className="line-clamp-1 min-w-40">{order.eventTitle}</span>,
  },
  {
    id: 'date',
    header: 'Data',
    cell: (order) => (
      <div className="flex flex-col whitespace-nowrap">
        <span>{formatDate(order.createdAt)}</span>
        <span className="text-caption text-muted">{formatTime(order.createdAt)}</span>
      </div>
    ),
  },
  {
    id: 'quantity',
    header: 'Qtd.',
    headerClassName: 'text-right',
    className: 'text-right tabular-nums',
    cell: quantityOf,
  },
  {
    id: 'total',
    header: 'Valor',
    headerClassName: 'text-right',
    className: 'text-right',
    cell: (order) => (
      <span className="font-semibold whitespace-nowrap tabular-nums">
        {formatCurrency(order.total)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (order) => <StatusBadge kind="order" status={order.status} />,
  },
]

export default function AdminOrdersPage() {
  useDocumentTitle('Pedidos')
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const eventId = params.get('event') ?? undefined
  const from = params.get('from') ?? undefined
  const page = Number(params.get('page')) || 1

  const orders = useOrders({
    status: status ?? 'all',
    eventId,
    from,
    search: debouncedSearch || undefined,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  })
  const events = useEvents({ status: 'all', pageSize: 100, sort: 'date' })

  const setParam = (key: string, value: string | null) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })

  const data = orders.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pedidos"
        description="Acompanhe todas as compras realizadas na plataforma."
      />

      <Card className="overflow-visible">
        <div className="border-border grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Pedido, cliente ou e-mail..."
            label="Buscar pedidos"
          />
          <Select
            aria-label="Filtrar por status"
            placeholder="Todos os status"
            value={status ?? ''}
            onChange={(event) => setParam('status', event.target.value || null)}
            options={STATUS_OPTIONS}
          />
          <Select
            aria-label="Filtrar por evento"
            placeholder="Todos os eventos"
            value={eventId ?? ''}
            onChange={(event) => setParam('event', event.target.value || null)}
            options={(events.data?.items ?? []).map((event) => ({
              value: event.id,
              label: event.title,
            }))}
          />
          <DatePicker
            value={from ?? null}
            onChange={(value) => setParam('from', value)}
            placeholder="A partir de qualquer data"
          />
        </div>

        {orders.status === 'loading' && !data && (
          <LoadingRegion label="Carregando pedidos" className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </LoadingRegion>
        )}
        {orders.status === 'error' && (
          <div className="p-4">
            <ErrorState message={orders.error} onRetry={orders.reload} />
          </div>
        )}
        {data &&
          orders.status !== 'error' &&
          (data.items.length > 0 ? (
            <div className={cn('transition-opacity', orders.status === 'loading' && 'opacity-60')}>
              <DataTable
                caption="Lista de pedidos"
                rows={data.items}
                columns={COLUMNS}
                rowKey={(order) => order.id}
                mobileCard={(order) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-small text-ink font-mono font-semibold">
                          {order.number}
                        </span>
                        <span className="text-small text-ink truncate">{order.customerName}</span>
                      </div>
                      <StatusBadge kind="order" status={order.status} />
                    </div>
                    <p className="text-caption text-muted truncate">{order.eventTitle}</p>
                    <div className="text-small flex justify-between">
                      <span className="text-muted">
                        {formatDate(order.createdAt)} · {quantityOf(order)} ingresso(s)
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(order.total)}
                      </span>
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
                icon={<Receipt />}
                title="Nenhum pedido encontrado"
                description="Ajuste os filtros para ver outros pedidos."
              />
            </div>
          ))}
      </Card>
    </div>
  )
}
