import { getValidToken } from './oauth'
import type { ClientType } from '../core/types'

export async function resolveAuth(options?: { apiKey?: string; clientType?: ClientType }): Promise<string> {
  const apiKey =
    options?.apiKey ??
    process.env.AUTODEV_API_KEY ??
    await getValidToken(options?.clientType ?? 'cli')

  if (!apiKey) {
    throw new Error('No API key found. Set AUTODEV_API_KEY or run: auto login')
  }

  return apiKey as string
}
