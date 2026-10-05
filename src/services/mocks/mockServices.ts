import { PRICE_RANGES } from '@/constants/filters'
import {
  ApiError,
  type AuthSession,
  type Event,
  type EventInput,
  type Order,
  type Ticket,
  type TicketBatch,
  type User,
} from '@/types'
import {
  batchRemaining,
  eventMinPrice,
  eventSoldRatio,
  eventTicketsSold,
  isBatchPurchasable,
  isEventPast,
} from '@/utils/event'
import { createId } from '@/utils/id'
import { orderTotals } from '@/utils/pricing'

import { tokenStorage } from '../api/tokenStorage'
import type {
  AuthService,
  DashboardService,
  EventsService,
  OrdersService,
  TicketsService,
} from '../contracts'

import { createDailyBaseline, HISTORICAL_ORDERS, KPI_CHANGES } from './mockDashboard'
import { getDb, persist, settleProcessingTickets } from './mockDb'
import { buildTickets } from './mockOrders'
import { clone, daysFromNow, normalize, paginate, simulateNetwork, toDayKey } from './mockUtils'

const MAX_TICKETS_PER_ORDER = 10
const MOCK_TOKEN_PREFIX = 'mock.'

function currentUser(): User {
  const token = tokenStorage.token()
  const userId = token?.startsWith(MOCK_TOKEN_PREFIX) ? token.slice(MOCK_TOKEN_PREFIX.length) : null
  const user = getDb().users.find((item) => item.id === userId)
  if (!user) throw new ApiError('Sua sessão expirou. Entre novamente.', 401, 'UNAUTHENTICATED')
  return user
}

function requireAdmin(): User {
  const user = currentUser()
  if (user.role !== 'admin') throw new ApiError('Acesso restrito a administradores.', 403)
  return user
}

function createSession(user: User): AuthSession {
  return {
    user: clone(user),
    token: `${MOCK_TOKEN_PREFIX}${user.id}`,
    expiresAt: daysFromNow(7),
  }
}

function findEvent(id: string): Event {
  const event = getDb().events.find((item) => item.id === id)
  if (!event) throw new ApiError('Evento não encontrado.', 404, 'EVENT_NOT_FOUND')
  return event
}

function matchesSearch(event: Event, search: string): boolean {
  const haystack = normalize(
    [
      event.title,
      event.summary,
      event.venue.name,
      event.venue.city,
      event.organizer.name,
      ...event.tags,
    ].join(' '),
  )
  return normalize(search)
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}

function toBatches(input: EventInput, previous: TicketBatch[] = []): TicketBatch[] {
  return input.batches.map((batch) => {
    const existing = previous.find((item) => item.id === batch.id)
    const sold = existing?.sold ?? 0
    return {
      id: existing?.id ?? createId('bat'),
      name: batch.name.trim(),
      price: batch.price,
      quantity: Math.max(batch.quantity, sold),
      sold,
      startsAt: batch.startsAt,
      endsAt: batch.endsAt,
    }
  })
}

