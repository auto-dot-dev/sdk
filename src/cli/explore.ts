import { Command } from 'commander'
import { ENDPOINTS, EndpointDefinition } from '../core/endpoints'

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
}

const PARAM_DETAILS: Record<string, ParameterDetail[]> = {
  decode: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  photos: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  listings: [
    { name: 'make', in: 'query', required: false, type: 'string', description: 'Vehicle make (e.g. Toyota)' },
    { name: 'model', in: 'query', required: false, type: 'string', description: 'Vehicle model (e.g. Camry)' },
    { name: 'year', in: 'query', required: false, type: 'number', description: 'Model year (e.g. 2022)' },
    { name: 'zip', in: 'query', required: false, type: 'string', description: 'ZIP code for location-based search' },
    { name: 'price_max', in: 'query', required: false, type: 'number', description: 'Maximum price filter' },
    { name: 'miles_max', in: 'query', required: false, type: 'number', description: 'Maximum mileage filter' },
  ],
  specs: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  build: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  recalls: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  payments: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
    { name: 'down', in: 'query', required: false, type: 'number', description: 'Down payment amount' },
    { name: 'term', in: 'query', required: false, type: 'number', description: 'Loan term in months' },
    { name: 'credit_score', in: 'query', required: false, type: 'number', description: 'Credit score for rate calculation' },
  ],
  apr: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
    { name: 'credit_score', in: 'query', required: false, type: 'number', description: 'Credit score for APR calculation' },
  ],
  tco: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  openRecalls: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
  ],
  plate: [
    { name: 'state', in: 'path', required: true, type: 'string', description: 'Two-letter state abbreviation (e.g. CA)' },
    { name: 'number', in: 'path', required: true, type: 'string', description: 'License plate number' },
  ],
  taxes: [
    { name: 'vin', in: 'path', required: true, type: 'string', description: 'Vehicle Identification Number (17 chars)' },
    { name: 'zip', in: 'query', required: false, type: 'string', description: 'ZIP code for tax jurisdiction' },
  ],
  usage: [],
}

export function getExploreOutput(planFilter?: string): ExploreEntry[] {
  const entries = Object.values(ENDPOINTS).map((ep: EndpointDefinition) => ({
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
  const ep = Object.values(ENDPOINTS).find((e) => e.name === name)
  if (!ep) return null

  // Find the key in PARAM_DETAILS — try direct name match, then camelCase conversion
  const key = Object.keys(ENDPOINTS).find((k) => ENDPOINTS[k].name === name) ?? name
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
          console.error(`Unknown endpoint: ${options.detail}`)
          process.exit(1)
        }
        if (options.json) {
          console.log(JSON.stringify(detail, null, 2))
        } else {
          console.log(`\n${detail.name} [${detail.tier}]`)
          console.log(`  ${detail.description}`)
          console.log(`  ${detail.method} ${detail.path}`)
          if (detail.parameters.length > 0) {
            console.log('\n  Parameters:')
            for (const p of detail.parameters) {
              const req = p.required ? '(required)' : '(optional)'
              console.log(`    ${p.name} [${p.in}] ${req} — ${p.description}`)
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
        tiers[e.tier].push(e)
      }

      for (const [tier, eps] of Object.entries(tiers)) {
        console.log(`\n[${tier.toUpperCase()}]`)
        for (const ep of eps) {
          console.log(`  ${ep.name.padEnd(16)} ${ep.path.padEnd(28)} ${ep.description}`)
        }
      }
    })

  return cmd
}
