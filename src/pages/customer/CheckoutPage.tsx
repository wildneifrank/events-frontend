import {
  ArrowLeft,
  CreditCard,
  IdCard,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
  TicketX,
  User,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector'
import { PurchaseSuccess } from '@/components/checkout/PurchaseSuccess'
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  LoadingRegion,
  Select,
  Skeleton,
  useToast,
} from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/authentication/useAuth'
import { parseSelection, resolveSelection } from '@/features/checkout/selection'
import { useEvent } from '@/features/events/hooks'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useForm } from '@/hooks/useForm'
import { ordersService } from '@/services'
import type { Event, Order, PaymentMethod } from '@/types'
import { toErrorMessage } from '@/utils/errors'
import { formatCurrency } from '@/utils/format'
import { isValidCpf, isValidEmail, maskCpf, onlyDigits } from '@/utils/validation'

interface CheckoutValues extends Record<string, unknown> {
  name: string
  email: string
  cpf: string
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvv: string
  installments: string
}

const maskCard = (value: string) =>
  onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
const maskExpiry = (value: string) =>
  onlyDigits(value)
    .slice(0, 4)
    .replace(/(\d{2})(\d)/, '$1/$2')

function validator(method: PaymentMethod) {
  return (values: CheckoutValues) => ({
    name: values.name.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : undefined,
    email: isValidEmail(values.email) ? undefined : 'E-mail inválido.',
    cpf: isValidCpf(values.cpf) ? undefined : 'CPF inválido.',
    ...(method === 'card' && {
      cardNumber:
        onlyDigits(values.cardNumber).length === 16 ? undefined : 'Número do cartão incompleto.',
      cardName: values.cardName.trim() ? undefined : 'Informe o nome impresso no cartão.',
      cardExpiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(values.cardExpiry)
        ? undefined
        : 'Validade inválida (MM/AA).',
      cardCvv: /^\d{3,4}$/.test(values.cardCvv) ? undefined : 'CVV inválido.',
    }),
  })
}

function CheckoutSkeleton() {
  return (
    <LoadingRegion label="Carregando checkout" className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="flex flex-col gap-6">
        <Skeleton className="rounded-card h-64" />
        <Skeleton className="rounded-card h-72" />
      </div>
      <Skeleton className="rounded-card h-96" />
    </LoadingRegion>
  )
}

