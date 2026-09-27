import { env } from '@/config/env'

import { eventsHttpService } from './api/httpServices'
import type { EventsService } from './contracts'
import { eventsMockService } from './mocks/mockServices'

/** Resolved by VITE_USE_MOCKS — pages never import a concrete implementation. */
export const eventsService: EventsService = env.useMocks ? eventsMockService : eventsHttpService
