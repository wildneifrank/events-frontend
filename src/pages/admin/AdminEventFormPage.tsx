import { CalendarX2, Plus, Save, Send, Trash2 } from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { BannerUpload } from '@/components/events/BannerUpload'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardContent,
  Checkbox,
  EmptyState,
  ErrorState,
  Input,
  LoadingRegion,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from '@/components/ui'
import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import {
  type BatchFormValues,
  emptyBatch,
  emptyEventForm,
  type EventFormValues,
  eventToForm,
  formToInput,
  validateEventForm,
} from '@/features/events/eventForm'
import { useEvent } from '@/features/events/hooks'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { eventsService } from '@/services'
import type { EventStatus } from '@/types'
import { toErrorMessage } from '@/utils/errors'
import { formatNumber } from '@/utils/format'

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'finished', label: 'Encerrado' },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="flex flex-col gap-1">
          <h2 className="text-h4 text-ink">{title}</h2>
          <p className="text-small text-muted">{description}</p>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </CardContent>
    </Card>
  )
}

function EventForm({ initial, eventId }: { initial: EventFormValues; eventId?: string }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [values, setValues] = useState(initial)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState<EventStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(eventId)

  const errors = validateEventForm(values)
  const errorFor = (field: string) => (submitted ? errors[field] : undefined)
  const errorCount = Object.keys(errors).length

  const set = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }))

  const text = (field: keyof EventFormValues & string) => ({
    value: String(values[field]),
    onChange: (event: { target: { value: string } }) => set(field, event.target.value as never),
    error: errorFor(field),
  })

  const setBatch = (index: number, changes: Partial<BatchFormValues>) =>
    set(
      'batches',
      values.batches.map((batch, current) =>
        current === index ? { ...batch, ...changes } : batch,
      ),
    )

  const save = async (status: EventStatus) => {
    setSubmitted(true)
    setError(null)
    if (errorCount > 0) {
      toast.error(
        'Revise os campos destacados.',
        `${errorCount} ${errorCount === 1 ? 'campo precisa' : 'campos precisam'} de atenção.`,
      )
      return
    }
    setSaving(status)
    try {
      const input = formToInput({ ...values, status })
      const event = eventId
        ? await eventsService.updateEvent(eventId, input)
        : await eventsService.createEvent(input)
      toast.success(
        isEdit ? 'Evento atualizado com sucesso.' : 'Evento criado com sucesso.',
        event.title,
      )
      navigate(ROUTES.adminEvent(event.id))
    } catch (err) {
      setError(toErrorMessage(err))
      setSaving(null)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void save(isEdit ? values.status : 'published')
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <Alert tone="danger" title="Não foi possível salvar">
          {error}
        </Alert>
      )}
      {submitted && errorCount > 0 && (
        <Alert tone="warning" title="Alguns campos precisam de atenção">
          Corrija os campos destacados antes de continuar.
        </Alert>
      )}

      <Section title="Informações básicas" description="Como o evento aparece para o público.">
        <Input
          label="Nome do evento"
          required
          placeholder="Ex.: Rock Festival 2026"
          {...text('title')}
        />
        <Input
          label="Resumo"
          placeholder="Uma frase que desperte interesse"
          hint="Aparece nos cards e na busca."
          maxLength={140}
          {...text('summary')}
        />
        <Textarea
          label="Descrição"
          required
          rows={6}
          placeholder="Atrações, programação, regras de acesso..."
          {...text('description')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Categoria"
            required
            placeholder="Selecione"
            options={CATEGORIES.map((category) => ({
              value: category.value,
              label: category.label,
            }))}
            {...text('category')}
          />
          {isEdit && <Select label="Status" options={STATUS_OPTIONS} {...text('status')} />}
        </div>
        <Checkbox
          label="Destacar na página inicial"
          description="Eventos em destaque aparecem na vitrine principal."
          checked={values.featured}
          onChange={(event) => set('featured', event.target.checked)}
        />
      </Section>

      <Section title="Data e local" description="Quando e onde o evento acontece.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Data" type="date" required {...text('date')} />
          <Input label="Início" type="time" required {...text('startTime')} />
          <Input label="Término" type="time" {...text('endTime')} />
        </div>
        <Input
          label="Local"
          required
          placeholder="Ex.: Centro de Eventos do Ceará"
          {...text('venueName')}
        />
        <Input label="Endereço" required placeholder="Rua, número — bairro" {...text('address')} />
        <div className="grid grid-cols-[1fr_6rem] gap-4">
          <Input label="Cidade" required {...text('city')} />
          <Input label="UF" required maxLength={2} className="uppercase" {...text('state')} />
        </div>
      </Section>

      <Section title="Mídia" description="Uma boa imagem aumenta a conversão do evento.">
        <BannerUpload value={values.bannerUrl} onChange={(url) => set('bannerUrl', url)} />
      </Section>

      <Section
        title="Lotes de ingressos"
        description="Defina preços, quantidades e período de venda de cada lote."
      >
        {errorFor('batches') && <Alert tone="danger">{errorFor('batches')}</Alert>}
        <ol className="flex flex-col gap-4">
          {values.batches.map((batch, index) => {
            const err = (field: string) => errorFor(`batches.${index}.${field}`)
            return (
              <li key={batch.key} className="border-border rounded-xl border bg-slate-50/50 p-4">
                <fieldset className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <legend className="text-small text-ink font-semibold">Lote {index + 1}</legend>
                    <div className="flex items-center gap-2">
                      {batch.sold > 0 && (
                        <span className="text-caption text-muted">
                          {formatNumber(batch.sold)} vendidos
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={values.batches.length === 1 || batch.sold > 0}
                        onClick={() =>
                          set(
                            'batches',
                            values.batches.filter((_, current) => current !== index),
                          )
                        }
                        aria-label={`Remover lote ${index + 1}`}
                        title={
                          batch.sold > 0
                            ? 'Lotes com vendas não podem ser removidos'
                            : 'Remover lote'
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Input
                      label="Nome"
                      value={batch.name}
                      onChange={(event) => setBatch(index, { name: event.target.value })}
                      error={err('name')}
                      containerClassName="sm:col-span-2"
                    />
                    <Input
                      label="Preço (R$)"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={batch.price}
                      onChange={(event) =>
                        setBatch(index, { price: event.target.value.replace(/[^\d,.]/g, '') })
                      }
                      error={err('price')}
                    />
                    <Input
                      label="Quantidade"
                      type="number"
                      min={Math.max(1, batch.sold)}
                      value={batch.quantity}
                      onChange={(event) => setBatch(index, { quantity: event.target.value })}
                      error={err('quantity')}
                    />
                    <Input
                      label="Data inicial"
                      containerClassName="xl:col-span-2"
                      type="date"
                      value={batch.startDate}
                      onChange={(event) => setBatch(index, { startDate: event.target.value })}
                      error={err('startDate')}
                    />
                    <Input
                      label="Data final"
                      containerClassName="xl:col-span-2"
                      type="date"
                      value={batch.endDate}
                      onChange={(event) => setBatch(index, { endDate: event.target.value })}
                      error={err('endDate')}
                    />
                  </div>
                </fieldset>
              </li>
            )
          })}
        </ol>
        <Button
          variant="outline"
          className="self-start"
          leftIcon={<Plus className="size-4" aria-hidden="true" />}
          onClick={() => set('batches', [...values.batches, emptyBatch(values.batches.length)])}
        >
          Adicionar lote
        </Button>
      </Section>

      <div className="border-border bg-surface/95 sm:rounded-card sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t px-4 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:border">
        <ButtonLink to={eventId ? ROUTES.adminEvent(eventId) : ROUTES.adminEvents} variant="ghost">
          Cancelar
        </ButtonLink>
        {isEdit ? (
          <Button
            type="submit"
            loading={saving !== null}
            leftIcon={<Save className="size-4" aria-hidden="true" />}
          >
            Salvar alterações
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              loading={saving === 'draft'}
              disabled={saving !== null}
              onClick={() => void save('draft')}
            >
              Salvar rascunho
            </Button>
            <Button
              type="submit"
              loading={saving === 'published'}
              disabled={saving !== null}
              leftIcon={<Send className="size-4" aria-hidden="true" />}
            >
              Publicar evento
            </Button>
          </>
        )}
      </div>
    </form>
  )
}

export default function AdminEventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { status, data: event, error, errorStatus, reload } = useEvent(id)
  useDocumentTitle(isEdit ? 'Editar evento' : 'Novo evento')

  const breadcrumb = [
    { label: 'Eventos', to: ROUTES.adminEvents },
    ...(isEdit && event ? [{ label: event.title, to: ROUTES.adminEvent(event.id) }] : []),
    { label: isEdit ? 'Editar' : 'Novo evento' },
  ]

  const header = (
    <PageHeader
      breadcrumb={breadcrumb}
      title={isEdit ? 'Editar evento' : 'Criar evento'}
      description={
        isEdit
          ? 'Atualize as informações e os lotes do evento.'
          : 'Preencha as informações para começar a vender.'
      }
    />
  )

  if (!isEdit) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <EventForm initial={emptyEventForm()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {header}
      {status === 'loading' && (
        <LoadingRegion label="Carregando evento" className="flex flex-col gap-6">
          <Skeleton className="rounded-card h-80" />
          <Skeleton className="rounded-card h-64" />
        </LoadingRegion>
      )}
      {status === 'error' &&
        (errorStatus === 404 ? (
          <EmptyState
            icon={<CalendarX2 />}
            title="Evento não encontrado"
            action={<ButtonLink to={ROUTES.adminEvents}>Voltar para eventos</ButtonLink>}
          />
        ) : (
          <ErrorState message={error} onRetry={reload} />
        ))}
      {status === 'success' && event && (
        <EventForm key={event.id} initial={eventToForm(event)} eventId={event.id} />
      )}
    </div>
  )
}
