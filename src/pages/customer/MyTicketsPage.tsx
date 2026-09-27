import { History, Ticket } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { TicketCard, TicketCardSkeleton } from '@/components/tickets/TicketCard'
import {
  Alert,
  ButtonLink,
  EmptyState,
  ErrorState,
  LoadingRegion,
  TabPanel,
  Tabs,
} from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useMyTickets } from '@/features/tickets/hooks'
import { useProcessingPoll } from '@/features/tickets/useProcessingPoll'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { TicketScope } from '@/types'

const TABS = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'past', label: 'Passados' },
] as const satisfies readonly { value: TicketScope; label: string }[]

const TABS_ID = 'my-tickets'

export default function MyTicketsPage() {
  useDocumentTitle('Meus ingressos')
  const [params, setParams] = useSearchParams()
  const scope: TicketScope = params.get('tab') === 'past' ? 'past' : 'upcoming'
  const { status, data, error, reload, isPlaceholder } = useMyTickets(scope)
  const tickets = isPlaceholder ? undefined : data
  const processing = tickets?.some((ticket) => ticket.status === 'processing') ?? false
  useProcessingPoll(processing, reload, tickets)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Meus ingressos"
        description="Acesse seus ingressos, QR codes e histórico de eventos."
        actions={
          <ButtonLink to={ROUTES.events} variant="outline">
            Explorar eventos
          </ButtonLink>
        }
      />

      <Tabs
        id={TABS_ID}
        label="Filtrar ingressos"
        items={TABS}
        value={scope}
        onChange={(value) => setParams(value === 'past' ? { tab: 'past' } : {}, { replace: true })}
      />

      <TabPanel tabsId={TABS_ID} value={scope} className="flex flex-col gap-4">
        {processing && (
          <Alert tone="info" title="Seu ingresso está sendo preparado">
            Estamos gerando o QR code dos seus ingressos mais recentes. Esta página atualiza
            sozinha.
          </Alert>
        )}

        {status === 'loading' && !tickets && (
          <LoadingRegion label="Carregando ingressos" className="flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <TicketCardSkeleton key={index} />
            ))}
          </LoadingRegion>
        )}

        {status === 'error' && <ErrorState message={error} onRetry={reload} />}

        {tickets &&
          status !== 'error' &&
          (tickets.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <TicketCard ticket={ticket} />
                </li>
              ))}
            </ul>
          ) : scope === 'upcoming' ? (
            <EmptyState
              icon={<Ticket />}
              title="Você ainda não tem ingressos para próximos eventos"
              description="Quando você comprar um ingresso, ele aparece aqui com o QR code de acesso."
              action={<ButtonLink to={ROUTES.events}>Explorar eventos</ButtonLink>}
            />
          ) : (
            <EmptyState
              icon={<History />}
              title="Nenhum evento passado"
              description="Seu histórico de eventos aparecerá aqui."
            />
          ))}
      </TabPanel>
    </div>
  )
}
