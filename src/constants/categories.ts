import {
  Cpu,
  Drama,
  Guitar,
  type LucideIcon,
  PartyPopper,
  Trophy,
  UtensilsCrossed,
} from 'lucide-react'

import type { EventCategory } from '@/types'

export interface CategoryMeta {
  value: EventCategory
  label: string
  description: string
  icon: LucideIcon
  tint: string
}

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    value: 'shows',
    label: 'Shows',
    description: 'Os maiores palcos',
    icon: Guitar,
    tint: '#6D5DFB',
  },
  {
    value: 'festivais',
    label: 'Festivais',
    description: 'Dias de música e cultura',
    icon: PartyPopper,
    tint: '#DB2777',
  },
  {
    value: 'esportes',
    label: 'Esportes',
    description: 'Emoção ao vivo',
    icon: Trophy,
    tint: '#EA580C',
  },
  {
    value: 'tecnologia',
    label: 'Tecnologia',
    description: 'Conferências e meetups',
    icon: Cpu,
    tint: '#2563EB',
  },
  {
    value: 'cultura',
    label: 'Cultura',
    description: 'Teatro, cinema e arte',
    icon: Drama,
    tint: '#0D9488',
  },
  {
    value: 'gastronomia',
    label: 'Gastronomia',
    description: 'Sabores e experiências',
    icon: UtensilsCrossed,
    tint: '#CA8A04',
  },
]

const BY_VALUE = new Map(CATEGORIES.map((category) => [category.value, category]))

export function getCategory(value: EventCategory): CategoryMeta {
  return BY_VALUE.get(value) ?? CATEGORIES[0]!
}
