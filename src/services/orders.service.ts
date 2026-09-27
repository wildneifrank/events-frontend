import { env } from '@/config/env'

import { ordersHttpService } from './api/httpServices'
import type { OrdersService } from './contracts'
import { ordersMockService } from './mocks/mockServices'

/** Resolved by VITE_USE_MOCKS — pages never import a concrete implementation. */
export const ordersService: OrdersService = env.useMocks ? ordersMockService : ordersHttpService
