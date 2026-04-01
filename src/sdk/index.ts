import { AutoDevClient } from '../core/client'
import type { AutoDevClientOptions, AutoDevResponse, ListingsFilters, PaymentOptions, AprOptions, TaxOptions } from '../core/types'

export class AutoDev {
  private readonly client: AutoDevClient

  constructor(options: AutoDevClientOptions) {
    this.client = new AutoDevClient(options)
  }

  async decode(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('decode', { vin })
  }

  async photos(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('photos', { vin })
  }

  async listings(filters?: ListingsFilters): Promise<AutoDevResponse<unknown>> {
    const query = filters
      ? Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('listings', { query })
  }

  async specs(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('specs', { vin })
  }

  async build(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('build', { vin })
  }

  async recalls(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('recalls', { vin })
  }

  async payments(vin: string, options?: PaymentOptions): Promise<AutoDevResponse<unknown>> {
    const query = options
      ? Object.fromEntries(Object.entries(options).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('payments', { vin, query })
  }

  async apr(vin: string, options?: AprOptions): Promise<AutoDevResponse<unknown>> {
    const query = options
      ? Object.fromEntries(Object.entries(options).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('apr', { vin, query })
  }

  async tco(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('tco', { vin })
  }

  async openRecalls(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('openRecalls', { vin })
  }

  async plate(state: string, number: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('plate', { state, number })
  }

  async taxes(vin: string, options: TaxOptions): Promise<AutoDevResponse<unknown>> {
    const query: Record<string, string> = {}
    if (options.zip !== undefined) query['zip'] = options.zip
    return this.client.request('taxes', { vin, query })
  }

  async usage(): Promise<AutoDevResponse<unknown>> {
    return this.client.request('usage')
  }
}
