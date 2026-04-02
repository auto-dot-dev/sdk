# @auto.dev/sdk

SDK, MCP server, and CLI for the [auto.dev](https://auto.dev) automotive APIs.

## Install

```bash
# CLI and MCP server
npm install -g @auto.dev/sdk

# As a library dependency
npm install @auto.dev/sdk
```

## CLI Usage

```bash
# Login (opens browser for OAuth)
auto login

# Decode a VIN
auto decode 1HGCM82633A004352

# Search listings
auto listings --make toyota --year 2024 --zip 90210

# Discover available endpoints
auto explore
auto explore decode
```

Or use without installing globally:

```bash
npx @auto.dev/sdk login
npx @auto.dev/sdk decode 1HGCM82633A004352
```

## SDK Usage

```typescript
import { AutoDev } from '@auto.dev/sdk'

const auto = new AutoDev({ apiKey: 'ad_sk_...' })

const vehicle = await auto.decode('1HGCM82633A004352')
const photos = await auto.photos('1HGCM82633A004352')
const listings = await auto.listings({ make: 'Toyota', year: 2024 })
const specs = await auto.specs('1HGCM82633A004352')
const payments = await auto.payments('1HGCM82633A004352', { downPayment: 5000 })
```

## MCP Server

Auto-configure for Claude Code, Claude Desktop, and Cursor:

```bash
npx @auto.dev/sdk mcp install
```

This installs the SDK globally and registers the MCP server in all detected clients. No API key needed — uses your OAuth login automatically.

To manually configure, add to your MCP client config:

```json
{
  "mcpServers": {
    "auto-dev": {
      "command": "auto",
      "args": ["--mcp"]
    }
  }
}
```

## API Endpoints

| Method | Tier | Description |
|--------|------|-------------|
| `decode(vin)` | Starter | Decode VIN → make, model, year, trim |
| `photos(vin)` | Starter | Vehicle photos |
| `listings(filters)` | Starter | Search listings |
| `specs(vin)` | Growth | Vehicle specifications |
| `build(vin)` | Growth | OEM build data |
| `recalls(vin)` | Growth | Safety recalls |
| `payments(vin, opts)` | Growth | Monthly payments |
| `apr(vin, opts)` | Growth | Interest rates |
| `tco(vin)` | Growth | Total cost of ownership |
| `openRecalls(vin)` | Scale | Open recalls |
| `plate(state, number)` | Scale | Plate → VIN |
| `taxes(vin, opts)` | Scale | Taxes and fees |

## License

MIT
