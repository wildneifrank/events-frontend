import { env } from '@/config/env'
import { ApiError } from '@/types'
import { delay } from '@/utils/delay'

const DAY_MS = 86_400_000
const TZ_OFFSET = '-03:00'

export function daysFromNow(days: number, time = '20:00'): string {
  const target = new Date(Date.now() + days * DAY_MS)
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(target)
  return new Date(`${ymd}T${time}:00${TZ_OFFSET}`).toISOString()
}

export function toDayKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date(iso))
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString()
}

export function createRandom(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
  }
}

export async function simulateNetwork(): Promise<void> {
  await delay(env.mockDelay * (0.6 + Math.random() * 0.8))
  if (env.mockFailureRate > 0 && Math.random() < env.mockFailureRate) {
    throw new ApiError('Falha simulada de rede. Tente novamente.', 503, 'MOCK_FAILURE')
  }
}

export function clone<T>(value: T): T {
  return structuredClone(value)
}

export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  }
}
