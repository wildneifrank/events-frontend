import type { Event, Order, Ticket, User } from '@/types'

import { createMockEvents } from './mockEvents'
import { createMockOrdersAndTickets } from './mockOrders'
import { createMockCredentials, createMockUsers } from './mockUsers'

export interface MockDatabase {
  version: number
  seededAt: number
  users: User[]
  credentials: Record<string, string>
  events: Event[]
  orders: Order[]
  tickets: Ticket[]
}

const STORAGE_KEY = 'eventflow:mock-db'
const VERSION = 3
const MAX_SEED_AGE_MS = 3 * 86_400_000
export const TICKET_PROCESSING_MS = 8_000

let database: MockDatabase | null = null

function seed(): MockDatabase {
  const users = createMockUsers()
  const events = createMockEvents()
  const { orders, tickets } = createMockOrdersAndTickets(events, users)
  return {
    version: VERSION,
    seededAt: Date.now(),
    users,
    credentials: createMockCredentials(),
    events,
    orders,
    tickets,
  }
}

function load(): MockDatabase | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MockDatabase
    const fresh = Date.now() - parsed.seededAt < MAX_SEED_AGE_MS
    return parsed.version === VERSION && fresh ? parsed : null
  } catch {
    return null
  }
}

export function getDb(): MockDatabase {
  if (!database) {
    database = load() ?? seed()
    persist()
  }
  return database
}

export function persist(): void {
  if (!database) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
  } catch {
    return
  }
}

export function resetMockDb(): void {
  database = seed()
  persist()
}

export function settleProcessingTickets(now = Date.now()): void {
  const db = getDb()
  let changed = false
  for (const ticket of db.tickets) {
    if (
      ticket.status === 'processing' &&
      now - new Date(ticket.issuedAt).getTime() > TICKET_PROCESSING_MS
    ) {
      ticket.status = 'valid'
      ticket.pdfUrl = `#/tickets/${ticket.id}.pdf`
      changed = true
    }
  }
  if (changed) persist()
}
