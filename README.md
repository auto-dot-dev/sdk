# @auto.dev/sdk

SDK, CLI, and MCP server for the [auto.dev](https://auto.dev) automotive APIs.

## Quick Start

### Install

```bash
npm install -g @auto.dev/sdk
```

### Authenticate

```bash
auto login
```

### Try It

```bash
auto decode 1HGCM82633A004352
auto listings --make Toyota --year 2024 --price 10000-40000
auto explore
auto explore listings
```

### MCP Server (for AI tools)

```bash
auto mcp install
```

Auto-configures Claude Code, Claude Desktop, and Cursor. No API key needed — uses your login.

### Use as a Library

```bash
npm install @auto.dev/sdk
```

```typescript
import { AutoDev } from '@auto.dev/sdk'

const auto = new AutoDev({ apiKey: 'YOUR_KEY' })
const vehicle = await auto.decode('1HGCM82633A004352')
const listings = await auto.listings({ 'vehicle.make': 'Toyota', 'vehicle.year': '2024' })
const payments = await auto.payments('1HGCM82633A004352', { price: 35000, zip: '90210' })
```

## Documentation

Full docs at [docs.auto.dev](https://docs.auto.dev)

## API Endpoints

| Method | Tier | Description |
|--------|------|-------------|
| `decode(vin)` | Starter | Decode VIN — make, model, year, trim |
| `photos(vin)` | Starter | Vehicle photos |
| `listings(filters)` | Starter | Search listings |
| `specs(vin)` | Growth | Vehicle specifications |
| `build(vin)` | Growth | OEM build data |
| `recalls(vin)` | Growth | Safety recalls |
| `payments(vin, opts)` | Growth | Monthly payments |
| `apr(vin, opts)` | Growth | Interest rates |
| `tco(vin)` | Growth | Total cost of ownership |
| `openRecalls(vin)` | Scale | Open recalls |
| `plate(state, plate)` | Scale | Plate to VIN |
| `taxes(vin, opts)` | Scale | Taxes and fees |

## License

MIT
