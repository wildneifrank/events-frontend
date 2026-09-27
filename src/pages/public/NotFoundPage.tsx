import { Compass } from 'lucide-react'

import { ButtonLink } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada')
  return (
    <div className="container-page flex flex-col items-center gap-6 py-24 text-center">
      <span
        className="text-primary-100 text-[6rem] leading-none font-extrabold tracking-tighter sm:text-[8rem]"
        aria-hidden="true"
      >
        404
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-h1 text-ink">Página não encontrada</h1>
        <p className="text-body text-muted">
          O endereço pode estar errado ou a página foi removida. Que tal descobrir um novo evento?
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <ButtonLink to={ROUTES.events} leftIcon={<Compass className="size-4" aria-hidden="true" />}>
          Explorar eventos
        </ButtonLink>
        <ButtonLink to={ROUTES.home} variant="outline">
          Voltar ao início
        </ButtonLink>
      </div>
    </div>
  )
}
