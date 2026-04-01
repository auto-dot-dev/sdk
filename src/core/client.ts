import { ENDPOINTS, type EndpointDefinition } from './endpoints'
import type { AutoDevClientOptions, AutoDevResponse } from './types'
import { createAuthHeaders } from '../auth/api-key'
import { AutoDevError, type AutoDevErrorCode } from '../errors'

export { ENDPOINTS } from './endpoints'
export type { AutoDevClientOptions, AutoDevResponse } from './types'

interface RequestParams {
  vin?: string
  state?: string
  number?: string
  downPayment?: string
  loanTerm?: string
  creditScore?: string
  query?: Record<string, string>
}

export class AutoDevClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly org?: string

  constructor(options: AutoDevClientOptions) {
    this.apiKey = options.apiKey
    this.org = options.org
    this.baseUrl = options.baseUrl ?? 'https://api.auto.dev'
  }

  async request<T = unknown>(endpoint: string, params?: RequestParams): Promise<AutoDevResponse<T>> {
    const definition = (ENDPOINTS as Record<string, EndpointDefinition | undefined>)[endpoint]
    if (!definition) {
      throw new AutoDevError(400, 'INVALID_REQUEST', `Unknown endpoint: ${endpoint}`)
    }

    const url = this.buildUrl(definition.path, params)
    const headers = {
      ...createAuthHeaders({ apiKey: this.apiKey, org: this.org }),
      Accept: 'application/json',
    }

    const response = await fetch(url, { method: definition.method, headers })
    const requestId = response.headers.get('x-request-id') ?? ''

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }))
      const errorBody = body as { error?: string; suggestion?: string }
      const code = this.statusToCode(response.status)
      const suggestion = this.getSuggestion(response.status, definition.tier)
      throw new AutoDevError(response.status, code, errorBody.error ?? response.statusText, suggestion)
    }

    const data = (await response.json()) as T

    return {
      data,
      meta: {
        requestId,
        tier: definition.tier,
      },
    }
  }

  private buildUrl(pathTemplate: string, params?: RequestParams): string {
    let path = pathTemplate

    if (params?.vin) {
      path = path.replace('{vin}', params.vin)
    }
    if (params?.state) {
      path = path.replace('{state}', params.state)
    }
    if (params?.number) {
      path = path.replace('{number}', params.number)
    }

    const url = new URL(path, this.baseUrl)

    if (params?.query) {
      for (const [key, value] of Object.entries(params.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value)
        }
      }
    }

    return url.toString()
  }

  private statusToCode(status: number): AutoDevErrorCode {
    switch (status) {
      case 401:
        return 'UNAUTHORIZED'
      case 403:
        return 'PLAN_REQUIRED'
      case 404:
        return 'NOT_FOUND'
      case 429:
        return 'RATE_LIMITED'
      default:
        return 'SERVER_ERROR'
    }
  }

  private getSuggestion(status: number, tier: string): string | undefined {
    if (status === 401) return 'Check your API key at auto.dev/dashboard/api-keys'
    if (status === 403) return `This endpoint requires a ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan. Upgrade at auto.dev/pricing`
    if (status === 429) return 'Rate limit exceeded. Wait and retry, or upgrade your plan for higher limits.'
    return undefined
  }
}
