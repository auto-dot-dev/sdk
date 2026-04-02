import { Command } from 'commander'
import { getValidToken } from '../auth/oauth'

const BASE_URL = process.env.AUTODEV_BASE_URL ?? 'https://api.auto.dev'

async function getApiKey(options: Record<string, string>): Promise<string> {
  const apiKey =
    options.apiKey ??
    process.env.AUTODEV_API_KEY ??
    await getValidToken()

  if (!apiKey) {
    console.error('No API key found. Set AUTODEV_API_KEY or run: auto login')
    process.exit(1)
  }

  return apiKey as string
}

async function apiGet(path: string, apiKey: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`
  if (process.env.DEBUG) {
    console.error(`[DEBUG] GET ${url}`)
    console.error(`[DEBUG] Token: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`)
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    const errorMsg = typeof body?.error === 'string' ? body.error : typeof body?.message === 'string' ? body.message : JSON.stringify(body)
    throw new Error(`API error ${response.status}: ${errorMsg}`)
  }
  return response.json()
}

function formatOutput(data: unknown, format: string): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }
  if (format === 'yaml') {
    return toYaml(data, 0)
  }
  // table / default
  if (Array.isArray(data)) {
    if (data.length === 0) return '(no results)'
    const keys = Object.keys(data[0] as object)
    const rows = (data as Record<string, unknown>[]).map((row) =>
      keys.map((k) => String(row[k] ?? '')).join('\t'),
    )
    return [keys.join('\t'), ...rows].join('\n')
  }
  return JSON.stringify(data, null, 2)
}

function toYaml(obj: unknown, indent: number): string {
  const pad = ' '.repeat(indent)
  if (obj === null || obj === undefined) return `${pad}null`
  if (typeof obj === 'string') return `${pad}${obj}`
  if (typeof obj === 'number' || typeof obj === 'boolean') return `${pad}${obj}`
  if (Array.isArray(obj)) {
    return obj.map((item) => `${pad}- ${toYaml(item, 0).trimStart()}`).join('\n')
  }
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${toYaml(v, indent + 2)}`
        }
        return `${pad}${k}: ${v}`
      })
      .join('\n')
  }
  return `${pad}${String(obj)}`
}

function outputOptions(cmd: Command): Command {
  return cmd
    .option('--json', 'Output as JSON')
    .option('--table', 'Output as table (default)')
    .option('--yaml', 'Output as YAML')
    .option('--api-key <key>', 'API key (overrides stored credentials)')
}

function getFormat(options: Record<string, unknown>): string {
  if (options.json) return 'json'
  if (options.yaml) return 'yaml'
  return 'table'
}

export function buildApiCommands(): Command[] {
  const commands: Command[] = []

  // decode
  const decode = outputOptions(
    new Command('decode')
      .description('Decode a VIN — returns make, model, year, trim, engine, drivetrain')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/vin/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(decode)

  // photos
  const photos = outputOptions(
    new Command('photos')
      .description('Get vehicle photos by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/photos/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(photos)

  // listings
  const listings = outputOptions(
    new Command('listings')
      .description('Search vehicle listings with filters'),
  )
    .option('--make <make>', 'Vehicle make')
    .option('--model <model>', 'Vehicle model')
    .option('--year <year>', 'Model year')
    .option('--zip <zip>', 'ZIP code')
    .option('--price <price>', 'Price filter')
    .option('--miles <miles>', 'Mileage filter')
    .option('--sort <sort>', 'Sort (e.g. "price:asc", "year:desc")')
    .option('--limit <limit>', 'Results per page')
    .action(async (options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.make) params.set('vehicle.make', options.make)
      if (options.model) params.set('vehicle.model', options.model)
      if (options.year) params.set('vehicle.year', options.year)
      if (options.zip) params.set('zip', options.zip)
      if (options.price) params.set('retailListing.price', options.price)
      if (options.miles) params.set('retailListing.miles', options.miles)
      if (options.sort) params.set('sort', options.sort)
      if (options.limit) params.set('limit', options.limit)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/listings${query}`, apiKey)
      console.log(formatOutput(data, getFormat(options)))
    })
  commands.push(listings)

  // specs
  const specs = outputOptions(
    new Command('specs')
      .description('Get detailed vehicle specifications by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/specs/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(specs)

  // build
  const build = outputOptions(
    new Command('build')
      .description('Get OEM build and trim data by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/build/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(build)

  // recalls
  const recalls = outputOptions(
    new Command('recalls')
      .description('Get safety recalls by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/recalls/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(recalls)

  // payments
  const payments = outputOptions(
    new Command('payments')
      .description('Calculate monthly payments by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  )
    .option('--down-payment <amount>', 'Down payment amount')
    .option('--term <months>', 'Loan term in months')
    .option('--credit-score <score>', 'Credit score')
    .option('--zip <zip>', 'ZIP code')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.downPayment) params.set('downPayment', options.downPayment)
      if (options.term) params.set('term', options.term)
      if (options.creditScore) params.set('creditScore', options.creditScore)
      if (options.zip) params.set('zip', options.zip)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/payments/${vin}${query}`, apiKey)
      console.log(formatOutput(data, getFormat(options)))
    })
  commands.push(payments)

  // apr
  const apr = outputOptions(
    new Command('apr')
      .description('Get interest rates by VIN and credit profile')
      .argument('<vin>', 'Vehicle Identification Number'),
  )
    .option('--credit-score <score>', 'Credit score')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.creditScore) params.set('credit_score', options.creditScore)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/apr/${vin}${query}`, apiKey)
      console.log(formatOutput(data, getFormat(options)))
    })
  commands.push(apr)

  // tco
  const tco = outputOptions(
    new Command('tco')
      .description('Calculate total cost of ownership by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/tco/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(tco)

  // open-recalls
  const openRecalls = outputOptions(
    new Command('open-recalls')
      .description('Get open/unresolved recalls by VIN')
      .argument('<vin>', 'Vehicle Identification Number'),
  ).action(async (vin, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/openrecalls/${vin}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(openRecalls)

  // plate
  const plate = outputOptions(
    new Command('plate')
      .description('Resolve a license plate to a VIN')
      .argument('<state>', 'Two-letter state abbreviation')
      .argument('<number>', 'License plate number'),
  ).action(async (state, number, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/plate/${state}/${number}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(plate)

  // taxes
  const taxes = outputOptions(
    new Command('taxes')
      .description('Estimate taxes and fees by VIN and ZIP code')
      .argument('<vin>', 'Vehicle Identification Number'),
  )
    .option('--zip <zip>', 'ZIP code for tax jurisdiction')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.zip) params.set('zip', options.zip)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/taxes/${vin}${query}`, apiKey)
      console.log(formatOutput(data, getFormat(options)))
    })
  commands.push(taxes)

  return commands
}