function CheckoutForm({ event, onSuccess }: { event: Event; onSuccess: (order: Order) => void }) {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summary = resolveSelection(event, parseSelection(params.get('items')))
  const form = useForm<CheckoutValues>(
    {
      name: user?.name ?? '',
      email: user?.email ?? '',
      cpf: user?.cpf ?? '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
      installments: '1',
    },
    validator(method),
  )

  if (summary.quantity === 0) {
    return (
      <EmptyState
        icon={<TicketX />}
        title="Nenhum ingresso selecionado"
        description="Os ingressos escolhidos não estão mais disponíveis ou a seleção expirou."
        action={<ButtonLink to={ROUTES.event(event.id)}>Escolher ingressos</ButtonLink>}
      />
    )
  }

  const handleSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault()
    setError(null)
    if (!form.submit()) {
      toast.error('Verifique os campos destacados.')
      return
    }
    setSubmitting(true)
    try {
      const { order } = await ordersService.createPurchase({
        eventId: event.id,
        items: summary.items,
        buyer: { name: form.values.name, email: form.values.email, cpf: form.values.cpf },
        payment:
          method === 'card'
            ? {
                method,
                cardLast4: onlyDigits(form.values.cardNumber).slice(-4),
                installments: Number(form.values.installments),
              }
            : { method },
      })
      toast.success('Compra realizada com sucesso.', `Pedido ${order.number}`)
      onSuccess(order)
    } catch (err) {
      const message = toErrorMessage(err)
      setError(message)
      toast.error('Não foi possível concluir a compra.', message)
      setSubmitting(false)
    }
  }

  const installmentOptions = Array.from({ length: 6 }, (_, index) => ({
    value: String(index + 1),
    label: `${index + 1}x de ${formatCurrency(summary.total / (index + 1))}${index === 0 ? ' à vista' : ' sem juros'}`,
  }))

  const confirmButton = (
    <Button
      type="submit"
      form="checkout-form"
      size="lg"
      fullWidth
      loading={submitting}
      leftIcon={<Lock className="size-4" aria-hidden="true" />}
    >
      Confirmar compra
    </Button>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <form id="checkout-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <Alert tone="danger" title="Pagamento não concluído">
            {error}
          </Alert>
        )}

        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 text-ink">Dados do comprador</h2>
              <p className="text-small text-muted">Os ingressos serão emitidos neste nome.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome completo"
                autoComplete="name"
                leftIcon={<User />}
                required
                containerClassName="sm:col-span-2"
                {...form.register('name')}
              />
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                leftIcon={<Mail />}
                required
                {...form.register('email')}
              />
              <Input
                label="CPF"
                inputMode="numeric"
                leftIcon={<IdCard />}
                placeholder="000.000.000-00"
                required
                {...form.register('cpf')}
                onChange={(changeEvent) => form.setField('cpf', maskCpf(changeEvent.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 text-ink">Pagamento</h2>
              <p className="text-small text-muted">
                Ambiente de demonstração — nenhuma cobrança real será feita.
              </p>
            </div>
            <PaymentMethodSelector value={method} onChange={setMethod} />

            {method === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Número do cartão"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  leftIcon={<CreditCard />}
                  required
                  containerClassName="sm:col-span-2"
                  {...form.register('cardNumber')}
                  onChange={(changeEvent) =>
                    form.setField('cardNumber', maskCard(changeEvent.target.value))
                  }
                />
                <Input
                  label="Nome impresso no cartão"
                  autoComplete="cc-name"
                  required
                  containerClassName="sm:col-span-2"
                  {...form.register('cardName')}
                />
                <Input
                  label="Validade"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  required
                  {...form.register('cardExpiry')}
                  onChange={(changeEvent) =>
                    form.setField('cardExpiry', maskExpiry(changeEvent.target.value))
                  }
                />
                <Input
                  label="CVV"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  required
                  {...form.register('cardCvv')}
                  onChange={(changeEvent) =>
                    form.setField('cardCvv', onlyDigits(changeEvent.target.value).slice(0, 4))
                  }
                />
                <Select
                  label="Parcelamento"
                  options={installmentOptions}
                  containerClassName="sm:col-span-2"
                  {...form.register('installments')}
                />
              </div>
            ) : (
              <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed bg-slate-50 p-6 text-center">
                <QrCode className="text-primary size-10" aria-hidden="true" />
                <p className="text-small text-ink font-semibold">
                  O QR code PIX será gerado ao confirmar
                </p>
                <p className="text-small text-muted max-w-sm">
                  O pagamento é aprovado na hora e seus ingressos são liberados em seguida.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:hidden">{confirmButton}</div>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <OrderSummary
          event={event}
          lines={summary.lines}
          subtotal={summary.subtotal}
          fee={summary.fee}
          total={summary.total}
          footer={<div className="hidden lg:block">{confirmButton}</div>}
        />
        <p className="text-caption text-muted flex items-center justify-center gap-2">
          <ShieldCheck className="text-success size-4" aria-hidden="true" />
          Pagamento protegido com criptografia de ponta a ponta
        </p>
      </aside>
    </div>
  )
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { eventId } = useParams()
  const { status, data: event, error, reload } = useEvent(eventId)
  const [order, setOrder] = useState<Order | null>(null)

  if (order && event) return <PurchaseSuccess order={order} event={event} />

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        {event && (
          <Link
            to={ROUTES.event(event.id)}
            className="focus-ring text-small text-muted hover:text-ink inline-flex w-fit items-center gap-1.5 rounded font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para o evento
          </Link>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-h1 text-ink">Finalizar compra</h1>
          <CheckoutSteps current={1} />
        </div>
      </div>

      {status === 'loading' && <CheckoutSkeleton />}
      {status === 'error' && <ErrorState message={error} onRetry={reload} />}
      {status === 'success' && event && <CheckoutForm event={event} onSuccess={setOrder} />}
    </div>
  )
}
