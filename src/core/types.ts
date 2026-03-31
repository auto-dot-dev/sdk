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
  // Vehicle facets
  make?: string
  model?: string
  trim?: string
  year?: number | string
  bodyStyle?: string
  exteriorColor?: string
  interiorColor?: string
  fuel?: string
  drivetrain?: string
  transmission?: string
  engine?: string
  cylinders?: number | string
  series?: string
  // History facets
  accidents?: number | string
  owners?: number | string
  // Dealer/location facets
  dealers?: string
  states?: string
  cities?: string
  // Price / mileage filters
  price?: number | string
  prices?: number | string
  miles?: number | string
  mileage?: number | string
  // Geo
  zip?: string
  radius?: number
  // Sorting & pagination
  sort?: string
  page?: number
  limit?: number
}

export interface PaymentOptions {
  /** Credit score tier (e.g. "750", "680") */
  creditScore?: string
  zip?: string
  /** Loan term in months (default: 72) */
  term?: number
  downPayment?: number
  tradeIn?: number
  docFee?: number
  interestRate?: number
  /** Override vehicle price */
  price?: number
}

export interface AprOptions {
  creditScore?: string
  zip?: string
  vehicleAge?: string | number
  vehicleMileage?: string | number
  price?: number
  docFee?: number
  tradeIn?: number
  months?: number
  downPayment?: number
  rate?: number
}

export interface TaxOptions {
  zip?: string
  price?: number
  docFee?: number
  tradeIn?: number
  months?: number
  downPayment?: number
  rate?: number
}

export interface TcoOptions {
  zip?: string
  fromZip?: string
}
