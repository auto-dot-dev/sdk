import { Command } from 'commander'
import { ENDPOINTS } from '../core/endpoints'
import { objectEntries, objectKeys, objectValues } from '../core/utils'
import { accent, brand, dim, formatError, hint, label, tierBadge, value } from './colors'

export interface ExploreEntry {
  name: string
  tier: string
  description: string
  path: string
}

export interface EndpointDetail extends ExploreEntry {
  method: string
  parameters: ParameterDetail[]
}

export interface ParameterDetail {
  name: string
  in: 'path' | 'query'
  required: boolean
  type: string
  description: string
  apiParam?: string  // real API param name if different from shorthand
}

const PARAM_DETAILS: Record<string, ParameterDetail[]> = {
  decode: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  photos: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  listings: [
    { name: 'make', in: 'query', required: false, type: 'string', description: 'Vehicle manufacturer. Comma-separated for multiple', apiParam: 'vehicle.make' },
    { name: 'model', in: 'query', required: false, type: 'string', description: 'Vehicle model. Comma-separated for multiple', apiParam: 'vehicle.model' },
    { name: 'year', in: 'query', required: false, type: 'string', description: 'Year or range (2018-2020)', apiParam: 'vehicle.year' },
    { name: 'trim', in: 'query', required: false, type: 'string', description: 'Trim level', apiParam: 'vehicle.trim' },
    { name: 'bodyStyle', in: 'query', required: false, type: 'string', description: 'Body style (sedan, coupe, etc)', apiParam: 'vehicle.bodyStyle' },
    { name: 'price', in: 'query', required: false, type: 'string', description: 'Price range (e.g. 10000-30000)', apiParam: 'retailListing.price' },
    { name: 'miles', in: 'query', required: false, type: 'string', description: 'Mileage range (e.g. 0-50000)', apiParam: 'retailListing.miles' },
    { name: 'state', in: 'query', required: false, type: 'string', description: 'State code (e.g. CA, TX)', apiParam: 'retailListing.state' },
    { name: 'sort', in: 'query', required: false, type: 'string', description: 'Sort criteria (e.g. price:asc, year:desc)' },
    { name: 'page', in: 'query', required: false, type: 'integer', description: 'Page number (starting from 1)' },
    { name: 'limit', in: 'query', required: false, type: 'integer', description: 'Results per page (1-100)' },
  ],
  specs: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  build: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  recalls: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  payments: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
    { name: 'price', in: 'query', required: true, type: 'string', description: 'Vehicle sales price' },
    { name: 'zip', in: 'query', required: true, type: 'string', description: '5-digit ZIP code for tax/fee calculations' },
    { name: 'downPayment', in: 'query', required: false, type: 'number', description: 'Down payment amount' },
    { name: 'loanTerm', in: 'query', required: false, type: 'number', description: 'Loan term in months' },
    { name: 'docFee', in: 'query', required: false, type: 'number', description: 'Dealer documentation fee' },
    { name: 'tradeIn', in: 'query', required: false, type: 'string', description: 'Trade-in vehicle value' },
  ],
  apr: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
    { name: 'year', in: 'query', required: true, type: 'number', description: 'Model year of the vehicle' },
    { name: 'make', in: 'query', required: true, type: 'string', description: 'Vehicle manufacturer' },
    { name: 'model', in: 'query', required: true, type: 'string', description: 'Vehicle model name' },
    { name: 'zip', in: 'query', required: true, type: 'string', description: '5-digit ZIP code for location-based rates' },
    { name: 'creditScore', in: 'query', required: true, type: 'string', description: 'Credit score for rate calculation' },
    { name: 'vehicleAge', in: 'query', required: false, type: 'number', description: 'Age of the vehicle in years' },
    { name: 'vehicleMileage', in: 'query', required: false, type: 'string', description: 'Current vehicle mileage' },
  ],
  tco: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
    { name: 'zip', in: 'query', required: false, type: 'string', description: '5-digit ZIP code for location-based calculations' },
    { name: 'fromZip', in: 'query', required: false, type: 'string', description: '5-digit ZIP code for delivery/transport calculations' },
  ],
  openRecalls: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
  ],
  plate: [
    { name: 'state', in: 'path', required: true, type: 'string', description: '2-letter state code (e.g. CA, NY, TX)' },
    { name: 'plate', in: 'path', required: true, type: 'string', description: 'License plate number (2-8 alphanumeric characters)' },
  ],
  taxes: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: '17-character Vehicle Identification Number' },
    { name: 'price', in: 'query', required: false, type: 'number', description: 'Vehicle price (default 25000)' },
    { name: 'zip', in: 'query', required: false, type: 'string', description: 'ZIP code for tax jurisdiction (default 94020)' },
    { name: 'docFee', in: 'query', required: false, type: 'number', description: 'Documentation fee (default 200)' },
    { name: 'tradeIn', in: 'query', required: false, type: 'number', description: 'Trade-in value to deduct (default 0)' },
    { name: 'rate', in: 'query', required: false, type: 'number', description: 'Interest rate (default 9.99)' },
    { name: 'downPayment', in: 'query', required: false, type: 'number', description: 'Down payment amount (default 0)' },
    { name: 'months', in: 'query', required: false, type: 'integer', description: 'Loan term in months (default 72)' },
  ],
  usage: [],
}

