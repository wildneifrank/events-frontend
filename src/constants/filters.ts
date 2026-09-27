import type { EventSort, PriceRange } from '@/types'

export const SORT_OPTIONS: readonly { value: EventSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
]

export const PRICE_RANGES: readonly {
  value: PriceRange
  label: string
  min: number
  max: number
}[] = [
  { value: 'free-50', label: 'Até R$ 50', min: 0, max: 50 },
  { value: '50-100', label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { value: '100-200', label: 'R$ 100 a R$ 200', min: 100, max: 200 },
  { value: '200-plus', label: 'Acima de R$ 200', min: 200, max: Number.POSITIVE_INFINITY },
]

export const EVENTS_PAGE_SIZE = 6
export const ADMIN_PAGE_SIZE = 8
