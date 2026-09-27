import { AlertTriangle } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { ButtonLink } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

/** Last-resort boundary for render errors and failed lazy chunks. */
export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'Ocorreu um erro inesperado ao carregar esta página.'

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div role="alert" className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="bg-danger-soft text-danger flex size-14 items-center justify-center rounded-2xl">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-h2 text-ink">Algo deu errado</h1>
        <p className="text-body text-muted">{message}</p>
        <div className="flex gap-2">
          <ButtonLink to={ROUTES.home} variant="outline">
            Ir para o início
          </ButtonLink>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="focus-ring bg-primary hover:bg-primary-dark h-11 rounded-xl px-4 text-sm font-semibold text-white"
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  )
}
