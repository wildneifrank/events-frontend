const LOCALE = 'pt-BR'
const TIME_ZONE = 'America/Fortaleza'

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL' })
const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const integer = new Intl.NumberFormat(LOCALE)
const percent = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

function dateFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options })
}

const longDate = dateFormatter({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
const mediumDate = dateFormatter({ day: '2-digit', month: 'short', year: 'numeric' })
const shortDate = dateFormatter({ day: '2-digit', month: '2-digit', year: 'numeric' })
const time = dateFormatter({ hour: '2-digit', minute: '2-digit' })
const day = dateFormatter({ day: '2-digit' })
const monthShort = dateFormatter({ month: 'short' })
const weekdayShort = dateFormatter({ weekday: 'short' })

export const formatCurrency = (value: number) => currency.format(value)
export const formatCompactCurrency = (value: number) => compactCurrency.format(value)
export const formatNumber = (value: number) => integer.format(value)
export const formatPercent = (value: number) => percent.format(value)

const capitalizeFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export const formatLongDate = (iso: string) => capitalizeFirst(longDate.format(new Date(iso)))
export const formatDate = (iso: string) => mediumDate.format(new Date(iso)).replace('.', '')
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))
export const formatTime = (iso: string) => time.format(new Date(iso))
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`
export const formatWeekday = (iso: string) =>
  weekdayShort.format(new Date(iso)).replace('.', '').toUpperCase()

/** Parts used by the calendar-style date badge: { day: '12', month: 'OUT' } */
export function dateBadgeParts(iso: string) {
  const date = new Date(iso)
  return {
    day: day.format(date),
    month: monthShort.format(date).replace('.', '').toUpperCase(),
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}
