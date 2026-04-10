import type { Command } from 'commander'
import { makeCommand, type CommandDef } from './factory'

const commands: CommandDef[] = [
  // Simple VIN commands
  { name: 'decode',       description: 'Decode a VIN — returns make, model, year, trim, engine, drivetrain', endpoint: '/vin' },
  { name: 'photos',       description: 'Get vehicle photos by VIN',                                          endpoint: '/photos' },
  { name: 'specs',        description: 'Get detailed vehicle specifications by VIN',                         endpoint: '/specs' },
  { name: 'build',        description: 'Get OEM build and trim data by VIN',                                 endpoint: '/build' },
  { name: 'recalls',      description: 'Get safety recalls by VIN',                                          endpoint: '/recalls' },
  { name: 'open-recalls', description: 'Get open/unresolved recalls by VIN',                                 endpoint: '/openrecalls' },

  // VIN + extra query params
  { name: 'payments', description: 'Calculate monthly payments by VIN', endpoint: '/payments',
    extraOptions: [
      { flags: '--price <price>',        description: 'Vehicle sales price' },
      { flags: '--zip <zip>',            description: 'ZIP code for tax/fee calculations' },
      { flags: '--down-payment <amount>', description: 'Down payment amount' },
      { flags: '--loan-term <months>',   description: 'Loan term in months' },
      { flags: '--doc-fee <fee>',        description: 'Dealer documentation fee' },
      { flags: '--trade-in <value>',     description: 'Trade-in vehicle value' },
    ],
    queryParams: { price: 'price', zip: 'zip', downPayment: 'downPayment', loanTerm: 'loanTerm', docFee: 'docFee', tradeIn: 'tradeIn' },
  },

  { name: 'apr', description: 'Get interest rates by VIN and credit profile', endpoint: '/apr',
    extraOptions: [
      { flags: '--year <year>',             description: 'Model year' },
      { flags: '--make <make>',             description: 'Vehicle manufacturer' },
      { flags: '--model <model>',           description: 'Vehicle model' },
      { flags: '--zip <zip>',               description: 'ZIP code' },
      { flags: '--credit-score <score>',    description: 'Credit score' },
      { flags: '--vehicle-age <years>',     description: 'Age of vehicle in years' },
      { flags: '--vehicle-mileage <miles>', description: 'Current vehicle mileage' },
    ],
    queryParams: { year: 'year', make: 'make', model: 'model', zip: 'zip', creditScore: 'creditScore', vehicleAge: 'vehicleAge', vehicleMileage: 'vehicleMileage' },
  },

  { name: 'tco', description: 'Calculate total cost of ownership by VIN', endpoint: '/tco',
    extraOptions: [
      { flags: '--zip <zip>',      description: 'ZIP code for location-based calculations' },
      { flags: '--from-zip <zip>', description: 'ZIP code for delivery/transport calculations' },
    ],
    queryParams: { zip: 'zip', fromZip: 'fromZip' },
  },

  { name: 'taxes', description: 'Estimate taxes and fees by VIN and ZIP code', endpoint: '/taxes',
    extraOptions: [
      { flags: '--price <price>',        description: 'Vehicle price (default 25000)' },
      { flags: '--zip <zip>',            description: 'ZIP code for tax jurisdiction (default 94020)' },
      { flags: '--doc-fee <fee>',        description: 'Documentation fee (default 200)' },
      { flags: '--trade-in <value>',     description: 'Trade-in value (default 0)' },
      { flags: '--rate <rate>',          description: 'Interest rate (default 9.99)' },
      { flags: '--down-payment <amount>', description: 'Down payment amount (default 0)' },
      { flags: '--months <months>',      description: 'Loan term in months (default 72)' },
    ],
    queryParams: { price: 'price', zip: 'zip', docFee: 'docFee', tradeIn: 'tradeIn', rate: 'rate', downPayment: 'downPayment', months: 'months' },
  },

  // Multi-arg command
  { name: 'plate', description: 'Resolve a license plate to a VIN',
    args: [{ name: 'state', desc: 'Two-letter state abbreviation' }, { name: 'plate', desc: 'License plate number' }],
    endpoint: (state, plate) => `/plate/${state}/${plate}`,
  },

  // Listings — optional VIN for single lookup, or search with filters
  { name: 'listings', description: 'Search vehicle listings or look up by VIN',
    args: [{ name: 'vin', desc: 'VIN (optional — omit to search)', optional: true }],
    endpoint: '/listings',
    extraOptions: [
      { flags: '--make <make>',         description: 'Vehicle make (maps to vehicle.make)' },
      { flags: '--model <model>',       description: 'Vehicle model (maps to vehicle.model)' },
      { flags: '--year <year>',         description: 'Model year or range, e.g. 2024 or 2020-2024' },
      { flags: '--trim <trim>',         description: 'Trim level' },
      { flags: '--body-style <style>',  description: 'Body style, e.g. sedan, coupe' },
      { flags: '--price <price>',       description: 'Price range, e.g. 10000-30000' },
      { flags: '--miles <miles>',       description: 'Mileage range, e.g. 0-50000' },
      { flags: '--state <state>',       description: 'State code, e.g. CA' },
      { flags: '--sort <sort>',         description: 'Sort (e.g. "price:asc", "year:desc")' },
      { flags: '--page <page>',         description: 'Page number' },
      { flags: '--limit <limit>',       description: 'Results per page (1-100)' },
    ],
    queryParams: {
      make: 'vehicle.make', model: 'vehicle.model', year: 'vehicle.year',
      trim: 'vehicle.trim', bodyStyle: 'vehicle.bodyStyle',
      price: 'retailListing.price', miles: 'retailListing.miles', state: 'retailListing.state',
      sort: 'sort', page: 'page', limit: 'limit',
    },
  },

  // No-arg command
  { name: 'usage', description: 'Get account usage statistics', args: [], endpoint: '/usage' },
]

export function buildApiCommands(): Command[] {
  return commands.map(makeCommand)
}
