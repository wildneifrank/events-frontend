import { BadgeCheck, CalendarDays, CalendarX2, Clock, MapPin, Share2, Ticket } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { BatchSelector } from '@/components/events/BatchSelector'
import { EventBanner } from '@/components/events/EventBanner'
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  LoadingRegion,
  Skeleton,
  SkeletonText,
  useToast,
} from '@/components/ui'
import { getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { resolveSelection, type Selection, serializeSelection } from '@/features/checkout/selection'
import { useEvent } from '@/features/events/hooks'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Event } from '@/types'
import { eventRemaining, isEventPast } from '@/utils/event'
import { formatCurrency, formatLongDate, formatNumber, formatTime, pluralize } from '@/utils/format'

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span
        className="bg-primary-50 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-caption text-muted font-semibold tracking-wide uppercase">{title}</dt>
        <dd className="text-body text-ink">{children}</dd>
      </div>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <LoadingRegion label="Carregando evento">
      <Skeleton className="h-72 rounded-none sm:h-96" />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <SkeletonText lines={6} />
        </div>
        <Skeleton className="rounded-card h-96" />
      </div>
    </LoadingRegion>
  )
}

function PurchasePanel({ event }: { event: Event }) {
  const [selection, setSelection] = useState<Selection>({})
  const navigate = useNavigate()
  const toast = useToast()
  const summary = resolveSelection(event, selection)
  const salesClosed = event.status !== 'published' || isEventPast(event)
  const soldOut = eventRemaining(event) === 0

  const proceed = () => {
    toast.success(
      'Ingresso adicionado ao pedido.',
      `${pluralize(summary.quantity, 'ingresso', 'ingressos')} · ${formatCurrency(summary.total)}`,
    )
    navigate(`${ROUTES.checkout(event.id)}?items=${serializeSelection(selection)}`)
  }

  if (salesClosed || soldOut) {
    return (
      <Card padded>
        <EmptyState
          compact
          className="border-none p-0"
          icon={<CalendarX2 />}
          title={soldOut ? 'Ingressos esgotados' : 'Vendas encerradas'}
          description="Explore outros eventos parecidos com este."
          action={<ButtonLink to={ROUTES.events}>Ver outros eventos</ButtonLink>}
        />
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-border flex items-center gap-2 border-b px-5 py-4">
          <Ticket className="text-primary size-5" aria-hidden="true" />
          <h2 className="text-h4 text-ink">Ingressos</h2>
          <span className="text-caption text-muted ml-auto">Máx. 10 por pedido</span>
        </div>
        <div className="p-4 sm:p-5">
          <BatchSelector batches={event.batches} selection={selection} onChange={setSelection} />
        </div>
        <div
          className="border-border flex flex-col gap-2 border-t bg-slate-50/60 px-5 py-4"
          aria-live="polite"
        >
          <h3 className="sr-only">Resumo da compra</h3>
          {summary.quantity === 0 ? (
            <p className="text-small text-muted">
              Selecione a quantidade de ingressos para continuar.
            </p>
          ) : (
            <dl className="text-small flex flex-col gap-1.5">
              <div className="text-muted flex justify-between">
                <dt>{pluralize(summary.quantity, 'ingresso', 'ingressos')}</dt>
                <dd className="tabular-nums">{formatCurrency(summary.subtotal)}</dd>
              </div>
              <div className="text-muted flex justify-between">
                <dt>Taxa de serviço</dt>
                <dd className="tabular-nums">{formatCurrency(summary.fee)}</dd>
              </div>
              <div className="text-body text-ink flex justify-between font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(summary.total)}</dd>
              </div>
            </dl>
          )}
          <Button
            size="lg"
            fullWidth
            disabled={summary.quantity === 0}
            onClick={proceed}
            className="mt-2 max-lg:hidden"
          >
            Continuar para compra
          </Button>
        </div>
      </Card>

      <div className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-20 border-t p-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-caption text-muted">
              {summary.quantity > 0
                ? pluralize(summary.quantity, 'ingresso', 'ingressos')
                : 'Nenhum ingresso'}
            </span>
            <span className="text-h4 text-ink tabular-nums">{formatCurrency(summary.total)}</span>
          </div>
          <Button size="lg" disabled={summary.quantity === 0} onClick={proceed}>
            Continuar para compra
          </Button>
        </div>
      </div>
    </>
  )
}

export default function EventDetailsPage() {
  const { id } = useParams()
  const { status, data: event, error, errorStatus, reload } = useEvent(id)
  const toast = useToast()
  useDocumentTitle(event?.title ?? 'Evento')

  if (status === 'loading') return <DetailsSkeleton />
  if (status === 'error' || !event) {
    return (
      <div className="container-page py-16">
        {errorStatus === 404 ? (
          <EmptyState
            icon={<CalendarX2 />}
            title="Evento não encontrado"
            description="Ele pode ter sido removido ou o link está incorreto."
            action={<ButtonLink to={ROUTES.events}>Explorar eventos</ButtonLink>}
          />
        ) : (
          <ErrorState message={error} onRetry={reload} />
        )}
      </div>
    )
  }

  const category = getCategory(event.category)
  const remaining = eventRemaining(event)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: event.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado!', 'Compartilhe com seus amigos.')
      }
    } catch {
      return
    }
  }

  return (
    <div className="pb-28 lg:pb-0">
      <section className="bg-night relative isolate overflow-hidden">
        <EventBanner
          src={event.bannerUrl}
          category={event.category}
          alt=""
          className="absolute inset-0 -z-20 size-full opacity-60"
          width={1600}
        />
        <div
          className="from-night via-night/70 to-night/20 absolute inset-0 -z-10 bg-gradient-to-t"
          aria-hidden="true"
        />
        <div className="container-page flex min-h-[22rem] flex-col justify-end gap-5 pt-8 pb-10 sm:min-h-[26rem]">
          <Breadcrumb
            className="[&_a]:text-slate-300 [&_a:hover]:text-white [&_li]:text-slate-400 [&_span[aria-current]]:text-white"
            items={[
              { label: 'Início', to: ROUTES.home },
              { label: 'Eventos', to: ROUTES.events },
              { label: event.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass">{category.label}</Badge>
            {event.featured && (
              <Badge tone="primary" variant="solid">
                Destaque
              </Badge>
            )}
            {remaining > 0 && remaining < 200 && (
              <Badge tone="warning" variant="solid">
                Últimos {formatNumber(remaining)} ingressos
              </Badge>
            )}
          </div>
          <h1 className="text-display max-w-3xl text-white">{event.title}</h1>
          <p className="max-w-2xl text-lg text-slate-300">{event.summary}</p>
          <div className="text-small flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-200">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatLongDate(event.startsAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden="true" />
              {formatTime(event.startsAt)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-10">
          {event.status === 'draft' && (
            <Alert tone="warning" title="Pré-visualização">
              Este evento ainda é um rascunho e não está visível para o público.
            </Alert>
          )}

          <Card padded>
            <dl className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={<CalendarDays />} title="Data">
                {formatLongDate(event.startsAt)}
              </InfoRow>
              <InfoRow icon={<Clock />} title="Horário">
                {formatTime(event.startsAt)} às {formatTime(event.endsAt)}
              </InfoRow>
              <InfoRow icon={<MapPin />} title="Local">
                <span className="block font-medium">{event.venue.name}</span>
                <span className="text-small text-muted block">
                  {event.venue.address} · {event.venue.city}, {event.venue.state}
                </span>
              </InfoRow>
              <InfoRow icon={<Ticket />} title="Disponibilidade">
                {remaining > 0 ? `${formatNumber(remaining)} ingressos disponíveis` : 'Esgotado'}
              </InfoRow>
            </dl>
          </Card>

          <section aria-labelledby="about-title" className="flex flex-col gap-4">
            <h2 id="about-title" className="text-h2 text-ink">
              Sobre o evento
            </h2>
            {event.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-body text-slate-600">
                {paragraph}
              </p>
            ))}
            {event.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-2" aria-label="Tags">
                {event.tags.map((tag) => (
                  <li key={tag}>
                    <Badge size="md">#{tag}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="organizer-title" className="flex flex-col gap-4">
            <h2 id="organizer-title" className="text-h3 text-ink">
              Organizador
            </h2>
            <Card padded className="flex flex-wrap items-center gap-4">
              <Avatar name={event.organizer.name} size="lg" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-h4 text-ink flex items-center gap-1.5">
                  {event.organizer.name}
                  {event.organizer.verified && (
                    <BadgeCheck
                      className="text-primary size-5"
                      aria-label="Organizador verificado"
                    />
                  )}
                </p>
                <p className="text-small text-muted">
                  {pluralize(event.organizer.eventsCount, 'evento realizado', 'eventos realizados')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={share}
                leftIcon={<Share2 className="size-4" aria-hidden="true" />}
              >
                Compartilhar
              </Button>
            </Card>
          </section>
        </div>

        <aside className="max-lg:order-first lg:sticky lg:top-24" aria-label="Compra de ingressos">
          <PurchasePanel event={event} />
        </aside>
      </div>
    </div>
  )
}
