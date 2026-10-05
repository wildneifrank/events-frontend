import { env } from '@/config/env'
import { ApiError } from '@/types'

import { tokenStorage } from './tokenStorage'

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  query?: Query
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiUrl.replace(/\/$/, '')}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined
  return body instanceof FormData ? body : JSON.stringify(body)
}

function errorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload
    if (typeof message === 'string') return message
  }
  return `Erro ${status} ao processar a requisição.`
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStorage.token()
  const isJson = options.body !== undefined && !(options.body instanceof FormData)

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: serializeBody(options.body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0, 'NETWORK_ERROR')
  }

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) tokenStorage.clear()
    throw new ApiError(errorMessage(payload, response.status), response.status)
  }

  return payload as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
}
