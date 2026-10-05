import { env } from '@/config/env'

import { eventsHttpService } from './api/httpServices'
import type { EventsService } from './contracts'
import { eventsMockService } from './mocks/mockServices'

export const eventsService: EventsService = env.useMocks ? eventsMockService : eventsHttpService
