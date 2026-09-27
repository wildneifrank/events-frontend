import { Ticket, User } from 'lucide-react'
import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { PageSpinner } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

import { Header } from './Header'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'

const ACCOUNT_LINKS = [
  { to: ROUTES.myTickets, label: 'Meus ingressos', icon: Ticket },
  { to: ROUTES.profile, label: 'Perfil', icon: User },
]

/** Authenticated customer area. `withNav` shows the account sub-navigation. */
export function CustomerLayout({ withNav = true }: { withNav?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Header />
      {withNav && (
        <div className="border-border bg-surface border-b">
          <nav aria-label="Minha conta" className="container-page">
            <ul className="-mb-px flex gap-6 overflow-x-auto">
              {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'focus-ring text-small flex items-center gap-2 border-b-2 py-3.5 font-semibold whitespace-nowrap transition-colors',
                        isActive
                          ? 'border-primary text-primary-dark'
                          : 'text-muted hover:text-ink border-transparent hover:border-slate-300',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 pt-8 pb-16 outline-none sm:pt-10">
        <div className="container-page">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
