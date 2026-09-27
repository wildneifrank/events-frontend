import { Badge, PriceDisplay, QuantitySelector } from '@/components/ui'
import type { Tone } from '@/constants/status'
import {
  MAX_TICKETS_PER_ORDER,
  type Selection,
  selectionCount,
} from '@/features/checkout/selection'
import type { TicketBatch } from '@/types'
import { cn } from '@/utils/cn'
import {
  type BatchAvailability,
  batchAvailability,
  batchRemaining,
  isBatchPurchasable,
} from '@/utils/event'
import { formatDate, formatNumber } from '@/utils/format'

const AVAILABILITY: Record<BatchAvailability, { label: string; tone: Tone }> = {
  available: { label: 'Disponível', tone: 'success' },
  'last-units': { label: 'Últimas unidades', tone: 'warning' },
  'sold-out': { label: 'Esgotado', tone: 'neutral' },
  'not-started': { label: 'Em breve', tone: 'info' },
  ended: { label: 'Encerrado', tone: 'neutral' },
}

interface BatchSelectorProps {
  batches: TicketBatch[]
  selection: Selection
  onChange: (selection: Selection) => void
}

export function BatchSelector({ batches, selection, onChange }: BatchSelectorProps) {
  const total = selectionCount(selection)

  return (
    <ul className="flex flex-col gap-3" aria-label="Lotes de ingressos">
      {batches.map((batch) => {
        const status = batchAvailability(batch)
        const purchasable = isBatchPurchasable(batch)
        const quantity = selection[batch.id] ?? 0
        const remaining = batchRemaining(batch)
        const max = Math.min(remaining, quantity + (MAX_TICKETS_PER_ORDER - total))
        const meta = AVAILABILITY[status]

        return (
          <li
            key={batch.id}
            className={cn(
              'flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors',
              quantity > 0 ? 'border-primary bg-primary-50/50' : 'border-border bg-surface',
              !purchasable && 'bg-slate-50',
            )}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn('text-h4', purchasable ? 'text-ink' : 'text-muted')}>
                  {batch.name}
                </h3>
                <Badge tone={meta.tone} dot>
                  {meta.label}
                </Badge>
              </div>
              {batch.description && <p className="text-small text-muted">{batch.description}</p>}
              <PriceDisplay
                value={batch.price}
                size="md"
                className={cn(!purchasable && 'opacity-60')}
              />
              {status === 'last-units' && (
                <p className="text-caption text-amber-700">
                  Restam {formatNumber(remaining)} ingressos
                </p>
              )}
              {status === 'not-started' && (
                <p className="text-caption text-muted">
                  Vendas a partir de {formatDate(batch.startsAt)}
                </p>
              )}
            </div>
            {purchasable && (
              <QuantitySelector
                label={batch.name}
                value={quantity}
                max={Math.max(max, quantity)}
                onChange={(value) => onChange({ ...selection, [batch.id]: value })}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
