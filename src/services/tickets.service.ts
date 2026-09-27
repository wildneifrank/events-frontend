import { env } from '@/config/env'

import { ticketsHttpService } from './api/httpServices'
import type { TicketsService } from './contracts'
import { ticketsMockService } from './mocks/mockServices'

/** Resolved by VITE_USE_MOCKS — pages never import a concrete implementation. */
export const ticketsService: TicketsService = env.useMocks ? ticketsMockService : ticketsHttpService