export function getExploreOutput(planFilter?: string): ExploreEntry[] {
  const entries = objectValues(ENDPOINTS).map((ep) => ({
    name: ep.name,
    tier: ep.tier,
    description: ep.description,
    path: ep.path,
  }))

  if (planFilter) {
    return entries.filter((e) => e.tier === planFilter)
  }

  return entries
}

export function getEndpointDetail(name: string): EndpointDetail | null {
  // Find endpoint by name (camelCase key or matching name field)
  const ep = objectValues(ENDPOINTS).find((e) => e.name === name)
  if (!ep) return null

  // Find the key in PARAM_DETAILS — try direct name match, then camelCase conversion
  const key = objectKeys(ENDPOINTS).find((k) => ENDPOINTS[k].name === name) ?? name
  const parameters = PARAM_DETAILS[key] ?? []

  return {
    name: ep.name,
    tier: ep.tier,
    description: ep.description,
    path: ep.path,
    method: ep.method,
    parameters,
  }
}

export function buildExploreCommand(): Command {
  const cmd = new Command('explore')
    .description('Explore available auto.dev API endpoints')
    .argument('[endpoint]', 'Specific endpoint to inspect')
    .option('--plan <tier>', 'Filter by plan tier (starter, growth, scale, auth)')
    .option('--json', 'Output as JSON')
    .action((endpoint, options) => {
      if (endpoint) {
        const detail = getEndpointDetail(endpoint)
        if (!detail) {
          console.error(formatError(`Unknown endpoint: ${endpoint}`))
          process.exit(1)
        }
        if (options.json) {
          console.log(JSON.stringify(detail, null, 2))
        } else {
          console.log(`\n${label(detail.name)} ${tierBadge(detail.tier)}`)
          console.log(`  ${dim(detail.description)}`)
          console.log(`  ${label(detail.method)} ${value(detail.path)}`)
          if (detail.parameters.length > 0) {
            console.log(`\n  ${label('Parameters:')}`)
            for (const p of detail.parameters) {
              const req = p.required ? accent('(required)') : hint('(optional)')
              const mapping = p.apiParam ? `  ${dim('->')}  ${value(p.apiParam)}` : ''
              const loc = p.in === 'path' ? ` ${dim('[path]')}` : ''
              console.log(`    ${label(p.name)}${loc} ${req} ${dim('—')} ${dim(p.description)}${mapping}`)
            }
          }
        }
        return
      }

      const entries = getExploreOutput(options.plan)
      if (options.json) {
        console.log(JSON.stringify(entries, null, 2))
        return
      }

      const tiers: Record<string, ExploreEntry[]> = {}
      for (const e of entries) {
        if (!tiers[e.tier]) tiers[e.tier] = []
        tiers[e.tier]!.push(e)
      }

      for (const [tier, eps] of objectEntries(tiers)) {
        console.log(`\n${tierBadge(tier)}`)
        for (const ep of eps) {
          console.log(`  ${label(ep.name.padEnd(16))} ${value(ep.path.padEnd(28))} ${dim(ep.description)}`)
        }
      }

      console.log(`\n${dim('─'.repeat(50))}`)
      console.log(`  ${brand('auto')} ${label('<endpoint>')}${dim(' .............. make an API call')}`)
      console.log(`  ${brand('auto explore')} ${label('<endpoint>')}${dim(' ...... view parameters')}`)
      console.log(`  ${brand('auto docs')} ${label('<endpoint>')}${dim(' ......... full documentation')}`)
      console.log()
    })

  return cmd
}
