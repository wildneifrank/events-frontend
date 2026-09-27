import { env } from '@/config/env'

export const BRAND = {
  name: env.appName,
  tagline: 'Ingressos para experiências inesquecíveis',
  supportEmail: 'suporte@eventflow.com.br',
} as const
