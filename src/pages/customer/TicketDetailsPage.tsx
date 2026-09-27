import { ArrowLeft, CalendarPlus, Download, Info, TicketX, Wallet } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { TicketPass } from '@/components/tickets/TicketPass'
import {
  Button,
  ButtonLink,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingRegion,
  Skeleton,
  useToast,
} from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useTicket } from '@/features/tickets/hooks'
import { useProcessingPoll } from '@/features/tickets/useProcessingPoll'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency, formatDateTime } from '@/utils/format'

const INSTRUCTIONS = [
  'Apresente o QR code na entrada — no celular ou impresso.',
  'Leve um documento oficial com foto do titular.',
  'O QR code é único e só pode ser utilizado uma vez.',
  'Chegue com antecedência para evitar filas.',
]

export default function TicketDetailsPage() {
  const { id } = useParams()
  const { status, data, error, errorStatus, reload, isPlaceholder } = useTicket(id)
  const ticket = isPlaceholder ? undefined : data
  const toast = useToast()
  useDocumentTitle(ticket ? `Ingresso · ${ticket.eventTitle}` : 'Ingresso')
  useProcessingPoll(ticket?.status === 'processing', reload, ticket)

  const back = (
    <Link
      to={ROUTES.myTickets}
      className="focus-ring text-small text-muted hover:text-ink inline-flex w-fit items-center gap-1.5 rounded font-semibold"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Meus ingressos
    </Link>
  )

  if (status === 'loading' && !ticket) {
    return (
      <LoadingRegion label="Carregando ingresso" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="mx-auto h-[36rem] w-full max-w-md rounded-3xl" />
        <Skeleton className="rounded-card h-72" />
      </LoadingRegion>
    )
  }

  if (status === 'error' || !ticket) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        {errorStatus === 404 ? (
          <EmptyState
            icon={<TicketX />}
            title="Ingresso não encontrado"
            description="Verifique se você está logado com a conta usada na compra."
            action={<ButtonLink to={ROUTES.myTickets}>Ver meus ingressos</ButtonLink>}
          />
        ) : (
          <ErrorState message={error} onRetry={reload} />
        )}
      </div>
    )
  }

  const ready = ticket.status === 'valid'

  return (
    <div className="flex flex-col gap-6">
      {back}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <TicketPass ticket={ticket} />

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="text-h4 text-ink">Ações</h2>
              <Button
                fullWidth
                disabled={!ready}
                leftIcon={<Download className="size-4" aria-hidden="true" />}
                onClick={() =>
                  toast.success(
                    'Download iniciado',
                    `${ticket.code}.pdf será salvo no seu dispositivo.`,
                  )
                }
              >
                Baixar ingresso
              </Button>
              <Button
                fullWidth
                variant="outline"
                disabled={!ready}
                leftIcon={<Wallet className="size-4" aria-hidden="true" />}
                onClick={() =>
                  toast.info(
                    'Adicionado à carteira',
                    'Seu ingresso já está disponível na carteira digital.',
                  )
                }
              >
                Adicionar à carteira
              </Button>
              <Button
                fullWidth
                variant="ghost"
                leftIcon={<CalendarPlus className="size-4" aria-hidden="true" />}
                onClick={() => toast.success('Evento salvo na agenda')}
              >
                Adicionar ao calendário
              </Button>
              {!ready && ticket.status === 'processing' && (
                <p className="text-caption text-muted flex items-start gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Download disponível assim que o ingresso for gerado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="text-h4 text-ink">Detalhes da compra</h2>
              <dl className="text-small flex flex-col gap-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Titular</dt>
                  <dd className="text-ink truncate font-medium">{ticket.holderName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Valor</dt>
                  <dd className="text-ink font-medium">{formatCurrency(ticket.price)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Emitido em</dt>
                  <dd className="text-ink font-medium">{formatDateTime(ticket.issuedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="text-h4 text-ink">Antes de ir</h2>
              <ul className="text-small text-muted marker:text-primary flex list-disc flex-col gap-2 pl-5">
                {INSTRUCTIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
