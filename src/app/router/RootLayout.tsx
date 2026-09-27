import { Outlet } from 'react-router-dom'

import { ScrollToTop } from '@/components/layout/ScrollToTop'

export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}
