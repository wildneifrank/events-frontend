import { CheckCircle2 } from 'lucide-react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { PageSpinner } from '@/components/ui'

import { Logo } from './Logo'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'

const HIGHLIGHTS = [
  'Ingressos no celular, sem filas',
  'Pagamento seguro com cartão ou PIX',
  'Reembolso facilitado em caso de cancelamento',
]

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <SkipLink />
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex flex-1 items-center justify-center py-10 outline-none"
        >
          <div className="w-full max-w-md">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <aside
        aria-hidden="true"
        className="bg-night relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-end"
      >
        <div className="bg-primary/35 absolute -top-32 -right-32 size-[32rem] rounded-full blur-3xl" />
        <div className="bg-primary-light/20 absolute bottom-0 -left-24 size-80 rounded-full blur-3xl" />
        <div className="relative flex max-w-md flex-col gap-6">
          <p className="text-h1 text-white">Seu próximo evento começa aqui.</p>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="text-body flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="text-primary-light size-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