export const eventsMockService: EventsService = {
  async getEvents(query = {}) {
    await simulateNetwork()
    const { search, category, city, from, priceRange, sort = 'relevance', featured } = query
    const status = query.status ?? 'published'
    const range = PRICE_RANGES.find((item) => item.value === priceRange)
    const fromTime = from ? new Date(from).getTime() : null

    const filtered = getDb().events.filter((event) => {
      if (status !== 'all' && event.status !== status) return false
      if (status === 'published' && isEventPast(event)) return false
      if (featured && !event.featured) return false
      if (category && event.category !== category) return false
      if (city && event.venue.city !== city) return false
      if (fromTime && new Date(event.startsAt).getTime() < fromTime) return false
      if (search?.trim() && !matchesSearch(event, search.trim())) return false
      if (range) {
        const price = eventMinPrice(event)
        if (price < range.min || price > range.max) return false
      }
      return true
    })

    const sorters: Record<typeof sort, (a: Event, b: Event) => number> = {
      relevance: (a, b) =>
        Number(b.featured) - Number(a.featured) || eventSoldRatio(b) - eventSoldRatio(a),
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      date: (a, b) => a.startsAt.localeCompare(b.startsAt),
      'price-asc': (a, b) => eventMinPrice(a) - eventMinPrice(b),
      'price-desc': (a, b) => eventMinPrice(b) - eventMinPrice(a),
    }
    filtered.sort(sorters[sort])

    return clone(paginate(filtered, query.page, query.pageSize ?? 12))
  },

  async getEventById(id) {
    await simulateNetwork()
    return clone(findEvent(id))
  },

  async getEventCities() {
    await simulateNetwork()
    const cities = getDb()
      .events.filter((event) => event.status === 'published')
      .map((event) => event.venue.city)
    return [...new Set(cities)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },

  async createEvent(input) {
    await simulateNetwork()
    requireAdmin()
    const now = new Date().toISOString()
    const event: Event = {
      ...input,
      id: createId('evt'),
      tags: [],
      organizer: { name: 'EventFlow Produções', verified: true, eventsCount: 1 },
      batches: toBatches(input),
      createdAt: now,
      updatedAt: now,
    }
    getDb().events.unshift(event)
    persist()
    return clone(event)
  },

  async updateEvent(id, input) {
    await simulateNetwork()
    requireAdmin()
    const event = findEvent(id)
    Object.assign(event, input, {
      batches: toBatches(input, event.batches),
      updatedAt: new Date().toISOString(),
    })
    persist()
    return clone(event)
  },

  async deleteEvent(id) {
    await simulateNetwork()
    requireAdmin()
    const db = getDb()
    findEvent(id)
    db.events = db.events.filter((event) => event.id !== id)
    persist()
  },
}

const UPCOMING_GRACE_MS = 12 * 3_600_000

function isUpcomingTicket(ticket: Ticket, now = Date.now()): boolean {
  if (ticket.status === 'used' || ticket.status === 'cancelled') return false
  return new Date(ticket.eventStartsAt).getTime() + UPCOMING_GRACE_MS > now
}

export const ticketsMockService: TicketsService = {
  async getTickets(scope) {
    await simulateNetwork()
    const user = currentUser()
    settleProcessingTickets()
    const owned = getDb().tickets.filter((ticket) => ticket.holderEmail === user.email)
    const scoped = scope
      ? owned.filter((ticket) => isUpcomingTicket(ticket) === (scope === 'upcoming'))
      : owned
    const direction = scope === 'past' ? -1 : 1
    scoped.sort((a, b) => direction * a.eventStartsAt.localeCompare(b.eventStartsAt))
    return clone(scoped)
  },

  async getTicketById(id) {
    await simulateNetwork()
    const user = currentUser()
    settleProcessingTickets()
    const ticket = getDb().tickets.find((item) => item.id === id)
    if (!ticket || (ticket.holderEmail !== user.email && user.role !== 'admin')) {
      throw new ApiError('Ingresso não encontrado.', 404, 'TICKET_NOT_FOUND')
    }
    return clone(ticket)
  },

  async getAllTickets(query = {}) {
    await simulateNetwork()
    requireAdmin()
    settleProcessingTickets()
    const { search, status = 'all', eventId } = query
    const filtered = getDb()
      .tickets.filter((ticket) => {
        if (status !== 'all' && ticket.status !== status) return false
        if (eventId && ticket.eventId !== eventId) return false
        if (search?.trim()) {
          const haystack = normalize(
            `${ticket.code} ${ticket.holderName} ${ticket.holderEmail} ${ticket.eventTitle}`,
          )
          if (!haystack.includes(normalize(search.trim()))) return false
        }
        return true
      })
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    return clone(paginate(filtered, query.page, query.pageSize ?? 10))
  },
}

function nextOrderNumber(orders: Order[]): string {
  const highest = orders.reduce(
    (max, order) => Math.max(max, Number(order.number.slice(3)) || 0),
    1000,
  )
  return `EF-${highest + 1}`
}

export const ordersMockService: OrdersService = {
  async getOrders(query = {}) {
    await simulateNetwork()
    requireAdmin()
    const { status = 'all', eventId, from, search } = query
    const fromTime = from ? new Date(from).getTime() : null
    const filtered = getDb().orders.filter((order) => {
      if (status !== 'all' && order.status !== status) return false
      if (eventId && order.eventId !== eventId) return false
      if (fromTime && new Date(order.createdAt).getTime() < fromTime) return false
      if (search?.trim()) {
        const haystack = normalize(`${order.number} ${order.customerName} ${order.customerEmail}`)
        if (!haystack.includes(normalize(search.trim()))) return false
      }
      return true
    })
    return clone(paginate(filtered, query.page, query.pageSize ?? 10))
  },

  async getOrderById(id) {
    await simulateNetwork()
    const user = currentUser()
    const order = getDb().orders.find((item) => item.id === id)
    if (!order || (order.customerId !== user.id && user.role !== 'admin')) {
      throw new ApiError('Pedido não encontrado.', 404)
    }
    return clone(order)
  },

  async createPurchase(purchase) {
    await simulateNetwork()
    const user = currentUser()
    const db = getDb()
    const event = findEvent(purchase.eventId)

    if (event.status !== 'published' || isEventPast(event)) {
      throw new ApiError('As vendas para este evento estão encerradas.', 409, 'SALES_CLOSED')
    }

    const items = purchase.items.filter((item) => item.quantity > 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    if (totalQuantity === 0) throw new ApiError('Selecione ao menos um ingresso.', 422)
    if (totalQuantity > MAX_TICKETS_PER_ORDER) {
      throw new ApiError(`Limite de ${MAX_TICKETS_PER_ORDER} ingressos por pedido.`, 422)
    }

    const lines = items.map((item) => {
      const batch = event.batches.find((candidate) => candidate.id === item.batchId)
      if (!batch || !isBatchPurchasable(batch)) {
        throw new ApiError(
          'Um dos lotes selecionados não está mais disponível.',
          409,
          'BATCH_UNAVAILABLE',
        )
      }
      if (batchRemaining(batch) < item.quantity) {
        throw new ApiError(
          `Restam apenas ${batchRemaining(batch)} ingressos em "${batch.name}".`,
          409,
          'SOLD_OUT',
        )
      }
      return { batch, quantity: item.quantity }
    })

    lines.forEach(({ batch, quantity }) => {
      batch.sold += quantity
    })

    const now = new Date().toISOString()
    const number = nextOrderNumber(db.orders)
    const totals = orderTotals(
      lines.reduce((sum, { batch, quantity }) => sum + batch.price * quantity, 0),
    )
    const order: Order = {
      id: `ord_${number.slice(3)}`,
      number,
      customerId: user.id,
      customerName: purchase.buyer.name,
      customerEmail: user.email,
      eventId: event.id,
      eventTitle: event.title,
      items: lines.map(({ batch, quantity }) => ({
        batchId: batch.id,
        batchName: batch.name,
        unitPrice: batch.price,
        quantity,
      })),
      ...totals,
      payment: { ...purchase.payment, status: 'paid', paidAt: now },
      status: 'paid',
      createdAt: now,
    }

    const tickets = buildTickets(order, event, {
      name: purchase.buyer.name,
      email: user.email,
    }).map((ticket) => ({ ...ticket, status: 'processing' as const }))

    db.orders.unshift(order)
    db.tickets.push(...tickets)
    persist()

    return clone({ order, ticketIds: tickets.map((ticket) => ticket.id) })
  },
}

export const dashboardMockService: DashboardService = {
  async getDashboardStats() {
    await simulateNetwork()
    requireAdmin()
    const { events, orders } = getDb()
    const listed = events.filter((event) => event.status !== 'draft')

    const baseline = createDailyBaseline(7)
    const salesLast7Days = baseline.map((base, index) => {
      const date = daysFromNow(index - 6, '12:00')
      const key = toDayKey(date)
      const sameDay = orders.filter(
        (order) => order.status === 'paid' && toDayKey(order.createdAt) === key,
      )
      return {
        date,
        tickets:
          base.tickets +
          sameDay.reduce(
            (sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0),
            0,
          ),
        revenue: base.revenue + sameDay.reduce((sum, order) => sum + order.total, 0),
      }
    })

    const byCategory = new Map<Event['category'], number>()
    for (const event of listed) {
      byCategory.set(
        event.category,
        (byCategory.get(event.category) ?? 0) + eventTicketsSold(event),
      )
    }

    const ticketsSold = listed.reduce((sum, event) => sum + eventTicketsSold(event), 0)
    const revenue = listed.reduce(
      (sum, event) => sum + event.batches.reduce((acc, batch) => acc + batch.sold * batch.price, 0),
      0,
    )

    return {
      activeEvents: {
        value: events.filter((event) => event.status === 'published' && !isEventPast(event)).length,
        change: KPI_CHANGES.activeEvents,
      },
      ticketsSold: { value: ticketsSold, change: KPI_CHANGES.ticketsSold },
      revenue: { value: revenue, change: KPI_CHANGES.revenue },
      orders: { value: HISTORICAL_ORDERS + orders.length, change: KPI_CHANGES.orders },
      salesLast7Days,
      topEvents: listed
        .filter((event) => !isEventPast(event))
        .map((event) => ({
          eventId: event.id,
          title: event.title,
          ticketsSold: eventTicketsSold(event),
          revenue: event.batches.reduce((acc, batch) => acc + batch.sold * batch.price, 0),
        }))
        .sort((a, b) => b.ticketsSold - a.ticketsSold)
        .slice(0, 5),
      categoryDistribution: [...byCategory.entries()]
        .map(([category, tickets]) => ({ category, tickets }))
        .sort((a, b) => b.tickets - a.tickets),
    }
  },
}

export const authMockService: AuthService = {
  async login({ email, password }) {
    await simulateNetwork()
    const db = getDb()
    const normalizedEmail = email.trim().toLowerCase()
    const user = db.users.find((item) => item.email === normalizedEmail)
    if (!user || db.credentials[normalizedEmail] !== password) {
      throw new ApiError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS')
    }
    return createSession(user)
  },

  async register({ name, email, cpf, password }) {
    await simulateNetwork()
    const db = getDb()
    const normalizedEmail = email.trim().toLowerCase()
    if (db.users.some((user) => user.email === normalizedEmail)) {
      throw new ApiError('Já existe uma conta com este e-mail.', 409, 'EMAIL_TAKEN')
    }
    const user: User = {
      id: createId('usr'),
      name: name.trim(),
      email: normalizedEmail,
      cpf,
      role: 'customer',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    db.credentials[normalizedEmail] = password
    persist()
    return createSession(user)
  },

  async getCurrentUser() {
    await simulateNetwork()
    return clone(currentUser())
  },

  async updateProfile(changes) {
    await simulateNetwork()
    const user = currentUser()
    Object.assign(user, changes)
    persist()
    return clone(user)
  },

  async logout() {
    await simulateNetwork()
  },
}
