import { Command } from 'commander'
import { getValidToken } from '../auth/oauth'
import { formatError, formatSuccess, brand, value, hint, label, red } from './colors'

const BASE_URL = process.env.AUTODEV_BASE_URL ?? 'https://api.auto.dev'

async function getApiKey(options: Record<string, string>): Promise<string> {
  const apiKey =
    options.apiKey ??
    process.env.AUTODEV_API_KEY ??
    await getValidToken()

  if (!apiKey) {
    console.error(formatError('No API key found', 'Set AUTODEV_API_KEY or run: auto login'))
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
  const start = Date.now()
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  })
  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    let errorMsg: string
    if (body?.error && typeof body.error === 'object' && body.error.error) {
      errorMsg = body.error.error
    } else if (typeof body?.error === 'string') {
      errorMsg = body.error
    } else if (typeof body?.message === 'string') {
      errorMsg = body.message
    } else {
      errorMsg = response.statusText
    }
    console.error(formatError(`${response.status}: ${errorMsg}`))
    process.exit(1)
  }
  // Extract endpoint name from path
  const endpoint = path.split('/').filter(Boolean)[0] ?? path
  console.error(formatSuccess(`${brand(endpoint)}  ${hint(String(response.status))}  ${hint(elapsed + 's')}`))
  console.error()
  return response.json()
}

function colorizeJson(json: string): string {
  return json.replace(/"([^"]+)":/g, (_, key) => `${value(`"${key}"`)}:`)
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
  return colorizeJson(JSON.stringify(data, null, 2))
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
    .option('--make <make>', 'Vehicle make (maps to vehicle.make)')
    .option('--model <model>', 'Vehicle model (maps to vehicle.model)')
    .option('--year <year>', 'Model year or range, e.g. 2024 or 2020-2024 (maps to vehicle.year)')
    .option('--trim <trim>', 'Trim level (maps to vehicle.trim)')
    .option('--body-style <style>', 'Body style, e.g. sedan, coupe (maps to vehicle.bodyStyle)')
    .option('--price <price>', 'Price range, e.g. 10000-30000 (maps to retailListing.price)')
    .option('--miles <miles>', 'Mileage range, e.g. 0-50000 (maps to retailListing.miles)')
    .option('--state <state>', 'State code, e.g. CA (maps to retailListing.state)')
    .option('--sort <sort>', 'Sort (e.g. "price:asc", "year:desc")')
    .option('--page <page>', 'Page number')
    .option('--limit <limit>', 'Results per page (1-100)')
    .action(async (options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.make) params.set('vehicle.make', options.make)
      if (options.model) params.set('vehicle.model', options.model)
      if (options.year) params.set('vehicle.year', options.year)
      if (options.trim) params.set('vehicle.trim', options.trim)
      if (options.bodyStyle) params.set('vehicle.bodyStyle', options.bodyStyle)
      if (options.price) params.set('retailListing.price', options.price)
      if (options.miles) params.set('retailListing.miles', options.miles)
      if (options.state) params.set('retailListing.state', options.state)
      if (options.sort) params.set('sort', options.sort)
      if (options.page) params.set('page', options.page)
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
    .option('--price <price>', 'Vehicle sales price')
    .option('--zip <zip>', 'ZIP code for tax/fee calculations')
    .option('--down-payment <amount>', 'Down payment amount')
    .option('--loan-term <months>', 'Loan term in months')
    .option('--doc-fee <fee>', 'Dealer documentation fee')
    .option('--trade-in <value>', 'Trade-in vehicle value')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.price) params.set('price', options.price)
      if (options.zip) params.set('zip', options.zip)
      if (options.downPayment) params.set('downPayment', options.downPayment)
      if (options.loanTerm) params.set('loanTerm', options.loanTerm)
      if (options.docFee) params.set('docFee', options.docFee)
      if (options.tradeIn) params.set('tradeIn', options.tradeIn)
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
    .option('--year <year>', 'Model year')
    .option('--make <make>', 'Vehicle manufacturer')
    .option('--model <model>', 'Vehicle model')
    .option('--zip <zip>', 'ZIP code')
    .option('--credit-score <score>', 'Credit score')
    .option('--vehicle-age <years>', 'Age of vehicle in years')
    .option('--vehicle-mileage <miles>', 'Current vehicle mileage')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.year) params.set('year', options.year)
      if (options.make) params.set('make', options.make)
      if (options.model) params.set('model', options.model)
      if (options.zip) params.set('zip', options.zip)
      if (options.creditScore) params.set('creditScore', options.creditScore)
      if (options.vehicleAge) params.set('vehicleAge', options.vehicleAge)
      if (options.vehicleMileage) params.set('vehicleMileage', options.vehicleMileage)
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
  )
    .option('--zip <zip>', 'ZIP code for location-based calculations')
    .option('--from-zip <zip>', 'ZIP code for delivery/transport calculations')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.zip) params.set('zip', options.zip)
      if (options.fromZip) params.set('fromZip', options.fromZip)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/tco/${vin}${query}`, apiKey)
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
      .argument('<plate>', 'License plate number'),
  ).action(async (state, plate, options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet(`/plate/${state}/${plate}`, apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(plate)

  // taxes
  const taxes = outputOptions(
    new Command('taxes')
      .description('Estimate taxes and fees by VIN and ZIP code')
      .argument('<vin>', 'Vehicle Identification Number'),
  )
    .option('--price <price>', 'Vehicle price (default 25000)')
    .option('--zip <zip>', 'ZIP code for tax jurisdiction (default 94020)')
    .option('--doc-fee <fee>', 'Documentation fee (default 200)')
    .option('--trade-in <value>', 'Trade-in value (default 0)')
    .option('--rate <rate>', 'Interest rate (default 9.99)')
    .option('--down-payment <amount>', 'Down payment amount (default 0)')
    .option('--months <months>', 'Loan term in months (default 72)')
    .action(async (vin, options) => {
      const apiKey = await getApiKey(options)
      const params = new URLSearchParams()
      if (options.price) params.set('price', options.price)
      if (options.zip) params.set('zip', options.zip)
      if (options.docFee) params.set('docFee', options.docFee)
      if (options.tradeIn) params.set('tradeIn', options.tradeIn)
      if (options.rate) params.set('rate', options.rate)
      if (options.downPayment) params.set('downPayment', options.downPayment)
      if (options.months) params.set('months', options.months)
      const query = params.toString() ? `?${params.toString()}` : ''
      const data = await apiGet(`/taxes/${vin}${query}`, apiKey)
      console.log(formatOutput(data, getFormat(options)))
    })
  commands.push(taxes)

  // usage
  const usage = outputOptions(
    new Command('usage')
      .description('Get account usage statistics'),
  ).action(async (options) => {
    const apiKey = await getApiKey(options)
    const data = await apiGet('/usage', apiKey)
    console.log(formatOutput(data, getFormat(options)))
  })
  commands.push(usage)

  return commands
}
