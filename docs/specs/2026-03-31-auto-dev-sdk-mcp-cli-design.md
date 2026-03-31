# @auto.dev/sdk — SDK, MCP & CLI Design Spec

**Date:** 2026-03-31
**Status:** Approved
**Package:** `@auto.dev/sdk` (npm, published under `@auto.dev` org)
**Repo:** `github.com/auto-dot-dev/sdk`

## Overview

A single npm package providing three interfaces to the auto.dev automotive data APIs:

1. **SDK** — typed TypeScript client with flat, human-friendly API
2. **MCP Server** — 12 tools for AI agents (Claude, Cursor, etc.)
3. **CLI** — `auto` command for terminal use, CI, and MCP stdio mode

Architecture: **Hybrid generated + hand-crafted.** Types and HTTP layer generated from the OpenAPI spec (`api.auto.dev/openapi`). Human-friendly SDK wraps the generated core. MCP and CLI use the generated core directly for maximum agent compatibility.

## Auth Architecture

All auth backed by **id.org.ai** (OAuth provider) via **oauth.do** (OAuth SDK).

### API Key (SDK + MCP)

Keys issued by id.org.ai's KeyService, org-scoped. Prefix: `ad_sk_`.

```ts
const auto = new AutoDev({ apiKey: 'ad_sk_...' })
const auto = new AutoDev({ apiKey: 'ad_sk_...', org: 'acme-motors' })
```

- Sent as `Authorization: Bearer <key>` header
- Org context sent as `x-org` header (org slug, e.g., `acme-motors`)
- No org specified → resolves to user's personal org (every user has one)

### OAuth Device Flow (CLI)

```bash
auto login                        # Opens browser → id.org.ai authorize
auto login --api-key ad_sk_...    # Direct key for CI/scripts
auto logout                       # Revokes tokens
```

- `POST /oauth/device` on id.org.ai → device code + user code
- Polls for token grant
- Stores access + refresh tokens in `~/.config/auto-dev/credentials.json`
- Token includes org membership — CLI can switch orgs without re-auth

### Token Lifecycle

- Access tokens: short-lived id.org.ai JWTs
- Refresh tokens: transparent renewal
- SDK uses API keys (long-lived), doesn't manage tokens
- CLI manages token refresh automatically

### Migration from auth.vin

- Existing `sk_ad_*` keys continue to work (no breaking change)
- New keys issued by id.org.ai use `ad_sk_*` prefix
- API middleware accepts both during migration, eventually deprecates `sk_ad_*`

### APIs Repo Dependency

`authentication/with-api-key.ts` in the `apis` repo needs a dual-validation path:

- `sk_ad_*` prefix → validate against auth.vin (existing MongoDB lookup)
- `ad_sk_*` prefix → validate against id.org.ai (`/api/keys/validate` or introspect)
- Both resolve to the same user context shape (userId, orgId, plan, tier)

This is a prerequisite before the SDK ships with id.org.ai auth.

## API Surface — 12 Endpoints

| Method | Endpoint | Tier | Description |
|--------|----------|------|-------------|
| `decode(vin)` | `/vin/{vin}` | Starter | Decode VIN → make, model, year, trim, engine |
| `photos(vin)` | `/photos/{vin}` | Starter | Vehicle photos |
| `listings(filters)` | `/listings` | Starter | Search listings with filters |
| `specs(vin)` | `/specs/{vin}` | Growth | Detailed vehicle specifications |
| `build(vin)` | `/build/{vin}` | Growth | OEM build/trim data |
| `recalls(vin)` | `/recalls/{vin}` | Growth | Safety recalls |
| `payments(vin, opts)` | `/payments/{vin}` | Growth | Monthly payment calculations |
| `apr(vin, opts)` | `/apr/{vin}` | Growth | Interest rates by credit profile |
| `tco(vin)` | `/tco/{vin}` | Growth | Total cost of ownership |
| `openRecalls(vin)` | `/openrecalls/{vin}` | Scale | Open/unresolved recalls |
| `plate(state, number)` | `/plate/{state}/{number}` | Scale | License plate → VIN |
| `taxes(vin, opts)` | `/taxes/{vin}` | Scale | Taxes and fees by ZIP |
| `usage()` | `/usage` | Auth'd | Account usage stats |

## SDK (Human-Friendly Layer)

