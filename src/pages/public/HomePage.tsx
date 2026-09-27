import { ArrowRight, CalendarSearch, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CategoryCard } from '@/components/events/CategoryCard'
import { EventBanner } from '@/components/events/EventBanner'
import { EventDateBadge } from '@/components/events/EventDateBadge'
import { EventGrid, EventGridSkeleton } from '@/components/events/EventGrid'
import {
  ButtonLink,
  EmptyState,
  ErrorState,
  LoadingRegion,
  PriceDisplay,
  SearchBar,
  Skeleton,
} from '@/components/ui'
import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useEvents } from '@/features/events/hooks'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Event } from '@/types'
import { eventMinPrice } from '@/utils/event'
import { formatTime, formatWeekday } from '@/utils/format'

const POPULAR_SEARCHES = ['Rock', 'Tecnologia', 'Jazz', 'Fortaleza']

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'Compra protegida',
    text: 'Pagamento seguro e reembolso garantido se o evento for cancelado.',
  },
  {
    icon: Smartphone,
    title: 'Ingresso no celular',
    text: 'QR code disponível no app e no e-mail logo após a compra.',
  },
  {
    icon: Zap,
    title: 'Checkout em 1 minuto',
    text: 'Cartão ou PIX, sem cadastro complicado e sem filas.',
  },
]

function SectionHeader({
  id,
  title,
  description,
  link,
}: {
  id: string
  title: string
  description: string
  link?: { to: string; label: string }
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h2 id={id} className="text-h2 text-ink">
          {title}
        </h2>
        <p className="text-body text-muted">{description}</p>
      </div>
      {link && (
        <Link
          to={link.to}
          className="focus-ring text-small text-primary hover:text-primary-dark inline-flex shrink-0 items-center gap-1.5 rounded font-semibold"
        >
          {link.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function Hero() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const goSearch = (term: string) =>
    navigate(term ? `${ROUTES.events}?search=${encodeURIComponent(term)}` : ROUTES.events)

  return (
    <section className="bg-night relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-primary/30 absolute -top-40 left-1/2 size-[48rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:24px_24px]" />
      </div>

      <div className="container-page flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <span className="text-caption text-primary-light inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-semibold">
          <span className="bg-primary-light size-1.5 rounded-full" aria-hidden="true" />
          Mais de 1.200 eventos em todo o Brasil
        </span>
        <div className="flex max-w-3xl flex-col gap-5">
          <h1 className="text-display text-white">
            Encontre seu <span className="text-primary-light">próximo evento.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl">
            Descubra experiências incríveis, reserve seu ingresso e viva momentos inesquecíveis.
          </p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-4">
          <SearchBar
            size="lg"
            value={search}
            onChange={setSearch}
            onSubmit={goSearch}
            submitLabel="Buscar"
          />
          <div className="text-small flex flex-wrap items-center justify-center gap-2 text-slate-400">
            <span>Populares:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => goSearch(term)}
                className="focus-ring rounded-full border border-white/15 px-3 py-1 text-slate-200 transition-colors hover:border-white/40 hover:bg-white/5"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <ButtonLink
          to={ROUTES.events}
          variant="ghost"
          size="lg"
          className="text-white hover:bg-white/10"
          rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
        >
          Explorar eventos
        </ButtonLink>
      </div>
    </section>
  )
}

function UpcomingRow({ event }: { event: Event }) {
  return (
    <li>
      <Link
        to={ROUTES.event(event.id)}
        className="group focus-ring rounded-card border-border bg-surface hover:shadow-elevated flex items-center gap-4 border p-3 transition-[box-shadow,border-color] hover:border-slate-300"
      >
        <div className="relative shrink-0">
          <EventBanner
            src={event.bannerUrl}
            category={event.category}
            width={240}
            className="size-20 rounded-xl sm:size-24"
          />
          <EventDateBadge
            date={event.startsAt}
            className="absolute -bottom-2 -left-2 w-11 scale-90"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-h4 text-ink group-hover:text-primary-dark truncate">{event.title}</h3>
          <p className="text-small text-muted truncate">
            {formatWeekday(event.startsAt)} · {formatTime(event.startsAt)} · {event.venue.city}
          </p>
          <PriceDisplay
            value={eventMinPrice(event)}
            size="sm"
            prefix="A partir de"
            className="mt-1"
          />
        </div>
        <ArrowRight
          className="text-muted group-hover:text-primary mr-2 hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}

function FeaturedSection() {
  const { status, data, error, reload } = useEvents({ featured: true, pageSize: 6 })
  return (
    <section className="container-page flex flex-col gap-8 py-16" aria-labelledby="featured-title">
      <SectionHeader
        id="featured-title"
        title="Eventos em destaque"
        description="Selecionados pela nossa curadoria para você não ficar de fora."
        link={{ to: ROUTES.events, label: 'Ver todos os eventos' }}
      />
      {status === 'loading' && <EventGridSkeleton count={3} />}
      {status === 'error' && <ErrorState message={error} onRetry={reload} />}
      {status === 'success' &&
        data &&
        (data.items.length > 0 ? (
          <EventGrid events={data.items.slice(0, 6)} />
        ) : (
          <EmptyState
            icon={<CalendarSearch />}
            title="Nenhum destaque no momento"
            description="Volte em breve para conferir as novidades."
          />
        ))}
    </section>
  )
}

function UpcomingSection() {
  const { status, data, error, reload } = useEvents({ sort: 'date', pageSize: 6 })
  return (
    <section className="bg-surface py-16" aria-labelledby="upcoming-title">
      <div className="container-page flex flex-col gap-8">
        <SectionHeader
          id="upcoming-title"
          title="Próximos eventos"
          description="O que está chegando nas próximas semanas."
          link={{ to: `${ROUTES.events}?sort=date`, label: 'Ver agenda completa' }}
        />
        {status === 'loading' && (
          <LoadingRegion label="Carregando próximos eventos" className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="rounded-card h-28" />
            ))}
          </LoadingRegion>
        )}
        {status === 'error' && <ErrorState message={error} onRetry={reload} />}
        {status === 'success' && data && (
          <ul className="grid gap-4 lg:grid-cols-2">
            {data.items.map((event) => (
              <UpcomingRow key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  useDocumentTitle()

  return (
    <>
      <Hero />

      <section
        className="container-page flex flex-col gap-8 pt-16"
        aria-labelledby="categories-title"
      >
        <div className="flex flex-col gap-1.5">
          <h2 id="categories-title" className="text-h2 text-ink">
            Navegue por categoria
          </h2>
          <p className="text-body text-muted">
            Do show ao meetup, encontre o que combina com você.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </section>

      <FeaturedSection />
      <UpcomingSection />

      <section className="container-page py-16" aria-label="Por que comprar com a gente">
        <ul className="grid gap-6 md:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span
                className="bg-primary-50 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl"
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-h4 text-ink">{title}</h3>
                <p className="text-small text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-20">
        <div className="from-primary to-primary-dark relative isolate overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="bg-night/20 absolute -bottom-24 -left-16 -z-10 size-72 rounded-full blur-2xl"
          />
          <h2 className="text-h1 text-white">Seu próximo evento está aqui.</h2>
          <p className="text-body mx-auto mt-3 max-w-xl text-white/80">
            Shows, festivais, conferências e experiências gastronômicas — tudo em um só lugar.
          </p>
          <ButtonLink
            to={ROUTES.events}
            variant="outline"
            size="lg"
            className="text-primary-dark mt-8 border-transparent hover:bg-white/90"
            rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}
          >
            Explorar eventos
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
