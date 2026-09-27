import { LayoutDashboard, LogOut, Ticket, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { type DropdownItem, useToast } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import type { User } from '@/types'

/** Account actions shared by the desktop dropdown and the mobile drawer. */
export function userMenuItems(user: User, onLogout: () => void): DropdownItem[] {
  return [
    ...(user.role === 'admin'
      ? [
          {
            id: 'admin',
            label: 'Painel administrativo',
            to: ROUTES.admin,
            icon: <LayoutDashboard />,
          },
        ]
      : []),
    { id: 'tickets', label: 'Meus ingressos', to: ROUTES.myTickets, icon: <Ticket /> },
    { id: 'profile', label: 'Meu perfil', to: ROUTES.profile, icon: <UserIcon /> },
    {
      id: 'logout',
      label: 'Sair',
      onSelect: onLogout,
      icon: <LogOut />,
      danger: true,
      separatorBefore: true,
    },
  ]
}

export function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  return async () => {
    await logout()
    toast.info('Você saiu da sua conta.')
    navigate(ROUTES.home)
  }
}
