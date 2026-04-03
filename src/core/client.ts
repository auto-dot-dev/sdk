import { createAuthHeaders } from '../auth/api-key'
import { AutoDevError, type AutoDevErrorCode } from '../errors'
import { ENDPOINTS, type EndpointDefinition } from './endpoints'
import { stripMetadata, resolveRaw } from './strip'
import { loadConfig } from './config'
import type { AutoDevClientOptions, AutoDevResponse } from './types'

export { ENDPOINTS } from './endpoints'
export type { AutoDevClientOptions, AutoDevResponse } from './types'

interface RequestParams {
  vin?: string
  state?: string
  number?: string
  plate?: string
  query?: Record<string, string>
  raw?: boolean
}

export class AutoDevClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly org?: string
  private readonly raw?: boolean

  constructor(options: AutoDevClientOptions) {
    this.apiKey = options.apiKey
    this.org = options.org
    this.baseUrl = options.baseUrl ?? 'https://api.auto.dev'
    this.raw = options.raw
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
      const errorBody = body as { error?: string; suggestion?: string; upgradeLink?: string }
      const code = this.statusToCode(response.status)
      const suggestion = this.getSuggestion(response.status, definition.tier, errorBody.upgradeLink)
      throw new AutoDevError(response.status, code, errorBody.error ?? response.statusText, suggestion)
    }

    const rawData = (await response.json()) as T
    const config = loadConfig()
    const isRaw = resolveRaw({
      perRequest: params?.raw,
      consumer: this.raw,
      config: config.raw,
    })
    const data = isRaw ? rawData : stripMetadata(rawData as Record<string, unknown>) as T

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
    if (params?.number || params?.plate) {
      path = path.replace('{number}', params.plate ?? params.number!)
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
      case 402:
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

  private getSuggestion(status: number, tier: string, upgradeLink?: string): string | undefined {
    if (status === 401) return 'Check your API key at auto.dev/dashboard/api-keys'
    if (status === 402 || status === 403) {
      const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
      const link = upgradeLink ?? `https://auto.dev/pricing?tier=${tierName}`
      return `This endpoint requires a ${tierName} plan. Upgrade at ${link} | Manage account: https://auto.dev/dashboard`
    }
    if (status === 429) return 'Rate limit exceeded. Wait and retry, or upgrade your plan for higher limits.'
    return undefined
  }
}
