import { env } from '@/config/env'

import { authHttpService } from './api/httpServices'
import type { AuthService } from './contracts'
import { authMockService } from './mocks/mockServices'

/** Resolved by VITE_USE_MOCKS — pages never import a concrete implementation. */
export const authService: AuthService = env.useMocks ? authMockService : authHttpService
