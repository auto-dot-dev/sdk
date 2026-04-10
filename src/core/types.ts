export interface AutoDevResponse<T> {
  data: T
  meta: {
    requestId: string
    tier: string
    usage?: { remaining: number }
  }
}

export interface AutoDevClientOptions {
  apiKey?: string | (() => Promise<string>)
  org?: string
  baseUrl?: string
  raw?: boolean
}

// Re-export generated param types under SDK-friendly names
export type { AprVinParams as AprOptions, ListingsVinParams as ListingsFilters, PaymentsVinParams as PaymentOptions, RecallsVinParams as RecallsOptions, TaxesVinParams as TaxOptions, TcoVinParams as TcoOptions, TransportVinParams as TransportOptions } from './types.generated'
