import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import type { UserRole } from '@/types'

import { useAuth } from './useAuth'

interface RequireAuthProps {
  role?: UserRole
  children: ReactNode
}

/** Route guard: redirects to login (keeping the target URL) or home when the role does not match. */
export function RequireAuth({ role, children }: RequireAuthProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`${ROUTES.login}?redirect=${redirect}`} replace />
  }

  if (role && user.role !== role) return <Navigate to={ROUTES.home} replace />

  return <>{children}</>
}
