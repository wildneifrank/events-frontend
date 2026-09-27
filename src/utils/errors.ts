import { ApiError } from '@/types'

export function toErrorMessage(
  error: unknown,
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (error instanceof ApiError || error instanceof Error) return error.message || fallback
  return fallback
}
