export interface ApiKeyAuthOptions {
  apiKey: string
  org?: string
}

export function createAuthHeaders(options: ApiKeyAuthOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.apiKey}`,
  }

  if (options.org) {
    headers['x-org'] = options.org
  }

  return headers
}
