# @auto.dev/sdk

[![npm](https://img.shields.io/npm/v/@auto.dev/sdk)](https://www.npmjs.com/package/@auto.dev/sdk)
[![license](https://img.shields.io/npm/l/@auto.dev/sdk)](./LICENSE)

SDK, CLI, and MCP server for the [auto.dev](https://auto.dev) vehicle data APIs — VIN decoding, listings search, specs, recalls, payments, and more.

## Quick Start

```bash
npx @auto.dev/sdk login
npx @auto.dev/sdk decode 1HGCM82633A004352
```

Or install globally for the `auto` shorthand:

```bash
npm install -g @auto.dev/sdk
auto login
auto decode 1HGCM82633A004352
```

`auto login` opens a browser for OAuth — no API key needed. Your token is stored locally and used by the CLI and MCP server automatically.

Alternatively, set an API key directly:

```bash
export AUTODEV_API_KEY=sk_ad_...
```

Get a free key at [auto.dev/pricing](https://auto.dev/pricing).

## CLI

```bash
auto decode <vin>                   # VIN decode
auto photos <vin>                   # vehicle photos
auto listings --make Toyota --year 2024 --price 10000-40000 --state CA
auto specs <vin>                    # detailed specifications
auto build <vin>                    # OEM build data
auto recalls <vin>                  # safety recalls
auto open-recalls <vin>             # unresolved recalls
auto payments <vin> --price 35000 --zip 90210 --down-payment 5000
auto apr <vin> --year 2024 --make Honda --model Accord --zip 90210 --credit-score 750
auto tco <vin> --zip 90210          # total cost of ownership
auto taxes <vin> --price 35000 --zip 90210
auto plate <state> <plate>          # license plate to VIN
auto usage                          # account usage stats
auto docs [query]                   # search bundled API docs
auto explore [endpoint]             # browse params and mappings
```

All commands support `--json`, `--yaml`, and `--api-key <key>` flags. Use `npx @auto.dev/sdk` in place of `auto` if not installed globally.

## MCP Server

```bash
npx @auto.dev/sdk mcp install
```

This installs the package globally (so MCP clients can find the `auto` binary) and auto-configures Claude Code, Claude Desktop, and Cursor. No API key needed — uses your login.

### Available MCP Tools

| Tool | Description | Plan |
|------|-------------|------|
| `auto_decode` | Decode a VIN | Starter |
| `auto_photos` | Vehicle photos | Starter |
| `auto_listings` | Search listings with filters | Starter |
| `auto_specs` | Vehicle specifications | Growth |
| `auto_build` | OEM build data | Growth |
| `auto_recalls` | Safety recalls | Growth |
| `auto_payments` | Payment calculations | Growth |
| `auto_apr` | Interest rates | Growth |
| `auto_tco` | Total cost of ownership | Growth |
| `auto_open_recalls` | Open/unresolved recalls | Scale |
| `auto_plate` | License plate to VIN | Scale |
| `auto_taxes` | Taxes and fees | Scale |
| `auto_docs` | Search bundled API documentation | — |

## SDK

```bash
npm install @auto.dev/sdk
```

```typescript
import { AutoDev } from '@auto.dev/sdk'

const auto = new AutoDev({ apiKey: process.env.AUTODEV_API_KEY })

// VIN decode
const vehicle = await auto.decode('1HGCM82633A004352')

// Search listings
const listings = await auto.listings({
  'vehicle.make': 'Toyota',
  'vehicle.year': '2024',
  'retailListing.price': '10000-40000',
})

// Payment calculation
const payments = await auto.payments('1HGCM82633A004352', {
  price: '35000',
  zip: '90210',
  downPayment: '5000',
})

// Total cost of ownership
const tco = await auto.tco('1HGCM82633A004352', { zip: '90210' })

// Plate to VIN
const plate = await auto.plate('CA', 'ABC1234')
```

All methods return:

```typescript
{
  data: T,            // endpoint-specific response
  meta: {
    requestId: string,
    tier: string,
    usage?: { remaining: number }
  }
}
```

### SDK Methods

| Method | Tier | Description |
|--------|------|-------------|
| `decode(vin)` | Starter | Decode VIN — make, model, year, trim |
| `photos(vin)` | Starter | Vehicle photos |
| `listings(filters?)` | Starter | Search listings with filters |
| `specs(vin)` | Growth | Detailed vehicle specifications |
| `build(vin)` | Growth | OEM build and trim data |
| `recalls(vin)` | Growth | Safety recalls |
| `payments(vin, opts?)` | Growth | Monthly payment calculations |
| `apr(vin, opts?)` | Growth | Interest rates by credit profile |
| `tco(vin, opts?)` | Growth | Total cost of ownership |
| `openRecalls(vin)` | Scale | Open/unresolved recalls |
| `plate(state, plate)` | Scale | License plate to VIN |
| `taxes(vin, opts?)` | Scale | Taxes and fees |
| `usage()` | — | Account usage statistics |

### Subpath Exports

```typescript
import { AutoDev } from '@auto.dev/sdk'              // SDK client
import { createMcpServer } from '@auto.dev/sdk/mcp'  // MCP server
import { AutoDevClient } from '@auto.dev/sdk/core'    // low-level client
```

## Plans & Pricing

| Plan | Monthly | Endpoints |
|------|---------|-----------|
| **Starter** | Free + data fees | Decode, Listings, Photos |
| **Growth** | $299/mo + data fees | + Specs, Build, Recalls, Payments, APR, TCO |
| **Scale** | $599/mo + data fees | + Open Recalls, Plate-to-VIN, Taxes & Fees |

All plans include 1,000 free calls/month. See [auto.dev/pricing](https://auto.dev/pricing) for per-call data costs.

## Documentation

Full docs at [docs.auto.dev](https://docs.auto.dev)

## License

MIT
