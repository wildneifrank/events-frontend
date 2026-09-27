import { Compass, Menu, Ticket } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { Avatar, ButtonLink, Drawer } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import { cn } from '@/utils/cn'

import { Logo } from './Logo'
import { useLogout, userMenuItems } from './accountMenu'
import { UserMenu } from './UserMenu'

const NAV_LINKS = [
  { to: ROUTES.events, label: 'Eventos', icon: Compass },
  { to: ROUTES.myTickets, label: 'Meus ingressos', icon: Ticket },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'focus-ring rounded-lg px-3 py-2 text-small font-semibold transition-colors',
    isActive ? 'text-primary-dark' : 'text-muted hover:text-ink',
  )

export function Header() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = useLogout()
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="border-border/80 bg-surface/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!user && (
            <ButtonLink to={ROUTES.login} variant="ghost">
              Entrar
            </ButtonLink>
          )}
          <ButtonLink to={ROUTES.events} size="md">
            Explorar eventos
          </ButtonLink>
          {user && <UserMenu user={user} />}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          className="focus-ring text-ink -mr-2 rounded-lg p-2 hover:bg-slate-100 md:hidden"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      <Drawer open={menuOpen} onClose={closeMenu} label="Menu de navegação">
        <div className="flex h-full flex-col gap-6 p-5">
          <Logo className="self-start" />
          {user && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="text-small text-ink truncate font-semibold">{user.name}</p>
                <p className="text-caption text-muted truncate">{user.email}</p>
              </div>
            </div>
          )}
          <nav aria-label="Principal (mobile)">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      cn(
                        'focus-ring text-body flex items-center gap-3 rounded-xl px-3 py-3 font-semibold',
                        isActive
                          ? 'bg-primary-50 text-primary-dark'
                          : 'text-ink hover:bg-slate-100',
                      )
                    }
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {user && (
            <ul className="border-border flex flex-col gap-1 border-t pt-4">
              {userMenuItems(user, handleLogout)
                .filter((item) => item.id !== 'tickets')
                .map((item) =>
                  item.to ? (
                    <li key={item.id}>
                      <NavLink
                        to={item.to}
                        onClick={closeMenu}
                        className="focus-ring text-body text-ink flex items-center gap-3 rounded-xl px-3 py-3 font-medium hover:bg-slate-100 [&>svg]:size-5"
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu()
                          item.onSelect?.()
                        }}
                        className="focus-ring text-body text-danger hover:bg-danger-soft flex w-full items-center gap-3 rounded-xl px-3 py-3 font-medium [&>svg]:size-5"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    </li>
                  ),
                )}
            </ul>
          )}
          <div className="mt-auto flex flex-col gap-2">
            <ButtonLink to={ROUTES.events} fullWidth size="lg" onClick={closeMenu}>
              Explorar eventos
            </ButtonLink>
            {!user && (
              <ButtonLink
                to={ROUTES.login}
                variant="outline"
                fullWidth
                size="lg"
                onClick={closeMenu}
              >
                Entrar
              </ButtonLink>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  )
}
