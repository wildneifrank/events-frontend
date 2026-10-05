function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false',
  mockDelay: readNumber(import.meta.env.VITE_MOCK_DELAY, 450),
  mockFailureRate: readNumber(import.meta.env.VITE_MOCK_FAILURE_RATE, 0),
  appName: import.meta.env.VITE_APP_NAME ?? 'EventFlow',
  isDev: import.meta.env.DEV,
} as const
