import { env } from '@/config/env'

import { dashboardHttpService } from './api/httpServices'
import type { DashboardService } from './contracts'
import { dashboardMockService } from './mocks/mockServices'

/** Resolved by VITE_USE_MOCKS — pages never import a concrete implementation. */
export const dashboardService: DashboardService = env.useMocks
  ? dashboardMockService
  : dashboardHttpService
