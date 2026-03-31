import { CANONICAL_AUTH_ORIGIN } from 'id.org.ai/auth'

export const AUTO_DEV_CLI_CLIENT_ID = 'auto_dev_cli'

export interface AuthConfig {
  apiKey?: string
  org?: string
  idOrgAiUrl?: string
  clientId?: string
}

export const DEFAULT_AUTH_CONFIG = {
  idOrgAiUrl: CANONICAL_AUTH_ORIGIN,
  apiBaseUrl: 'https://api.auto.dev',
  clientId: AUTO_DEV_CLI_CLIENT_ID,
} as const
