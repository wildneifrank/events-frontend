import { env } from '@/config/env'

import { authHttpService } from './api/httpServices'
import type { AuthService } from './contracts'
import { authMockService } from './mocks/mockServices'

export const authService: AuthService = env.useMocks ? authMockService : authHttpService
