import { useEffect } from 'react'

import { BRAND } from '@/constants/brand'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND.name}` : `${BRAND.name} — Ingressos para eventos`
  }, [title])
}
