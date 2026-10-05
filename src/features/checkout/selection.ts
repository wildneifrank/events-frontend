import type { Event, PurchaseItem } from '@/types'
import { batchRemaining, isBatchPurchasable } from '@/utils/event'
import { orderTotals } from '@/utils/pricing'

export const MAX_TICKETS_PER_ORDER = 10

export type Selection = Record<string, number>

export function serializeSelection(selection: Selection): string {
  return Object.entries(selection)
    .filter(([, quantity]) => quantity > 0)
    .map(([batchId, quantity]) => `${batchId}:${quantity}`)
    .join(',')
}

export function parseSelection(raw: string | null): Selection {
  const selection: Selection = {}
  for (const pair of raw?.split(',') ?? []) {
    const [id, quantity] = pair.split(':')
    const amount = Number(quantity)
    if (id && amount > 0) selection[id] = Math.min(amount, MAX_TICKETS_PER_ORDER)
  }
  return selection
}

export function selectionCount(selection: Selection): number {
  return Object.values(selection).reduce((sum, quantity) => sum + quantity, 0)
}

export interface SelectionLine {
  batchId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export function resolveSelection(event: Event, selection: Selection) {
  const lines: SelectionLine[] = event.batches
    .filter((batch) => (selection[batch.id] ?? 0) > 0 && isBatchPurchasable(batch))
    .map((batch) => {
      const quantity = Math.min(selection[batch.id] ?? 0, batchRemaining(batch))
      return {
        batchId: batch.id,
        name: batch.name,
        unitPrice: batch.price,
        quantity,
        lineTotal: batch.price * quantity,
      }
    })
    .filter((line) => line.quantity > 0)

  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0)
  const totals = orderTotals(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const items: PurchaseItem[] = lines.map((line) => ({
    batchId: line.batchId,
    quantity: line.quantity,
  }))

  return { lines, quantity, items, ...totals }
}
