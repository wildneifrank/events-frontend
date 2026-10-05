import { CreditCard, QrCode } from 'lucide-react'

import type { PaymentMethod } from '@/types'
import { cn } from '@/utils/cn'

const METHODS: {
  value: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
}[] = [
  {
    value: 'card',
    label: 'Cartão de crédito',
    description: 'Em até 6x sem juros',
    icon: CreditCard,
  },
  { value: 'pix', label: 'PIX', description: 'Aprovação imediata', icon: QrCode },
]

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Forma de pagamento</legend>
      {METHODS.map(({ value: method, label, description, icon: Icon }) => {
        const checked = value === method
        return (
          <label
            key={method}
            className={cn(
              'relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
              'has-[:focus-visible]:ring-primary/20 has-[:focus-visible]:ring-4',
              checked ? 'border-primary bg-primary-50/60' : 'border-border hover:border-slate-300',
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={method}
              checked={checked}
              onChange={() => onChange(method)}
              className="sr-only"
            />
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                checked ? 'bg-primary text-white' : 'text-muted bg-slate-100',
              )}
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-small text-ink font-semibold">{label}</span>
              <span className="text-caption text-muted">{description}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'ml-auto flex size-5 items-center justify-center rounded-full border-2',
                checked ? 'border-primary' : 'border-slate-300',
              )}
            >
              {checked && <span className="bg-primary size-2.5 rounded-full" />}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