```ts
import { AutoDev } from '@auto.dev/sdk'

const auto = new AutoDev({ apiKey: 'ad_sk_...' })

const vehicle     = await auto.decode('1HGCM82633A004352')
const photos      = await auto.photos('1HGCM82633A004352')
const listings    = await auto.listings({ make: 'Toyota', year: 2024 })
const specs       = await auto.specs('1HGCM82633A004352')
const build       = await auto.build('1HGCM82633A004352')
const payments    = await auto.payments('1HGCM82633A004352', { downPayment: 5000 })
const apr         = await auto.apr('1HGCM82633A004352', { creditScore: 720 })
const tco         = await auto.tco('1HGCM82633A004352')
const taxes       = await auto.taxes('1HGCM82633A004352', { zip: '90210' })
const recalls     = await auto.recalls('1HGCM82633A004352')
const openRecalls = await auto.openRecalls('1HGCM82633A004352')
const plate       = await auto.plate('CA', 'ABC1234')
const usage       = await auto.usage()
```

### Response Envelope

Consistent across all methods:

```ts
interface AutoDevResponse<T> {
  data: T
  meta: { requestId: string, tier: string, usage?: { remaining: number } }
}
```

### Error Handling

```ts
class AutoDevError extends Error {
  status: number
  code: string         // 'UNAUTHORIZED' | 'PLAN_REQUIRED' | 'RATE_LIMITED' | 'NOT_FOUND'
  suggestion?: string  // "This endpoint requires a Growth plan. Upgrade at auto.dev/pricing"
}
```

Actionable errors — both humans and agents can understand what went wrong and what to do.

## MCP Server

12 tools, names mirror SDK methods. Descriptions from OpenAPI metadata.

```
auto_decode        — Decode a VIN → make, model, year, trim, engine, drivetrain
auto_photos        — Get vehicle photos by VIN
auto_listings      — Search vehicle listings with filters
auto_specs         — Get detailed vehicle specifications by VIN
auto_build         — Get OEM build/trim data by VIN
auto_payments      — Calculate monthly payments
auto_apr           — Get interest rates by VIN and credit profile
auto_tco           — Calculate total cost of ownership by VIN
auto_taxes         — Estimate taxes and fees by VIN and ZIP
auto_recalls       — Get safety recalls by VIN
auto_open_recalls  — Get open/unresolved recalls by VIN
auto_plate         — Resolve a license plate to a VIN
```

### MCP Auth

API key via env var or CLI credentials:

```json
{
  "mcpServers": {
    "auto-dev": {
      "command": "npx",
      "args": ["@auto.dev/sdk", "--mcp"],
      "env": { "AUTODEV_API_KEY": "ad_sk_..." }
    }
  }
}
```

If user has run `auto login`, MCP server reads credentials from `~/.config/auto-dev/credentials.json` automatically.

Each tool returns the same `{ data, meta }` envelope.

## CLI

Commands mirror SDK methods and MCP tool names.

```bash
# Auth
auto login                          # Device flow → id.org.ai
auto login --api-key ad_sk_...      # Direct key for CI
auto logout                         # Revoke tokens
auto whoami                         # Show current user + org
auto orgs list                      # List orgs
auto orgs switch acme-motors        # Switch active org

# Vehicle data
auto decode 1HGCM82633A004352
auto photos 1HGCM82633A004352
auto specs 1HGCM82633A004352
auto build 1HGCM82633A004352
auto plate CA ABC1234

# Listings
auto listings --make toyota --year 2024 --zip 90210

# Pricing
auto payments 1HGCM82633A004352 --down-payment 5000
auto apr 1HGCM82633A004352 --credit-score 720
auto tco 1HGCM82633A004352
auto taxes 1HGCM82633A004352 --zip 90210

# Safety
auto recalls 1HGCM82633A004352
auto open-recalls 1HGCM82633A004352

# Account
auto usage

# Output formats
auto decode 1HG... --json          # JSON (default)
auto decode 1HG... --table         # Table format
auto decode 1HG... --yaml          # YAML format

# Discoverability
auto                                # No args → help with all commands
auto --help                         # Same
auto decode --help                  # Per-command help (args, options, example)
auto explore                        # List all endpoints, tiers, descriptions (JSON)
auto explore decode                 # Schema, params, example request/response for decode
auto explore --plan starter         # Show only endpoints available on Starter plan

# MCP mode
auto --mcp                          # Start as MCP stdio server
```

