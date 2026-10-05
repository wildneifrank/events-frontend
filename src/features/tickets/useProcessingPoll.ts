import { useEffect } from 'react'

const POLL_INTERVAL_MS = 3_000

export function useProcessingPoll(isProcessing: boolean, reload: () => void, data: unknown) {
  useEffect(() => {
    if (!isProcessing) return
    const timer = window.setTimeout(reload, POLL_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [isProcessing, reload, data])
}
