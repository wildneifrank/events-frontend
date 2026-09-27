import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { PageSpinner } from '@/components/ui'

import { Footer } from './Footer'
import { Header } from './Header'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Header />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
