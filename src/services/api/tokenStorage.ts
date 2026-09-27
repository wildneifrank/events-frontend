import type { AuthSession } from '@/types'

const KEY = 'eventflow:session'

function safe<T>(action: () => T, fallback: T): T {
  try {
    return action()
  } catch {
    return fallback
  }
}

/**
 * Where the session lives: localStorage when "remember me" is checked,
 * sessionStorage otherwise. Shared by the HTTP client and the mock layer.
 */
export const tokenStorage = {
  read(): AuthSession | null {
    const raw = safe(() => localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY), null)
    return raw ? safe(() => JSON.parse(raw) as AuthSession, null) : null
  },
  write(session: AuthSession, remember: boolean): void {
    tokenStorage.clear()
    safe(
      () => (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session)),
      undefined,
    )
  },
  update(session: AuthSession): void {
    safe(() => {
      const target = localStorage.getItem(KEY) ? localStorage : sessionStorage
      target.setItem(KEY, JSON.stringify(session))
    }, undefined)
  },
  clear(): void {
    safe(() => {
      localStorage.removeItem(KEY)
      sessionStorage.removeItem(KEY)
    }, undefined)
  },
  token(): string | null {
    return tokenStorage.read()?.token ?? null
  },
}
