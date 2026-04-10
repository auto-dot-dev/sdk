import { getValidToken } from './oauth'

export async function resolveAuth(options?: { apiKey?: string }): Promise<string> {
  const apiKey =
    options?.apiKey ??
    process.env.AUTODEV_API_KEY ??
    await getValidToken()

  if (!apiKey) {
    throw new Error('No API key found. Set AUTODEV_API_KEY or run: auto login')
  }

  return apiKey as string
}
