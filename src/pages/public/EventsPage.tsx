import { CalendarSearch, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EventGrid, EventGridSkeleton } from '@/components/events/EventGrid'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Button,
  DatePicker,
  EmptyState,
  ErrorState,
  Pagination,
  SearchBar,
  Select,
} from '@/components/ui'
import { CATEGORIES, getCategory } from '@/constants/categories'
import { EVENTS_PAGE_SIZE, PRICE_RANGES, SORT_OPTIONS } from '@/constants/filters'
import { useEventCities, useEvents } from '@/features/events/hooks'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { EventCategory, EventQuery, EventSort, PriceRange } from '@/types'
import { cn } from '@/utils/cn'
import { pluralize } from '@/utils/format'

const FILTER_KEYS = ['category', 'city', 'from', 'price'] as const

function readQuery(params: URLSearchParams): EventQuery {
  return {
    search: params.get('search') ?? undefined,
    category: (params.get('category') as EventCategory | null) ?? undefined,
    city: params.get('city') ?? undefined,
    from: params.get('from') ?? undefined,
    priceRange: (params.get('price') as PriceRange | null) ?? undefined,
    sort: (params.get('sort') as EventSort | null) ?? 'relevance',
    page: Number(params.get('page')) || 1,
    pageSize: EVENTS_PAGE_SIZE,
  }
}

export default function EventsPage() {
  useDocumentTitle('Explore eventos')
  const [params, setParams] = useSearchParams()
  const query = readQuery(params)
  const [search, setSearch] = useState(query.search ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 350)

  const events = useEvents(query)
  const cities = useEventCities()

  const update = (changes: Record<string, string | null>, keepPage = false) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        if (!keepPage) next.delete('page')
        return next
      },
      { replace: !keepPage },
    )
  }

  useEffect(() => {
    const term = debouncedSearch.trim()
    setParams(
      (previous) => {
        if ((previous.get('search') ?? '') === term) return previous
        const next = new URLSearchParams(previous)
        if (term) next.set('search', term)
        else next.delete('search')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, setParams])

  const activeFilters = [
    query.category && { key: 'category', label: getCategory(query.category).label },
    query.city && { key: 'city', label: query.city },
    query.from && {
      key: 'from',
      label: `A partir de ${query.from.split('-').reverse().join('/')}`,
    },
    query.priceRange && {
      key: 'price',
      label: PRICE_RANGES.find((range) => range.value === query.priceRange)?.label ?? '',
    },
  ].filter((item): item is { key: string; label: string } => Boolean(item))

  const clearAll = () => {
    setSearch('')
    update(Object.fromEntries([...FILTER_KEYS, 'search'].map((key) => [key, null])))
  }

  const changePage = (page: number) => {
    update({ page: String(page) }, true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const data = events.data

  return (
    <div className="container-page flex flex-col gap-8 py-10 sm:py-12">
      <PageHeader
        title="Explore eventos"
        description="Shows, festivais, esportes, tecnologia e muito mais perto de você."
        breadcrumb={[{ label: 'Início', to: '/' }, { label: 'Eventos' }]}
      />

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <SearchBar value={search} onChange={setSearch} className="flex-1" />
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="event-filters"
            leftIcon={<SlidersHorizontal className="size-4" aria-hidden="true" />}
          >
            Filtros
            {activeFilters.length > 0 && (
              <Badge tone="primary" variant="solid" className="px-1.5">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        <div
          id="event-filters"
          className={cn(
            'grid gap-3 sm:grid-cols-2 md:grid-cols-4',
            !filtersOpen && 'max-md:hidden',
          )}
        >
          <Select
            label="Categoria"
            placeholder="Todas as categorias"
            value={query.category ?? ''}
            onChange={(event) => update({ category: event.target.value || null })}
            options={CATEGORIES.map((category) => ({
              value: category.value,
              label: category.label,
            }))}
          />
          <DatePicker
            label="Data"
            value={query.from ?? null}
            onChange={(value) => update({ from: value })}
            min={new Date().toISOString().slice(0, 10)}
          />
          <Select
            label="Localização"
            placeholder="Todas as cidades"
            value={query.city ?? ''}
            onChange={(event) => update({ city: event.target.value || null })}
            options={(cities.data ?? []).map((city) => ({ value: city, label: city }))}
            disabled={cities.status === 'loading'}
          />
          <Select
            label="Faixa de preço"
            placeholder="Qualquer preço"
            value={query.priceRange ?? ''}
            onChange={(event) => update({ price: event.target.value || null })}
            options={PRICE_RANGES.map((range) => ({ value: range.value, label: range.label }))}
          />
        </div>
      </div>

      <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="text-small text-muted">
            {events.status === 'success' && data
              ? pluralize(data.total, 'evento encontrado', 'eventos encontrados')
              : 'Buscando eventos…'}
          </p>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => update({ [filter.key]: null })}
              className="focus-ring bg-primary-50 text-caption text-primary-dark hover:bg-primary-100 inline-flex items-center gap-1 rounded-full py-1 pr-2 pl-3 font-semibold"
              aria-label={`Remover filtro ${filter.label}`}
            >
              {filter.label}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ))}
          {activeFilters.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="focus-ring text-caption text-muted hover:text-ink rounded font-semibold"
            >
              Limpar tudo
            </button>
          )}
        </div>
        <Select
          aria-label="Ordenar por"
          size="sm"
          value={query.sort ?? 'relevance'}
          onChange={(event) =>
            update({ sort: event.target.value === 'relevance' ? null : event.target.value })
          }
          options={SORT_OPTIONS}
          containerClassName="sm:w-52"
        />
      </div>

      {events.status === 'loading' && !data && <EventGridSkeleton count={EVENTS_PAGE_SIZE} />}
      {events.status === 'error' && (
        <ErrorState
          title="Não foi possível carregar os eventos"
          message={events.error}
          onRetry={events.reload}
        />
      )}
      {data && events.status !== 'error' && (
        <div
          className={cn(
            'flex flex-col gap-10 transition-opacity',
            events.isRefreshing && 'pointer-events-none opacity-60',
          )}
        >
          {data.items.length > 0 ? (
            <>
              <EventGrid events={data.items} />
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                pageSize={data.pageSize}
                onChange={changePage}
              />
            </>
          ) : (
            <EmptyState
              icon={<CalendarSearch />}
              title="Nenhum evento encontrado"
              description="Tente outros termos de busca ou remova alguns filtros para ver mais resultados."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Limpar filtros
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  )
}
