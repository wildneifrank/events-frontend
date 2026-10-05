import { Loader2 } from 'lucide-react'

import { LogoMark } from '@/components/layout/Logo'
import { StatusBadge } from '@/components/ui'
import { BRAND } from '@/constants/brand'
import type { Ticket } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency, formatLongDate, formatTime } from '@/utils/format'

import { QrCode } from './QrCode'

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <dt className="text-caption tracking-wider text-white/60 uppercase">{label}</dt>
      <dd className="text-small truncate font-semibold text-white">{value}</dd>
    </div>
  )
}

export function TicketPass({ ticket }: { ticket: Ticket }) {
  const processing = ticket.status === 'processing'
  const inactive = ticket.status === 'used' || ticket.status === 'cancelled'

  return (
    <article
      aria-label={`Ingresso ${ticket.code}`}
      className="shadow-elevated mx-auto w-full max-w-md overflow-hidden rounded-3xl"
    >
      <div className="bg-night relative overflow-hidden p-6 text-white">
        <div
          aria-hidden="true"
          className="bg-primary/40 absolute -top-24 -right-20 size-64 rounded-full blur-3xl"
        />
        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold">
            <LogoMark className="size-7" />
            {BRAND.name}
          </span>
          <span className="text-caption rounded-full bg-white/10 px-3 py-1 font-semibold tracking-wider uppercase">
            {ticket.batchName}
          </span>
        </div>

        <h2 className="text-h2 relative mt-6 text-white">{ticket.eventTitle}</h2>

        <dl className="relative mt-5 grid grid-cols-2 gap-4">
          <Detail
            label="Data"
            value={formatLongDate(ticket.eventStartsAt)}
            className="col-span-2"
          />
          <Detail label="Horário" value={formatTime(ticket.eventStartsAt)} />
          <Detail label="Valor" value={formatCurrency(ticket.price)} />
          <Detail
            label="Local"
            value={`${ticket.venueName} · ${ticket.venueCity}`}
            className="col-span-2"
          />
          <Detail label="Titular" value={ticket.holderName} className="col-span-2" />
        </dl>
      </div>

      <div className="bg-surface relative h-0" aria-hidden="true">
        <span className="bg-background absolute -top-3 -left-3 size-6 rounded-full" />
        <span className="bg-background absolute -top-3 -right-3 size-6 rounded-full" />
        <span className="border-border absolute inset-x-5 top-0 border-t-2 border-dashed" />
      </div>

      <div className="bg-surface flex flex-col items-center gap-4 px-6 pt-7 pb-6">
        <div className="relative">
          <QrCode
            value={ticket.code}
            className={cn(
              'border-border size-48 border p-2',
              (processing || inactive) && 'opacity-20 blur-[2px]',
            )}
          />
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <Loader2 className="text-primary size-7 animate-spin" aria-hidden="true" />
              <p className="text-small text-ink max-w-36 font-medium">Gerando QR code…</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-caption text-muted tracking-wider uppercase">Número do ingresso</p>
          <p className="text-ink font-mono text-lg font-bold tracking-wider">{ticket.code}</p>
          <StatusBadge kind="ticket" status={ticket.status} />
        </div>
      </div>
    </article>
  )
}
