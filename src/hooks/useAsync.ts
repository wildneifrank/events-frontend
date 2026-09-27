import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/types'
import { toErrorMessage } from '@/utils/errors'

export type AsyncStatus = 'loading' | 'success' | 'error'

interface Settled<T> {
  key: string
  /** Request key without the reload counter. */
  baseKey: string
  data?: T
  error?: string
  errorStatus?: number
}

export interface AsyncResult<T> {
  status: AsyncStatus
  data: T | undefined
  error: string | undefined
  /** HTTP-like status of the failure (e.g. 404), when known. */
  errorStatus: number | undefined
  /** Refetching the same request (reload/poll) while its previous data is displayed. */
  isRefreshing: boolean
  /** Loading a different request while data from the previous one is displayed. */
  isPlaceholder: boolean
  reload: () => void
  /** Locally patch the cached data (e.g. after a mutation). */
  setData: (updater: (current: T | undefined) => T | undefined) => void
}

/**
 * Minimal data-fetching hook. `key` identifies the request: whenever it
 * changes the fetcher runs again. Pass `null` to skip fetching.
 * Race-safe: responses for stale keys are ignored.
 */
export function useAsync<T>(key: string | null, fetcher: () => Promise<T>): AsyncResult<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [attempt, setAttempt] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const requestKey = key === null ? null : `${key}#${attempt}`

  useEffect(() => {
    if (requestKey === null || key === null) return
    let active = true
    fetcherRef.current().then(
      (data) => active && setSettled({ key: requestKey, baseKey: key, data }),
      (error: unknown) =>
        active &&
        setSettled({
          key: requestKey,
          baseKey: key,
          error: toErrorMessage(error),
          errorStatus: error instanceof ApiError ? error.status : undefined,
        }),
    )
    return () => {
      active = false
    }
  }, [requestKey, key])

  const current = settled?.key === requestKey ? settled : null
  const status: AsyncStatus = current ? (current.error ? 'error' : 'success') : 'loading'

  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  const setData = useCallback(
    (updater: (value: T | undefined) => T | undefined) =>
      setSettled((previous) =>
        previous ? { ...previous, data: updater(previous.data) } : previous,
      ),
    [],
  )

  return {
    status,
    data: current ? current.data : settled?.data,
    error: current?.error,
    errorStatus: current?.errorStatus,
    isRefreshing: status === 'loading' && settled?.baseKey === key && settled.data !== undefined,
    isPlaceholder: status === 'loading' && settled !== null && settled.baseKey !== key,
    reload,
    setData,
  }
}
