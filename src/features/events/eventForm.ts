import type { Event, EventCategory, EventInput, EventStatus } from '@/types'

/** Form model: flat strings so inputs stay controlled; converted to `EventInput` on submit. */
export interface BatchFormValues {
  key: string
  id?: string
  name: string
  price: string
  quantity: string
  startDate: string
  endDate: string
  sold: number
}

export interface EventFormValues {
  title: string
  summary: string
  description: string
  category: EventCategory | ''
  date: string
  startTime: string
  endTime: string
  venueName: string
  address: string
  city: string
  state: string
  bannerUrl: string
  status: EventStatus
  featured: boolean
  batches: BatchFormValues[]
}

export type EventFormErrors = Partial<Record<string, string>>

const TZ = '-03:00'
const pad = (value: number) => String(value).padStart(2, '0')

function localParts(iso: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

const toIso = (date: string, time: string) => new Date(`${date}T${time}:00${TZ}`).toISOString()

let keyCounter = 0
export const newBatchKey = () => `batch-${++keyCounter}`

export function emptyBatch(index: number): BatchFormValues {
  const today = new Date()
  return {
    key: newBatchKey(),
    name: `Lote ${index + 1}`,
    price: '',
    quantity: '',
    startDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    endDate: '',
    sold: 0,
  }
}

export function emptyEventForm(): EventFormValues {
  return {
    title: '',
    summary: '',
    description: '',
    category: '',
    date: '',
    startTime: '20:00',
    endTime: '23:00',
    venueName: '',
    address: '',
    city: '',
    state: '',
    bannerUrl: '',
    status: 'published',
    featured: false,
    batches: [emptyBatch(0)],
  }
}

export function eventToForm(event: Event): EventFormValues {
  const start = localParts(event.startsAt)
  const end = localParts(event.endsAt)
  return {
    title: event.title,
    summary: event.summary,
    description: event.description,
    category: event.category,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    venueName: event.venue.name,
    address: event.venue.address,
    city: event.venue.city,
    state: event.venue.state,
    bannerUrl: event.bannerUrl,
    status: event.status,
    featured: event.featured,
    batches: event.batches.map((batch) => ({
      key: newBatchKey(),
      id: batch.id,
      name: batch.name,
      price: String(batch.price),
      quantity: String(batch.quantity),
      startDate: localParts(batch.startsAt).date,
      endDate: localParts(batch.endsAt).date,
      sold: batch.sold,
    })),
  }
}

export function formToInput(values: EventFormValues): EventInput {
  const startsAt = toIso(values.date, values.startTime)
  let endsAt = toIso(values.date, values.endTime)
  // End time earlier than start means the event runs past midnight.
  if (endsAt <= startsAt) endsAt = new Date(new Date(endsAt).getTime() + 86_400_000).toISOString()

  return {
    title: values.title.trim(),
    summary: values.summary.trim() || values.description.trim().slice(0, 140),
    description: values.description.trim(),
    category: values.category as EventCategory,
    startsAt,
    endsAt,
    venue: {
      name: values.venueName.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
    },
    bannerUrl: values.bannerUrl,
    status: values.status,
    featured: values.featured,
    batches: values.batches.map((batch) => ({
      id: batch.id,
      name: batch.name.trim(),
      price: Number(batch.price.replace(',', '.')),
      quantity: Number(batch.quantity),
      startsAt: toIso(batch.startDate, '00:00'),
      endsAt: toIso(batch.endDate, '23:59'),
    })),
  }
}

export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {}
  if (values.title.trim().length < 3) errors.title = 'Informe um nome com pelo menos 3 caracteres.'
  if (values.description.trim().length < 20)
    errors.description = 'Descreva o evento com pelo menos 20 caracteres.'
  if (!values.category) errors.category = 'Selecione uma categoria.'
  if (!values.date) errors.date = 'Informe a data do evento.'
  if (!values.startTime) errors.startTime = 'Informe o horário.'
  if (!values.venueName.trim()) errors.venueName = 'Informe o local.'
  if (!values.address.trim()) errors.address = 'Informe o endereço.'
  if (!values.city.trim()) errors.city = 'Informe a cidade.'
  if (!/^[A-Za-z]{2}$/.test(values.state.trim())) errors.state = 'UF com 2 letras.'
  if (values.batches.length === 0) errors.batches = 'Adicione pelo menos um lote de ingressos.'

  values.batches.forEach((batch, index) => {
    const prefix = `batches.${index}`
    const price = Number(batch.price.replace(',', '.'))
    const quantity = Number(batch.quantity)
    if (!batch.name.trim()) errors[`${prefix}.name`] = 'Informe o nome.'
    if (batch.price === '' || Number.isNaN(price) || price < 0)
      errors[`${prefix}.price`] = 'Preço inválido.'
    if (!Number.isInteger(quantity) || quantity <= 0)
      errors[`${prefix}.quantity`] = 'Quantidade inválida.'
    else if (quantity < batch.sold)
      errors[`${prefix}.quantity`] = `Mínimo ${batch.sold} (já vendidos).`
    if (!batch.startDate) errors[`${prefix}.startDate`] = 'Informe o início.'
    if (!batch.endDate) errors[`${prefix}.endDate`] = 'Informe o fim.'
    else if (batch.startDate && batch.endDate < batch.startDate)
      errors[`${prefix}.endDate`] = 'Fim antes do início.'
    else if (values.date && batch.endDate > values.date)
      errors[`${prefix}.endDate`] = 'Após a data do evento.'
  })

  return errors
}
