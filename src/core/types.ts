export interface AutoDevResponse<T> {
  data: T
  meta: {
    requestId: string
    tier: string
    usage?: { remaining: number }
  }
}

export interface AutoDevClientOptions {
  apiKey: string
  org?: string
  baseUrl?: string
}

export interface ListingsFilters {
  make?: string
  model?: string
  year?: number
  yearMin?: number
  yearMax?: number
  zip?: string
  radius?: number
  priceMin?: number
  priceMax?: number
  mileageMax?: number
  page?: number
  limit?: number
}

export interface PaymentOptions {
  downPayment?: number
  loanTerm?: number
  creditScore?: number
  zip?: string
}

export interface AprOptions {
  creditScore?: number
  zip?: string
}

export interface TaxOptions {
  zip: string
}
