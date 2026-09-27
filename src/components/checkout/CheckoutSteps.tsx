import { Check } from 'lucide-react'

import { cn } from '@/utils/cn'

const STEPS = ['Ingressos', 'Pagamento', 'Confirmação']

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Etapas da compra">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step}
            className="flex items-center gap-2 sm:gap-3"
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={cn(
                'text-caption flex size-7 items-center justify-center rounded-full font-bold',
                done && 'bg-primary text-white',
                active && 'bg-primary-50 text-primary-dark ring-primary ring-2',
                !done && !active && 'text-muted bg-slate-100',
              )}
            >
              {done ? <Check className="size-4" aria-label="Concluída" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-small font-semibold',
                active || done ? 'text-ink' : 'text-muted',
                !active && 'max-sm:hidden',
              )}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <span className="bg-border h-px w-6 sm:w-10" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
