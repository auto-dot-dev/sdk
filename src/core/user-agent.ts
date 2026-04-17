import pkg from '../../package.json' with { type: 'json' }
import type { ClientType } from './types'

export const UA_MAJOR = Math.max(1, parseInt(pkg.version.split('.')[0] ?? '0', 10))

export function buildAuthHeaders(clientType: ClientType): Record<string, string> {
  return {
    'User-Agent': `auto.dev-${clientType}/${UA_MAJOR} (+https://auto.dev)`,
    'X-Client-Type': clientType,
  }
}
