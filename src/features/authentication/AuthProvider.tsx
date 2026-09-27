import { type ReactNode, useCallback, useMemo, useState } from 'react'

import { authService } from '@/services'
import { tokenStorage } from '@/services/api/tokenStorage'
import type { AuthSession, User } from '@/types'

import { AuthContext, type AuthContextValue } from './authContext'

function readValidSession(): AuthSession | null {
  const session = tokenStorage.read()
  if (session && new Date(session.expiresAt).getTime() < Date.now()) {
    tokenStorage.clear()
    return null
  }
  return session
}

/**
 * Holds the authenticated user. Mock and real auth share this flow:
 * the service returns a session, which is persisted by `tokenStorage`
 * and attached as a Bearer token by the API client.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readValidSession)

  const login = useCallback<AuthContextValue['login']>(async (payload) => {
    const next = await authService.login(payload)
    tokenStorage.write(next, payload.remember)
    setSession(next)
    return next.user
  }, [])

  const register = useCallback<AuthContextValue['register']>(async (payload) => {
    const next = await authService.register(payload)
    tokenStorage.write(next, true)
    setSession(next)
    return next.user
  }, [])

  const logout = useCallback(async () => {
    setSession(null)
    tokenStorage.clear()
    await authService.logout().catch(() => undefined)
  }, [])

  const updateUser = useCallback((user: User) => {
    setSession((current) => {
      if (!current) return current
      const next = { ...current, user }
      tokenStorage.update(next)
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isAdmin: session?.user.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [session, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
