import { env } from '@/config/env'

import { ticketsHttpService } from './api/httpServices'
import type { TicketsService } from './contracts'
import { ticketsMockService } from './mocks/mockServices'

export const ticketsService: TicketsService = env.useMocks ? ticketsMockService : ticketsHttpService
