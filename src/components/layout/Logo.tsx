import { Link } from 'react-router-dom'

import { BRAND } from '@/constants/brand'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 11.5A2.5 2.5 0 0 1 11.5 9h9A2.5 2.5 0 0 1 23 11.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 9 20.5v-2a2.5 2.5 0 0 0 0-5z"
        fill="#fff"
      />
      <path d="M14 16h4" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

interface LogoProps {
  to?: string
  inverted?: boolean
  className?: string
}

export function Logo({ to = ROUTES.home, inverted = false, className }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn('focus-ring inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label={`${BRAND.name} — página inicial`}
    >
      <LogoMark />
      <span
        className={cn('text-lg font-bold tracking-tight', inverted ? 'text-white' : 'text-ink')}
      >
        {BRAND.name}
      </span>
    </Link>
  )
}
