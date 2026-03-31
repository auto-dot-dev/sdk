export interface EndpointDefinition {
  name: string
  method: 'GET' | 'POST'
  path: string
  tier: 'starter' | 'growth' | 'scale' | 'auth'
  description: string
  vinRequired: boolean
}

export const ENDPOINTS: Record<string, EndpointDefinition> = {
  decode: {
    name: 'decode',
    method: 'GET',
    path: '/vin/{vin}',
    tier: 'starter',
    description: 'Decode a VIN — returns make, model, year, trim, engine, drivetrain',
    vinRequired: true,
  },
  photos: {
    name: 'photos',
    method: 'GET',
    path: '/photos/{vin}',
    tier: 'starter',
    description: 'Get vehicle photos by VIN',
    vinRequired: true,
  },
  listings: {
    name: 'listings',
    method: 'GET',
    path: '/listings',
    tier: 'starter',
    description: 'Search vehicle listings with filters (make, model, year, zip, price, mileage)',
    vinRequired: false,
  },
  specs: {
    name: 'specs',
    method: 'GET',
    path: '/specs/{vin}',
    tier: 'growth',
    description: 'Get detailed vehicle specifications by VIN',
    vinRequired: true,
  },
  build: {
    name: 'build',
    method: 'GET',
    path: '/build/{vin}',
    tier: 'growth',
    description: 'Get OEM build and trim data by VIN',
    vinRequired: true,
  },
  recalls: {
    name: 'recalls',
    method: 'GET',
    path: '/recalls/{vin}',
    tier: 'growth',
    description: 'Get safety recalls by VIN',
    vinRequired: true,
  },
  payments: {
    name: 'payments',
    method: 'GET',
    path: '/payments/{vin}',
    tier: 'growth',
    description: 'Calculate monthly payments with down payment, loan term, and credit score',
    vinRequired: true,
  },
  apr: {
    name: 'apr',
    method: 'GET',
    path: '/apr/{vin}',
    tier: 'growth',
    description: 'Get interest rates by VIN and credit profile',
    vinRequired: true,
  },
  tco: {
    name: 'tco',
    method: 'GET',
    path: '/tco/{vin}',
    tier: 'growth',
    description: 'Calculate total cost of ownership by VIN',
    vinRequired: true,
  },
  openRecalls: {
    name: 'openRecalls',
    method: 'GET',
    path: '/openrecalls/{vin}',
    tier: 'scale',
    description: 'Get open/unresolved recalls by VIN',
    vinRequired: true,
  },
  plate: {
    name: 'plate',
    method: 'GET',
    path: '/plate/{state}/{number}',
    tier: 'scale',
    description: 'Resolve a license plate to a VIN (state + plate number)',
    vinRequired: false,
  },
  taxes: {
    name: 'taxes',
    method: 'GET',
    path: '/taxes/{vin}',
    tier: 'scale',
    description: 'Estimate taxes and fees by VIN and ZIP code',
    vinRequired: true,
  },
  usage: {
    name: 'usage',
    method: 'GET',
    path: '/usage',
    tier: 'auth',
    description: 'Get account usage statistics',
    vinRequired: false,
  },
} as const
