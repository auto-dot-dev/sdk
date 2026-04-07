export interface AutoDevResponse<T> {
  data: T
  meta: {
    requestId: string
    tier: string
    usage?: { remaining: number }
  }
}

export interface AutoDevClientOptions {
  apiKey?: string
  org?: string
  baseUrl?: string
  raw?: boolean
}

// Re-export generated param types under SDK-friendly names
export type { ListingsVinParams as ListingsFilters } from './types.generated'
export type { PaymentsVinParams as PaymentOptions } from './types.generated'
export type { AprVinParams as AprOptions } from './types.generated'
export type { TaxesVinParams as TaxOptions } from './types.generated'
export type { TcoVinParams as TcoOptions } from './types.generated'
export type { TransportVinParams as TransportOptions } from './types.generated'
export type { RecallsVinParams as RecallsOptions } from './types.generated'
