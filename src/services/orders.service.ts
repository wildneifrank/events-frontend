import { env } from '@/config/env'

import { ordersHttpService } from './api/httpServices'
import type { OrdersService } from './contracts'
import { ordersMockService } from './mocks/mockServices'

export const ordersService: OrdersService = env.useMocks ? ordersMockService : ordersHttpService
