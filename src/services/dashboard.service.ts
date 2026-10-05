import { env } from '@/config/env'

import { dashboardHttpService } from './api/httpServices'
import type { DashboardService } from './contracts'
import { dashboardMockService } from './mocks/mockServices'

export const dashboardService: DashboardService = env.useMocks
  ? dashboardMockService
  : dashboardHttpService
