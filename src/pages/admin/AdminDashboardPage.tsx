import { CalendarCheck, DollarSign, Plus, Receipt, Ticket } from 'lucide-react'

import { RankedBars } from '@/components/dashboard/RankedBars'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingRegion,
  Skeleton,
} from '@/components/ui'
import { getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useDashboardStats } from '@/features/admin/hooks'
import { useAuth } from '@/features/authentication/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from '@/utils/format'

function DashboardSkeleton() {
  return (
    <LoadingRegion label="Carregando indicadores" className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="rounded-card h-96" />
        <Skeleton className="rounded-card h-96" />
      </div>
    </LoadingRegion>
  )
}

export default function AdminDashboardPage() {
  useDocumentTitle('Painel')
  const { user } = useAuth()
  const { status, data: stats, error, reload } = useDashboardStats()

  const header = (
    <PageHeader
      title={`Olá, ${user?.name.split(' ')[0] ?? 'produtor'}`}
      description="Acompanhe vendas, eventos e pedidos em tempo real."
      actions={
        <ButtonLink
          to={ROUTES.adminEventNew}
          leftIcon={<Plus className="size-4" aria-hidden="true" />}
        >
          Novo evento
        </ButtonLink>
      }
    />
  )

  if (status === 'loading' && !stats)
    return (
      <div className="flex flex-col gap-8">
        {header}
        <DashboardSkeleton />
      </div>
    )
  if (status === 'error' || !stats) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <ErrorState title="Não foi possível carregar o painel" message={error} onRetry={reload} />
      </div>
    )
  }

  const categoryTotal = stats.categoryDistribution.reduce((sum, item) => sum + item.tickets, 0) || 1
  const weekRevenue = stats.salesLast7Days.reduce((sum, day) => sum + day.revenue, 0)

  return (
    <div className="flex flex-col gap-8">
      {header}

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Eventos ativos"
          value={formatNumber(stats.activeEvents.value)}
          change={stats.activeEvents.change}
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Ingressos vendidos"
          value={formatNumber(stats.ticketsSold.value)}
          change={stats.ticketsSold.change}
          icon={<Ticket />}
        />
        <StatCard
          label="Receita"
          value={formatCompactCurrency(stats.revenue.value)}
          change={stats.revenue.change}
          icon={<DollarSign />}
        />
        <StatCard
          label="Pedidos"
          value={formatNumber(stats.orders.value)}
          change={stats.orders.change}
          icon={<Receipt />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Vendas nos últimos 7 dias</CardTitle>
              <CardDescription>{formatCurrency(weekRevenue)} em receita no período</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <SalesChart data={stats.salesLast7Days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distribuição por categoria</CardTitle>
              <CardDescription>Participação no total de ingressos vendidos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RankedBars
              caption="Ingressos vendidos por categoria"
              items={stats.categoryDistribution.map((item) => {
                const category = getCategory(item.category)
                const Icon = category.icon
                return {
                  id: item.category,
                  label: category.label,
                  value: item.tickets,
                  display: formatPercent(item.tickets / categoryTotal).replace('+', ''),
                  detail: `${formatNumber(item.tickets)} ingressos`,
                  icon: <Icon />,
                }
              })}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Eventos mais vendidos</CardTitle>
            <CardDescription>Próximos eventos com maior volume de ingressos</CardDescription>
          </div>
          <ButtonLink to={ROUTES.adminEvents} variant="ghost" size="sm">
            Ver todos
          </ButtonLink>
        </CardHeader>
        <CardContent>
          <RankedBars
            caption="Eventos mais vendidos"
            items={stats.topEvents.map((event) => ({
              id: event.eventId,
              label: event.title,
              value: event.ticketsSold,
              display: `${formatNumber(event.ticketsSold)} ingressos`,
              detail: `${formatCurrency(event.revenue)} em receita`,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
