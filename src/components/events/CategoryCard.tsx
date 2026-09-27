import { Link } from 'react-router-dom'

import type { CategoryMeta } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'

export function CategoryCard({ category }: { category: CategoryMeta }) {
  const Icon = category.icon
  return (
    <Link
      to={`${ROUTES.events}?category=${category.value}`}
      className="group focus-ring rounded-card border-border bg-surface hover:shadow-elevated flex h-full flex-col gap-4 border p-4 transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 sm:p-5"
    >
      <span
        className="flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: `${category.tint}14`, color: category.tint }}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-h4 text-ink">{category.label}</span>
        <span className="text-small text-muted">{category.description}</span>
      </span>
    </Link>
  )
}
