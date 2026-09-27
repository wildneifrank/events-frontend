/** Service fee charged on top of the ticket subtotal. The backend is the source of truth. */
export const SERVICE_FEE_RATE = 0.1

const round = (value: number) => Math.round(value * 100) / 100

export function orderTotals(subtotal: number) {
  const fee = round(subtotal * SERVICE_FEE_RATE)
  return { subtotal: round(subtotal), fee, total: round(subtotal + fee) }
}