### Discoverability

Two mechanisms — `--help` for humans, `explore` for agents:

- `auto --help` / `auto <command> --help` — standard CLI help text, lists commands and options
- `auto explore` — structured JSON output describing all endpoints, their tiers, parameters, and example responses
- `auto explore <command>` — deep dive on a single endpoint: full param schema, example request, example response
- `auto explore --plan <tier>` — filter to endpoints available on a specific plan

The `explore` command makes the CLI self-describing — an agent can discover what's available and how to use it without external documentation.

### Config

Stored in `~/.config/auto-dev/`:

- `credentials.json` — tokens + active org
- `config.json` — defaults (output format, default org)

### Design Decisions

- Default output: JSON (agent-friendly), `--table` for human terminal use
- VIN is always first positional arg
- `auto --mcp` doubles as MCP server entry point — no separate binary
- Errors print actionable suggestion strings

## Generated Core + Build Pipeline

### Code Generation

```
api.auto.dev/openapi → OpenAPI spec JSON
        ↓
scripts/generate.ts
        ↓
src/core/
  ├── types.ts       # Request/response interfaces from Zod→OpenAPI schemas
  ├── endpoints.ts   # Endpoint metadata (path, method, tier, description, params)
  └── client.ts      # Typed HTTP client — fetch-based, zero runtime deps
```

- Generated code is committed (not generated at build time)
- Regenerate when APIs change: `pnpm generate`

### Build

```bash
pnpm generate    # Regenerate core/ from OpenAPI spec
pnpm build       # tsup → ESM + CJS + DTS
pnpm test        # Vitest
pnpm publish     # Ship to npm
```

### Tech Choices

- **tsup** — ESM + CJS, tree-shakeable
- **Zero runtime deps** — native fetch only
- **Vitest** — testing
- **Node 18+** — native fetch requirement

## Package Structure

```
@auto.dev/sdk (github.com/auto-dot-dev/sdk)
├── src/
│   ├── core/           # Generated from OpenAPI
│   │   ├── client.ts   # HTTP client (fetch-based, zero deps)
│   │   ├── types.ts    # Request/response types
│   │   └── endpoints.ts # Endpoint definitions + metadata
│   ├── sdk/            # Hand-crafted flat API
│   │   └── index.ts    # AutoDev class (12 methods)
│   ├── mcp/            # MCP server
│   │   └── server.ts   # 12 tools, uses core/ directly
│   ├── cli/            # CLI
│   │   ├── index.ts    # Entry point (bin)
│   │   ├── auth.ts     # Device flow login via oauth.do
│   │   └── commands/   # One per endpoint group
│   └── auth/           # Shared auth layer
│       ├── api-key.ts  # API key auth
│       ├── oauth.ts    # oauth.do / id.org.ai integration
│       └── org.ts      # Org context resolution
├── scripts/
│   └── generate.ts     # OpenAPI → core/ codegen
├── test/
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### Package Exports

```json
{
  "name": "@auto.dev/sdk",
  "bin": { "auto": "./dist/cli/index.js" },
  "exports": {
    ".": "./dist/sdk/index.js",
    "./mcp": "./dist/mcp/server.js",
    "./core": "./dist/core/client.js"
  }
}
```

- `import { AutoDev } from '@auto.dev/sdk'` — human-friendly SDK
- `import { createMcpServer } from '@auto.dev/sdk/mcp'` — MCP server
- `import { AutoDevClient } from '@auto.dev/sdk/core'` — raw generated client
- `npx @auto.dev/sdk` or `auto` — CLI

## Relationship to auto-dev-skill

The existing `drivly/auto-dev-skill` (Vercel Skills plugin) provides documentation-driven context to AI agents. The SDK/MCP **complements** it:

- **auto-dev-skill** = teaches agents about the APIs (docs, patterns, examples)
- **@auto.dev/sdk MCP** = gives agents direct tool execution against the APIs

The skill can reference the SDK/MCP in its docs for agents that want programmatic access.

## Dependencies & Prerequisites

1. **id.org.ai**: Register auto.dev as an OAuth client (`POST /oauth/register`)
2. **apis repo**: Add dual-validation in `authentication/with-api-key.ts` for `ad_sk_*` keys
3. **npm**: `@auto.dev/sdk` placeholder published (done)
4. **GitHub**: `auto-dot-dev/sdk` repo created
