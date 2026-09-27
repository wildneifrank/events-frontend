import {
  CalendarRange,
  ExternalLink,
  LayoutDashboard,
  type LucideIcon,
  Menu,
  Receipt,
  Ticket,
} from 'lucide-react'
import { Suspense, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { Drawer, PageSpinner } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import { cn } from '@/utils/cn'

import { Logo } from './Logo'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'
import { UserMenu } from './UserMenu'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV: NavItem[] = [
  { to: ROUTES.admin, label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: ROUTES.adminEvents, label: 'Eventos', icon: CalendarRange },
  { to: ROUTES.adminOrders, label: 'Pedidos', icon: Receipt },
  { to: ROUTES.adminTickets, label: 'Ingressos', icon: Ticket },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <div className="flex flex-col gap-1">
        <Logo to={ROUTES.admin} />
        <span className="text-caption text-muted pl-[42px] font-semibold tracking-wider uppercase">
          Produtor
        </span>
      </div>
      <nav aria-label="Administração">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'focus-ring text-small flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-dark'
                      : 'text-muted hover:text-ink hover:bg-slate-100',
                  )
                }
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto rounded-xl bg-slate-50 p-4">
        <p className="text-small text-ink font-semibold">Precisa de ajuda?</p>
        <p className="text-caption text-muted mt-1">Nossa equipe responde em até 2h úteis.</p>
        <NavLink
          to={ROUTES.home}
          onClick={onNavigate}
          className="focus-ring text-small text-primary hover:text-primary-dark mt-3 inline-flex items-center gap-1.5 rounded font-semibold"
        >
          Ver site público
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </NavLink>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <SkipLink />
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh border-r lg:block">
        <SidebarContent />
      </aside>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu administrativo">
        <SidebarContent onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-col">
        <header className="border-border bg-surface/85 sticky top-0 z-30 border-b backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
                className="focus-ring text-ink -ml-2 rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>
              <Logo to={ROUTES.admin} className="lg:hidden" />
            </div>
            {user && <UserMenu user={user} />}
          </div>
        </header>
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex-1 px-4 py-8 outline-none sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
