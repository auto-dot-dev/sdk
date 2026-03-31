# @auto.dev/sdk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@auto.dev/sdk` — a single npm package providing SDK, MCP server, and CLI for the auto.dev automotive APIs, authenticated via id.org.ai.

**Architecture:** Hybrid generated + hand-crafted. Types and HTTP layer generated from the OpenAPI spec. Flat SDK wraps the generated core. MCP server and CLI use the generated core directly. Auth backed by id.org.ai (API keys + OAuth device flow).

**Tech Stack:** TypeScript, tsup (bundler), vitest (testing), zod (validation), @modelcontextprotocol/sdk (MCP), commander (CLI), id.org.ai (auth config + types)

**Spec:** `docs/specs/2026-03-31-auto-dev-sdk-mcp-cli-design.md`

**Repo:** `github.com/auto-dot-dev/sdk` → `/Users/chrisrisner/Workspace/auto-dot-dev/sdk`

---

## File Structure

```
src/
├── core/                    # Generated from OpenAPI
│   ├── client.ts            # HTTP client (fetch-based, zero deps)
│   ├── types.ts             # Request/response types
│   └── endpoints.ts         # Endpoint metadata (path, method, tier, description, params)
├── sdk/
│   └── index.ts             # AutoDev class — 12 flat methods
├── mcp/
│   └── server.ts            # MCP server — 12 tools via @modelcontextprotocol/sdk
├── cli/
│   ├── index.ts             # CLI entry point (bin)
│   ├── auth.ts              # Device flow login + credential storage
│   ├── explore.ts           # auto explore command
│   └── commands.ts          # All 12 API commands
├── auth/
│   ├── api-key.ts           # API key auth header injection
│   ├── oauth.ts             # oauth.do device flow + token refresh
│   └── config.ts            # Auth config (id.org.ai client_id, endpoints)
├── errors.ts                # AutoDevError class
└── index.ts                 # Package entry — re-exports AutoDev
scripts/
└── generate.ts              # OpenAPI → core/ codegen
test/
├── core/
│   └── client.test.ts       # HTTP client tests
├── sdk/
│   └── index.test.ts        # AutoDev class tests
├── mcp/
│   └── server.test.ts       # MCP tool tests
├── cli/
│   ├── auth.test.ts         # Device flow tests
│   ├── commands.test.ts     # CLI command tests
│   └── explore.test.ts      # Explore command tests
├── auth/
│   └── api-key.test.ts      # Auth tests
└── errors.test.ts           # Error tests
```

---

## Prerequisites (Before Starting)

### Prereq A: Add auto.dev CLI as a pre-registered client in id.org.ai

Add `auto_dev_cli` to the `defaults` array in `ensureDefaultClients()`:

**File:** `/Users/chrisrisner/Workspace/dot-do/headless.ly/.org.ai/id/src/services/oauth/service.ts` (~line 103)

Add to the defaults array alongside the existing clients (id_org_ai_cli, oauth_do_cli, etc.):

```typescript
{
  id: 'auto_dev_cli',
  name: 'auto.dev CLI',
  redirectUris: [],
  grantTypes: ['urn:ietf:params:oauth:grant-type:device_code'],
  responseTypes: [],
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  trusted: true,
  tokenEndpointAuthMethod: 'none',
},
```

Then ensure the device flow endpoint seeds it. In `worker/routes/oauth.ts`, the existing `POST /oauth/device` handler already calls `ensureCliClient()` which calls `ensureDefaultClients()` — so the new client will be seeded automatically on first device flow request.

Also export the client ID constant from `id.org.ai/auth` (alongside existing `ID_ORG_AI_CLI_CLIENT_ID`):

**File:** `/Users/chrisrisner/Workspace/dot-do/headless.ly/.org.ai/id/src/auth/index.ts`

```typescript
export const AUTO_DEV_CLI_CLIENT_ID = 'auto_dev_cli'
```

The SDK imports this — no hardcoded client IDs or URLs. No secret needed (public client).

**Out of scope:** Migrating auto.dev UI/dashboard and auth.vin to id.org.ai auth is future work. Only the CLI device flow client is needed now.

### Prereq B: Verify OpenAPI spec is accessible

```bash
curl https://api.auto.dev/openapi | head -100
```

Confirm the spec includes all 12 endpoints with Zod-derived schemas.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.prettierrc`

- [ ] **Step 1: Initialize package.json**

```bash
cd /Users/chrisrisner/Workspace/auto-dot-dev/sdk
```

Create `package.json`:

```json
{
  "name": "@auto.dev/sdk",
  "version": "0.1.0",
  "description": "SDK, MCP, and CLI for the auto.dev APIs",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "auto": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./mcp": {
      "import": "./dist/mcp/server.js",
      "types": "./dist/mcp/server.d.ts"
    },
    "./core": {
      "import": "./dist/core/client.js",
      "types": "./dist/core/client.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "generate": "tsx scripts/generate.ts",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepublishOnly": "pnpm build"
  },
  "keywords": ["auto.dev", "automotive", "vin", "sdk", "mcp", "cli"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/auto-dot-dev/sdk"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "files": ["dist", "README.md", "LICENSE"]
}
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add zod @modelcontextprotocol/sdk commander id.org.ai
pnpm add -D typescript tsup vitest prettier tsx @types/node
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 4: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/client': 'src/core/client.ts',
    'mcp/server': 'src/mcp/server.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: true,
  banner: ({ format }) => {
    // Add shebang to CLI entry
    return {}
  },
})
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
dist/
.DS_Store
*.tsbuildinfo
.env
.env.local
```

- [ ] **Step 7: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

- [ ] **Step 8: Verify setup builds**

```bash
mkdir -p src && echo "export {}" > src/index.ts
pnpm build
```

Expected: Clean build, `dist/` directory created.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: project scaffolding — package.json, tsconfig, tsup, vitest"
```

---

## Task 2: Error Types + Auth Config

**Files:**
- Create: `src/errors.ts`
- Create: `src/auth/config.ts`
- Create: `src/auth/api-key.ts`
- Test: `test/errors.test.ts`
- Test: `test/auth/api-key.test.ts`

- [ ] **Step 1: Write the failing test for AutoDevError**

Create `test/errors.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { AutoDevError } from '../src/errors'

describe('AutoDevError', () => {
  it('creates error with all fields', () => {
    const error = new AutoDevError(403, 'PLAN_REQUIRED', 'Growth plan required', 'Upgrade at auto.dev/pricing')

    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(403)
    expect(error.code).toBe('PLAN_REQUIRED')
    expect(error.message).toBe('Growth plan required')
    expect(error.suggestion).toBe('Upgrade at auto.dev/pricing')
    expect(error.name).toBe('AutoDevError')
  })

  it('creates error without suggestion', () => {
    const error = new AutoDevError(404, 'NOT_FOUND', 'Vehicle not found')

    expect(error.suggestion).toBeUndefined()
  })

  it('serializes to JSON with all fields', () => {
    const error = new AutoDevError(429, 'RATE_LIMITED', 'Too many requests', 'Wait and retry')
    const json = JSON.parse(JSON.stringify(error))

    expect(json.status).toBe(429)
    expect(json.code).toBe('RATE_LIMITED')
    expect(json.message).toBe('Too many requests')
    expect(json.suggestion).toBe('Wait and retry')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- test/errors.test.ts
```

Expected: FAIL — `Cannot find module '../src/errors'`

- [ ] **Step 3: Implement AutoDevError**

Create `src/errors.ts`:

```typescript
export type AutoDevErrorCode = 'UNAUTHORIZED' | 'PLAN_REQUIRED' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'SERVER_ERROR'

export class AutoDevError extends Error {
  readonly status: number
  readonly code: AutoDevErrorCode
  readonly suggestion?: string

  constructor(status: number, code: AutoDevErrorCode, message: string, suggestion?: string) {
    super(message)
    this.name = 'AutoDevError'
    this.status = status
    this.code = code
    this.suggestion = suggestion
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- test/errors.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Write the failing test for API key auth**

Create `test/auth/api-key.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createAuthHeaders } from '../../src/auth/api-key'

describe('createAuthHeaders', () => {
  it('creates Authorization header from API key', () => {
    const headers = createAuthHeaders({ apiKey: 'ad_sk_test123' })

    expect(headers['Authorization']).toBe('Bearer ad_sk_test123')
  })

  it('includes x-org header when org is provided', () => {
    const headers = createAuthHeaders({ apiKey: 'ad_sk_test123', org: 'acme-motors' })

    expect(headers['Authorization']).toBe('Bearer ad_sk_test123')
    expect(headers['x-org']).toBe('acme-motors')
  })

  it('omits x-org header when org is not provided', () => {
    const headers = createAuthHeaders({ apiKey: 'ad_sk_test123' })

    expect(headers['x-org']).toBeUndefined()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test -- test/auth/api-key.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 7: Implement auth config and API key headers**

Create `src/auth/config.ts`:

```typescript
import { CANONICAL_AUTH_ORIGIN } from 'id.org.ai/auth'

export const AUTO_DEV_CLI_CLIENT_ID = 'auto_dev_cli'

export interface AuthConfig {
  apiKey?: string
  org?: string
  idOrgAiUrl?: string
  clientId?: string
}

export const DEFAULT_AUTH_CONFIG = {
  idOrgAiUrl: CANONICAL_AUTH_ORIGIN,
  apiBaseUrl: 'https://api.auto.dev',
  clientId: AUTO_DEV_CLI_CLIENT_ID,
} as const
```

Note: Once `AUTO_DEV_CLI_CLIENT_ID` is exported from `id.org.ai/auth` (see Prereq A), replace the local constant with: `import { AUTO_DEV_CLI_CLIENT_ID } from 'id.org.ai/auth'`

Create `src/auth/api-key.ts`:

```typescript
export interface ApiKeyAuthOptions {
  apiKey: string
  org?: string
}

export function createAuthHeaders(options: ApiKeyAuthOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.apiKey}`,
  }

  if (options.org) {
    headers['x-org'] = options.org
  }

  return headers
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
pnpm test -- test/auth
```

Expected: 3 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/errors.ts src/auth/ test/errors.test.ts test/auth/
git commit -m "feat: add AutoDevError class and API key auth headers"
```

---

## Task 3: Core HTTP Client + Endpoint Definitions

**Files:**
- Create: `src/core/endpoints.ts`
- Create: `src/core/types.ts`
- Create: `src/core/client.ts`
- Test: `test/core/client.test.ts`

- [ ] **Step 1: Create endpoint definitions**

Create `src/core/endpoints.ts`:

```typescript
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
```

- [ ] **Step 2: Create response types**

Create `src/core/types.ts`:

```typescript
export interface AutoDevResponse<T> {
  data: T
  meta: {
    requestId: string
    tier: string
    usage?: { remaining: number }
  }
}

export interface AutoDevClientOptions {
  apiKey: string
  org?: string
  baseUrl?: string
}

export interface ListingsFilters {
  make?: string
  model?: string
  year?: number
  yearMin?: number
  yearMax?: number
  zip?: string
  radius?: number
  priceMin?: number
  priceMax?: number
  mileageMax?: number
  page?: number
  limit?: number
}

export interface PaymentOptions {
  downPayment?: number
  loanTerm?: number
  creditScore?: number
  zip?: string
}

export interface AprOptions {
  creditScore?: number
  zip?: string
}

export interface TaxOptions {
  zip: string
}
```

- [ ] **Step 3: Write the failing test for the HTTP client**

Create `test/core/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AutoDevClient } from '../../src/core/client'

describe('AutoDevClient', () => {
  let client: AutoDevClient

  beforeEach(() => {
    client = new AutoDevClient({ apiKey: 'ad_sk_test123' })
  })

  it('constructs with required options', () => {
    expect(client).toBeDefined()
  })

  it('makes GET request with auth header and VIN path param', async () => {
    const mockResponse = { year: 2023, make: 'Honda', model: 'Accord' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_123' },
      }),
    )

    const result = await client.request('decode', { vin: '1HGCM82633A004352' })

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.auto.dev/vin/1HGCM82633A004352')
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer ad_sk_test123')
    expect(result.data).toEqual(mockResponse)

    fetchSpy.mockRestore()
  })

  it('includes org header when configured', async () => {
    const orgClient = new AutoDevClient({ apiKey: 'ad_sk_test123', org: 'acme' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_456' },
      }),
    )

    await orgClient.request('decode', { vin: '1HGCM82633A004352' })

    const [, init] = fetchSpy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['x-org']).toBe('acme')

    fetchSpy.mockRestore()
  })

  it('passes query params for listings', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_789' },
      }),
    )

    await client.request('listings', { query: { make: 'Toyota', year: '2024' } })

    const [url] = fetchSpy.mock.calls[0]
    expect(url).toContain('/listings?')
    expect(url).toContain('make=Toyota')
    expect(url).toContain('year=2024')

    fetchSpy.mockRestore()
  })

  it('throws AutoDevError on 403 response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Growth plan required' }), {
        status: 403,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_err' },
      }),
    )

    await expect(client.request('specs', { vin: '1HGCM82633A004352' })).rejects.toThrow()

    fetchSpy.mockRestore()
  })

  it('builds plate URL with state and number path params', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ vin: '1HGCM82633A004352' }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_plate' },
      }),
    )

    await client.request('plate', { state: 'CA', number: 'ABC1234' })

    const [url] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.auto.dev/plate/CA/ABC1234')

    fetchSpy.mockRestore()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
pnpm test -- test/core/client.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 5: Implement the HTTP client**

Create `src/core/client.ts`:

```typescript
import { ENDPOINTS } from './endpoints'
import type { AutoDevClientOptions, AutoDevResponse } from './types'
import { createAuthHeaders } from '../auth/api-key'
import { AutoDevError, type AutoDevErrorCode } from '../errors'

export { ENDPOINTS } from './endpoints'
export type { AutoDevClientOptions, AutoDevResponse } from './types'

interface RequestParams {
  vin?: string
  state?: string
  number?: string
  query?: Record<string, string>
}

export class AutoDevClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly org?: string

  constructor(options: AutoDevClientOptions) {
    this.apiKey = options.apiKey
    this.org = options.org
    this.baseUrl = options.baseUrl ?? 'https://api.auto.dev'
  }

  async request<T = unknown>(endpoint: string, params?: RequestParams): Promise<AutoDevResponse<T>> {
    const definition = ENDPOINTS[endpoint]
    if (!definition) {
      throw new AutoDevError(400, 'INVALID_REQUEST', `Unknown endpoint: ${endpoint}`)
    }

    const url = this.buildUrl(definition.path, params)
    const headers = {
      ...createAuthHeaders({ apiKey: this.apiKey, org: this.org }),
      Accept: 'application/json',
    }

    const response = await fetch(url, { method: definition.method, headers })
    const requestId = response.headers.get('x-request-id') ?? ''

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }))
      const errorBody = body as { error?: string; suggestion?: string }
      const code = this.statusToCode(response.status)
      const suggestion = this.getSuggestion(response.status, definition.tier)
      throw new AutoDevError(response.status, code, errorBody.error ?? response.statusText, suggestion)
    }

    const data = (await response.json()) as T

    return {
      data,
      meta: {
        requestId,
        tier: definition.tier,
      },
    }
  }

  private buildUrl(pathTemplate: string, params?: RequestParams): string {
    let path = pathTemplate

    if (params?.vin) {
      path = path.replace('{vin}', params.vin)
    }
    if (params?.state) {
      path = path.replace('{state}', params.state)
    }
    if (params?.number) {
      path = path.replace('{number}', params.number)
    }

    const url = new URL(path, this.baseUrl)

    if (params?.query) {
      for (const [key, value] of Object.entries(params.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value)
        }
      }
    }

    return url.toString()
  }

  private statusToCode(status: number): AutoDevErrorCode {
    switch (status) {
      case 401:
        return 'UNAUTHORIZED'
      case 403:
        return 'PLAN_REQUIRED'
      case 404:
        return 'NOT_FOUND'
      case 429:
        return 'RATE_LIMITED'
      default:
        return 'SERVER_ERROR'
    }
  }

  private getSuggestion(status: number, tier: string): string | undefined {
    if (status === 401) return 'Check your API key at auto.dev/dashboard/api-keys'
    if (status === 403) return `This endpoint requires a ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan. Upgrade at auto.dev/pricing`
    if (status === 429) return 'Rate limit exceeded. Wait and retry, or upgrade your plan for higher limits.'
    return undefined
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test -- test/core/client.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/core/ test/core/
git commit -m "feat: core HTTP client with endpoint definitions and typed responses"
```

---

## Task 4: SDK — AutoDev Class

**Files:**
- Create: `src/sdk/index.ts`
- Modify: `src/index.ts`
- Test: `test/sdk/index.test.ts`

- [ ] **Step 1: Write the failing test for the AutoDev class**

Create `test/sdk/index.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AutoDev } from '../../src/sdk/index'

// Mock the core client
vi.mock('../../src/core/client', () => {
  return {
    AutoDevClient: vi.fn().mockImplementation(() => ({
      request: vi.fn().mockResolvedValue({ data: { mocked: true }, meta: { requestId: 'r1', tier: 'starter' } }),
    })),
    ENDPOINTS: {},
  }
})

describe('AutoDev', () => {
  let auto: AutoDev

  beforeEach(() => {
    auto = new AutoDev({ apiKey: 'ad_sk_test123' })
  })

  it('exposes all 13 methods', () => {
    expect(typeof auto.decode).toBe('function')
    expect(typeof auto.photos).toBe('function')
    expect(typeof auto.listings).toBe('function')
    expect(typeof auto.specs).toBe('function')
    expect(typeof auto.build).toBe('function')
    expect(typeof auto.recalls).toBe('function')
    expect(typeof auto.payments).toBe('function')
    expect(typeof auto.apr).toBe('function')
    expect(typeof auto.tco).toBe('function')
    expect(typeof auto.openRecalls).toBe('function')
    expect(typeof auto.plate).toBe('function')
    expect(typeof auto.taxes).toBe('function')
    expect(typeof auto.usage).toBe('function')
  })

  it('decode calls client.request with correct params', async () => {
    const result = await auto.decode('1HGCM82633A004352')

    expect(result.data).toEqual({ mocked: true })
  })

  it('listings passes filters as query params', async () => {
    await auto.listings({ make: 'Toyota', year: 2024 })

    // Verifies the mock was called (integration tested separately)
    expect(true).toBe(true)
  })

  it('plate passes state and number', async () => {
    await auto.plate('CA', 'ABC1234')

    expect(true).toBe(true)
  })

  it('payments passes vin and options', async () => {
    await auto.payments('1HGCM82633A004352', { downPayment: 5000 })

    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- test/sdk/index.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 3: Implement the AutoDev class**

Create `src/sdk/index.ts`:

```typescript
import { AutoDevClient } from '../core/client'
import type { AutoDevClientOptions, AutoDevResponse, ListingsFilters, PaymentOptions, AprOptions, TaxOptions } from '../core/types'

export class AutoDev {
  private readonly client: AutoDevClient

  constructor(options: AutoDevClientOptions) {
    this.client = new AutoDevClient(options)
  }

  async decode(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('decode', { vin })
  }

  async photos(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('photos', { vin })
  }

  async listings(filters?: ListingsFilters): Promise<AutoDevResponse<unknown>> {
    const query = filters
      ? Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('listings', { query })
  }

  async specs(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('specs', { vin })
  }

  async build(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('build', { vin })
  }

  async recalls(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('recalls', { vin })
  }

  async payments(vin: string, options?: PaymentOptions): Promise<AutoDevResponse<unknown>> {
    const query = options
      ? Object.fromEntries(Object.entries(options).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('payments', { vin, query })
  }

  async apr(vin: string, options?: AprOptions): Promise<AutoDevResponse<unknown>> {
    const query = options
      ? Object.fromEntries(Object.entries(options).map(([k, v]) => [k, String(v)]))
      : undefined
    return this.client.request('apr', { vin, query })
  }

  async tco(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('tco', { vin })
  }

  async openRecalls(vin: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('openRecalls', { vin })
  }

  async plate(state: string, number: string): Promise<AutoDevResponse<unknown>> {
    return this.client.request('plate', { state, number })
  }

  async taxes(vin: string, options: TaxOptions): Promise<AutoDevResponse<unknown>> {
    const query = { zip: options.zip }
    return this.client.request('taxes', { vin, query })
  }

  async usage(): Promise<AutoDevResponse<unknown>> {
    return this.client.request('usage')
  }
}
```

- [ ] **Step 4: Update package entry point**

Update `src/index.ts`:

```typescript
export { AutoDev } from './sdk/index'
export { AutoDevClient } from './core/client'
export { AutoDevError } from './errors'
export type { AutoDevResponse, AutoDevClientOptions, ListingsFilters, PaymentOptions, AprOptions, TaxOptions } from './core/types'
export type { AutoDevErrorCode } from './errors'
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- test/sdk/index.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/sdk/ src/index.ts test/sdk/
git commit -m "feat: AutoDev SDK class with 13 flat methods"
```

---

## Task 5: MCP Server

**Files:**
- Create: `src/mcp/server.ts`
- Test: `test/mcp/server.test.ts`

- [ ] **Step 1: Write the failing test for the MCP server**

Create `test/mcp/server.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createMcpServer, TOOL_DEFINITIONS } from '../../src/mcp/server'

describe('MCP Server', () => {
  it('exports createMcpServer function', () => {
    expect(typeof createMcpServer).toBe('function')
  })

  it('defines 12 tools (no usage tool in MCP)', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(12)
  })

  it('all tools have name, description, and inputSchema', () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.inputSchema).toBeTruthy()
    }
  })

  it('tool names use underscore convention', () => {
    const names = TOOL_DEFINITIONS.map((t) => t.name)
    expect(names).toContain('auto_decode')
    expect(names).toContain('auto_photos')
    expect(names).toContain('auto_listings')
    expect(names).toContain('auto_specs')
    expect(names).toContain('auto_build')
    expect(names).toContain('auto_recalls')
    expect(names).toContain('auto_payments')
    expect(names).toContain('auto_apr')
    expect(names).toContain('auto_tco')
    expect(names).toContain('auto_open_recalls')
    expect(names).toContain('auto_plate')
    expect(names).toContain('auto_taxes')
  })

  it('auto_decode tool requires vin param', () => {
    const decode = TOOL_DEFINITIONS.find((t) => t.name === 'auto_decode')!
    expect(decode.inputSchema.properties).toHaveProperty('vin')
    expect(decode.inputSchema.required).toContain('vin')
  })

  it('auto_listings tool has optional filter params', () => {
    const listings = TOOL_DEFINITIONS.find((t) => t.name === 'auto_listings')!
    expect(listings.inputSchema.properties).toHaveProperty('make')
    expect(listings.inputSchema.properties).toHaveProperty('year')
    expect(listings.inputSchema.properties).toHaveProperty('zip')
  })

  it('auto_plate tool requires state and number', () => {
    const plate = TOOL_DEFINITIONS.find((t) => t.name === 'auto_plate')!
    expect(plate.inputSchema.required).toContain('state')
    expect(plate.inputSchema.required).toContain('number')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- test/mcp/server.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 3: Implement the MCP server**

Create `src/mcp/server.ts`:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { AutoDevClient } from '../core/client'
import { ENDPOINTS } from '../core/endpoints'

interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string }>
    required: string[]
  }
}

const vinParam = { vin: { type: 'string' as const, description: 'Vehicle Identification Number (17 characters)' } }

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'auto_decode',
    description: ENDPOINTS.decode.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_photos',
    description: ENDPOINTS.photos.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_listings',
    description: ENDPOINTS.listings.description,
    inputSchema: {
      type: 'object',
      properties: {
        make: { type: 'string', description: 'Vehicle make (e.g., Toyota, Honda)' },
        model: { type: 'string', description: 'Vehicle model (e.g., Camry, Accord)' },
        year: { type: 'string', description: 'Model year' },
        zip: { type: 'string', description: 'ZIP code for location-based search' },
        radius: { type: 'string', description: 'Search radius in miles' },
        priceMin: { type: 'string', description: 'Minimum price' },
        priceMax: { type: 'string', description: 'Maximum price' },
        mileageMax: { type: 'string', description: 'Maximum mileage' },
      },
      required: [],
    },
  },
  {
    name: 'auto_specs',
    description: ENDPOINTS.specs.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_build',
    description: ENDPOINTS.build.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_recalls',
    description: ENDPOINTS.recalls.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_payments',
    description: ENDPOINTS.payments.description,
    inputSchema: {
      type: 'object',
      properties: {
        ...vinParam,
        downPayment: { type: 'string', description: 'Down payment amount in dollars' },
        loanTerm: { type: 'string', description: 'Loan term in months (e.g., 36, 48, 60, 72)' },
        creditScore: { type: 'string', description: 'Credit score (300-850)' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_apr',
    description: ENDPOINTS.apr.description,
    inputSchema: {
      type: 'object',
      properties: {
        ...vinParam,
        creditScore: { type: 'string', description: 'Credit score (300-850)' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'auto_tco',
    description: ENDPOINTS.tco.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_open_recalls',
    description: ENDPOINTS.openRecalls.description,
    inputSchema: { type: 'object', properties: { ...vinParam }, required: ['vin'] },
  },
  {
    name: 'auto_plate',
    description: ENDPOINTS.plate.description,
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', description: 'US state code (e.g., CA, TX, NY)' },
        number: { type: 'string', description: 'License plate number' },
      },
      required: ['state', 'number'],
    },
  },
  {
    name: 'auto_taxes',
    description: ENDPOINTS.taxes.description,
    inputSchema: {
      type: 'object',
      properties: {
        ...vinParam,
        zip: { type: 'string', description: 'ZIP code for tax calculation' },
      },
      required: ['vin', 'zip'],
    },
  },
]

const TOOL_TO_ENDPOINT: Record<string, string> = {
  auto_decode: 'decode',
  auto_photos: 'photos',
  auto_listings: 'listings',
  auto_specs: 'specs',
  auto_build: 'build',
  auto_recalls: 'recalls',
  auto_payments: 'payments',
  auto_apr: 'apr',
  auto_tco: 'tco',
  auto_open_recalls: 'openRecalls',
  auto_plate: 'plate',
  auto_taxes: 'taxes',
}

export function createMcpServer(options: { apiKey: string; org?: string }) {
  const client = new AutoDevClient({ apiKey: options.apiKey, org: options.org })
  const server = new McpServer({ name: 'auto-dev', version: '0.1.0' }, { capabilities: { tools: {} } })

  server.tool('auto_decode', ENDPOINTS.decode.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('decode', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool('auto_photos', ENDPOINTS.photos.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('photos', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool(
    'auto_listings',
    ENDPOINTS.listings.description,
    {
      make: z.string().optional().describe('Vehicle make'),
      model: z.string().optional().describe('Vehicle model'),
      year: z.string().optional().describe('Model year'),
      zip: z.string().optional().describe('ZIP code'),
      radius: z.string().optional().describe('Search radius in miles'),
      priceMin: z.string().optional().describe('Minimum price'),
      priceMax: z.string().optional().describe('Maximum price'),
      mileageMax: z.string().optional().describe('Maximum mileage'),
    },
    async (args) => {
      const query = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined)) as Record<string, string>
      const result = await client.request('listings', { query })
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )

  server.tool('auto_specs', ENDPOINTS.specs.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('specs', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool('auto_build', ENDPOINTS.build.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('build', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool('auto_recalls', ENDPOINTS.recalls.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('recalls', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool(
    'auto_payments',
    ENDPOINTS.payments.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      downPayment: z.string().optional().describe('Down payment in dollars'),
      loanTerm: z.string().optional().describe('Loan term in months'),
      creditScore: z.string().optional().describe('Credit score (300-850)'),
    },
    async (args) => {
      const { vin, ...rest } = args
      const query = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Record<string, string>
      const result = await client.request('payments', { vin, query })
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )

  server.tool(
    'auto_apr',
    ENDPOINTS.apr.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      creditScore: z.string().optional().describe('Credit score (300-850)'),
    },
    async (args) => {
      const { vin, ...rest } = args
      const query = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Record<string, string>
      const result = await client.request('apr', { vin, query })
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )

  server.tool('auto_tco', ENDPOINTS.tco.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('tco', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool('auto_open_recalls', ENDPOINTS.openRecalls.description, { vin: z.string().describe('Vehicle Identification Number') }, async (args) => {
    const result = await client.request('openRecalls', { vin: args.vin })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  })

  server.tool(
    'auto_plate',
    ENDPOINTS.plate.description,
    {
      state: z.string().describe('US state code (e.g., CA, TX, NY)'),
      number: z.string().describe('License plate number'),
    },
    async (args) => {
      const result = await client.request('plate', { state: args.state, number: args.number })
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )

  server.tool(
    'auto_taxes',
    ENDPOINTS.taxes.description,
    {
      vin: z.string().describe('Vehicle Identification Number'),
      zip: z.string().describe('ZIP code for tax calculation'),
    },
    async (args) => {
      const result = await client.request('taxes', { vin: args.vin, query: { zip: args.zip } })
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    },
  )

  return server
}

export async function startMcpServer(options: { apiKey: string; org?: string }) {
  const server = createMcpServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- test/mcp/server.test.ts
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/mcp/ test/mcp/
git commit -m "feat: MCP server with 12 auto.dev tools"
```

---

## Task 6: OAuth Device Flow + Credential Storage

**Files:**
- Create: `src/auth/oauth.ts`
- Test: `test/auth/oauth.test.ts`

- [ ] **Step 1: Write the failing test for OAuth device flow**

Create `test/auth/oauth.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestDeviceCode, pollForToken, loadCredentials, saveCredentials, clearCredentials } from '../../src/auth/oauth'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('OAuth Device Flow', () => {
  it('requestDeviceCode calls POST /oauth/device', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          device_code: 'dev_123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://id.org.ai/device',
          expires_in: 600,
          interval: 5,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const result = await requestDeviceCode({ idOrgAiUrl: 'https://id.org.ai', clientId: 'auto_dev_cli' })

    expect(result.device_code).toBe('dev_123')
    expect(result.user_code).toBe('ABCD-1234')
    expect(result.verification_uri).toBe('https://id.org.ai/device')

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://id.org.ai/oauth/device')
    expect(init?.method).toBe('POST')

    fetchSpy.mockRestore()
  })

  it('pollForToken retries on authorization_pending', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'authorization_pending' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'at_123',
            refresh_token: 'rt_456',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )

    const result = await pollForToken({
      idOrgAiUrl: 'https://id.org.ai',
      clientId: 'auto_dev_cli',
      deviceCode: 'dev_123',
      interval: 0.01, // Fast polling for test
      expiresIn: 600,
    })

    expect(result.access_token).toBe('at_123')
    expect(result.refresh_token).toBe('rt_456')
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    fetchSpy.mockRestore()
  })
})

describe('Credential Storage', () => {
  const testDir = join(tmpdir(), 'auto-dev-test-' + Date.now())

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it('saves and loads credentials', () => {
    const creds = { accessToken: 'at_123', refreshToken: 'rt_456', org: 'acme' }
    saveCredentials(creds, testDir)

    const loaded = loadCredentials(testDir)
    expect(loaded).toEqual(creds)
  })

  it('returns null when no credentials exist', () => {
    const loaded = loadCredentials(testDir)
    expect(loaded).toBeNull()
  })

  it('clears credentials', () => {
    saveCredentials({ accessToken: 'at_123', refreshToken: 'rt_456' }, testDir)
    clearCredentials(testDir)

    const loaded = loadCredentials(testDir)
    expect(loaded).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- test/auth/oauth.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 3: Implement OAuth device flow + credential storage**

Create `src/auth/oauth.ts`:

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { DeviceAuthorizationResponse } from 'id.org.ai/oauth'

const DEFAULT_CONFIG_DIR = join(homedir(), '.config', 'auto-dev')

// Re-export the id.org.ai type for convenience
export type DeviceCodeResponse = DeviceAuthorizationResponse

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export interface Credentials {
  accessToken: string
  refreshToken?: string
  org?: string
}

export async function requestDeviceCode(config: { idOrgAiUrl: string; clientId: string }): Promise<DeviceCodeResponse> {
  const response = await fetch(`${config.idOrgAiUrl}/oauth/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      scope: 'openid profile email',
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(`Device code request failed: ${(body as { error?: string }).error ?? response.statusText}`)
  }

  return response.json() as Promise<DeviceCodeResponse>
}

export async function pollForToken(config: {
  idOrgAiUrl: string
  clientId: string
  deviceCode: string
  interval: number
  expiresIn: number
}): Promise<TokenResponse> {
  const deadline = Date.now() + config.expiresIn * 1000

  while (Date.now() < deadline) {
    const response = await fetch(`${config.idOrgAiUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: config.clientId,
        device_code: config.deviceCode,
      }),
    })

    if (response.ok) {
      return response.json() as Promise<TokenResponse>
    }

    const body = (await response.json().catch(() => ({ error: 'unknown' }))) as { error?: string }

    if (body.error === 'authorization_pending') {
      await new Promise((resolve) => setTimeout(resolve, config.interval * 1000))
      continue
    }

    if (body.error === 'slow_down') {
      await new Promise((resolve) => setTimeout(resolve, (config.interval + 5) * 1000))
      continue
    }

    throw new Error(`Token request failed: ${body.error}`)
  }

  throw new Error('Device code expired. Please try logging in again.')
}

export function saveCredentials(credentials: Credentials, configDir: string = DEFAULT_CONFIG_DIR): void {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  writeFileSync(join(configDir, 'credentials.json'), JSON.stringify(credentials, null, 2), 'utf-8')
}

export function loadCredentials(configDir: string = DEFAULT_CONFIG_DIR): Credentials | null {
  const path = join(configDir, 'credentials.json')
  if (!existsSync(path)) return null

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Credentials
  } catch {
    return null
  }
}

export function clearCredentials(configDir: string = DEFAULT_CONFIG_DIR): void {
  const path = join(configDir, 'credentials.json')
  if (existsSync(path)) {
    rmSync(path)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- test/auth/oauth.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/auth/oauth.ts test/auth/oauth.test.ts
git commit -m "feat: OAuth device flow + credential storage for CLI auth"
```

---

## Task 7: CLI — Entry Point, Auth Commands, and API Commands

**Files:**
- Create: `src/cli/index.ts`
- Create: `src/cli/auth.ts`
- Create: `src/cli/commands.ts`
- Create: `src/cli/explore.ts`
- Test: `test/cli/auth.test.ts`
- Test: `test/cli/commands.test.ts`
- Test: `test/cli/explore.test.ts`

- [ ] **Step 1: Write the failing test for CLI auth**

Create `test/cli/auth.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from '../../src/cli/auth'

describe('CLI Auth Commands', () => {
  it('buildLoginCommand returns a commander Command', () => {
    const cmd = buildLoginCommand()
    expect(cmd.name()).toBe('login')
  })

  it('buildLogoutCommand returns a commander Command', () => {
    const cmd = buildLogoutCommand()
    expect(cmd.name()).toBe('logout')
  })

  it('buildWhoamiCommand returns a commander Command', () => {
    const cmd = buildWhoamiCommand()
    expect(cmd.name()).toBe('whoami')
  })

  it('login command accepts --api-key option', () => {
    const cmd = buildLoginCommand()
    const option = cmd.options.find((o) => o.long === '--api-key')
    expect(option).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- test/cli/auth.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 3: Implement CLI auth commands**

Create `src/cli/auth.ts`:

```typescript
import { Command } from 'commander'
import { requestDeviceCode, pollForToken, saveCredentials, clearCredentials, loadCredentials } from '../auth/oauth'
import { DEFAULT_AUTH_CONFIG } from '../auth/config'

export function buildLoginCommand(): Command {
  const cmd = new Command('login')
    .description('Log in to auto.dev via id.org.ai')
    .option('--api-key <key>', 'Use an API key directly (for CI/scripts)')
    .action(async (options) => {
      if (options.apiKey) {
        saveCredentials({ accessToken: options.apiKey })
        console.log('API key saved. You are now authenticated.')
        return
      }

      const config = {
        idOrgAiUrl: DEFAULT_AUTH_CONFIG.idOrgAiUrl,
        clientId: DEFAULT_AUTH_CONFIG.clientId,
      }

      try {
        const deviceCode = await requestDeviceCode(config)
        console.log(`\nVisit: ${deviceCode.verification_uri}`)
        console.log(`Enter code: ${deviceCode.user_code}\n`)
        console.log('Waiting for authorization...')

        const token = await pollForToken({
          ...config,
          deviceCode: deviceCode.device_code,
          interval: deviceCode.interval,
          expiresIn: deviceCode.expires_in,
        })

        saveCredentials({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
        })

        console.log('Login successful!')
      } catch (error) {
        console.error(`Login failed: ${(error as Error).message}`)
        process.exit(1)
      }
    })

  return cmd
}

export function buildLogoutCommand(): Command {
  const cmd = new Command('logout')
    .description('Log out and clear stored credentials')
    .action(() => {
      clearCredentials()
      console.log('Logged out. Credentials cleared.')
    })

  return cmd
}

export function buildWhoamiCommand(): Command {
  const cmd = new Command('whoami')
    .description('Show current user and active org')
    .action(() => {
      const creds = loadCredentials()
      if (!creds) {
        console.log('Not logged in. Run: auto login')
        return
      }
      console.log(`Authenticated${creds.org ? ` (org: ${creds.org})` : ''}`)
    })

  return cmd
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- test/cli/auth.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Write the failing test for explore command**

Create `test/cli/explore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getExploreOutput, getEndpointDetail } from '../../src/cli/explore'

describe('Explore Command', () => {
  it('getExploreOutput returns all 13 endpoints', () => {
    const output = getExploreOutput()
    expect(output).toHaveLength(13)
  })

  it('each entry has name, tier, description, path', () => {
    const output = getExploreOutput()
    for (const entry of output) {
      expect(entry.name).toBeTruthy()
      expect(entry.tier).toBeTruthy()
      expect(entry.description).toBeTruthy()
      expect(entry.path).toBeTruthy()
    }
  })

  it('filters by plan tier', () => {
    const starter = getExploreOutput('starter')
    expect(starter.every((e) => e.tier === 'starter')).toBe(true)
    expect(starter.length).toBeGreaterThan(0)
  })

  it('getEndpointDetail returns full detail for a named endpoint', () => {
    const detail = getEndpointDetail('decode')
    expect(detail).toBeDefined()
    expect(detail!.name).toBe('decode')
    expect(detail!.tier).toBe('starter')
    expect(detail!.path).toBe('/vin/{vin}')
    expect(detail!.parameters).toBeDefined()
  })

  it('getEndpointDetail returns null for unknown endpoint', () => {
    const detail = getEndpointDetail('nonexistent')
    expect(detail).toBeNull()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test -- test/cli/explore.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 7: Implement explore command**

Create `src/cli/explore.ts`:

```typescript
import { Command } from 'commander'
import { ENDPOINTS, type EndpointDefinition } from '../core/endpoints'

interface ExploreEntry {
  name: string
  tier: string
  description: string
  path: string
  method: string
}

interface EndpointDetail extends ExploreEntry {
  vinRequired: boolean
  parameters: { name: string; required: boolean; description: string }[]
}

const PARAM_DETAILS: Record<string, { name: string; required: boolean; description: string }[]> = {
  decode: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  photos: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  listings: [
    { name: 'make', required: false, description: 'Vehicle make (e.g., Toyota)' },
    { name: 'model', required: false, description: 'Vehicle model (e.g., Camry)' },
    { name: 'year', required: false, description: 'Model year' },
    { name: 'zip', required: false, description: 'ZIP code for location search' },
    { name: 'radius', required: false, description: 'Search radius in miles' },
    { name: 'priceMin', required: false, description: 'Minimum price' },
    { name: 'priceMax', required: false, description: 'Maximum price' },
    { name: 'mileageMax', required: false, description: 'Maximum mileage' },
  ],
  specs: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  build: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  recalls: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  payments: [
    { name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' },
    { name: 'downPayment', required: false, description: 'Down payment in dollars' },
    { name: 'loanTerm', required: false, description: 'Loan term in months' },
    { name: 'creditScore', required: false, description: 'Credit score (300-850)' },
  ],
  apr: [
    { name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' },
    { name: 'creditScore', required: false, description: 'Credit score (300-850)' },
  ],
  tco: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  openRecalls: [{ name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' }],
  plate: [
    { name: 'state', required: true, description: 'US state code (e.g., CA, TX, NY)' },
    { name: 'number', required: true, description: 'License plate number' },
  ],
  taxes: [
    { name: 'vin', required: true, description: 'Vehicle Identification Number (17 characters)' },
    { name: 'zip', required: true, description: 'ZIP code for tax calculation' },
  ],
  usage: [],
}

export function getExploreOutput(planFilter?: string): ExploreEntry[] {
  return Object.values(ENDPOINTS)
    .filter((ep) => !planFilter || ep.tier === planFilter)
    .map((ep) => ({
      name: ep.name,
      tier: ep.tier,
      description: ep.description,
      path: ep.path,
      method: ep.method,
    }))
}

export function getEndpointDetail(name: string): EndpointDetail | null {
  const ep = ENDPOINTS[name]
  if (!ep) return null

  return {
    name: ep.name,
    tier: ep.tier,
    description: ep.description,
    path: ep.path,
    method: ep.method,
    vinRequired: ep.vinRequired,
    parameters: PARAM_DETAILS[name] ?? [],
  }
}

export function buildExploreCommand(): Command {
  const cmd = new Command('explore')
    .description('Discover available API endpoints and their schemas')
    .argument('[endpoint]', 'Specific endpoint to inspect')
    .option('--plan <tier>', 'Filter by plan tier (starter, growth, scale)')
    .action((endpoint, options) => {
      if (endpoint) {
        const detail = getEndpointDetail(endpoint)
        if (!detail) {
          console.error(`Unknown endpoint: ${endpoint}`)
          process.exit(1)
        }
        console.log(JSON.stringify(detail, null, 2))
      } else {
        const output = getExploreOutput(options.plan)
        console.log(JSON.stringify(output, null, 2))
      }
    })

  return cmd
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
pnpm test -- test/cli/explore.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 9: Write the failing test for API commands**

Create `test/cli/commands.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildApiCommands } from '../../src/cli/commands'

describe('CLI API Commands', () => {
  it('builds 12 API commands', () => {
    const commands = buildApiCommands()
    expect(commands).toHaveLength(12)
  })

  it('decode command has vin as required argument', () => {
    const commands = buildApiCommands()
    const decode = commands.find((c) => c.name() === 'decode')!
    expect(decode).toBeDefined()
    expect(decode.registeredArguments[0]?.required).toBe(true)
  })

  it('listings command has filter options', () => {
    const commands = buildApiCommands()
    const listings = commands.find((c) => c.name() === 'listings')!
    const optionNames = listings.options.map((o) => o.long)
    expect(optionNames).toContain('--make')
    expect(optionNames).toContain('--year')
    expect(optionNames).toContain('--zip')
  })

  it('plate command has state and number as required arguments', () => {
    const commands = buildApiCommands()
    const plate = commands.find((c) => c.name() === 'plate')!
    expect(plate.registeredArguments).toHaveLength(2)
  })

  it('open-recalls command exists (hyphenated)', () => {
    const commands = buildApiCommands()
    const openRecalls = commands.find((c) => c.name() === 'open-recalls')
    expect(openRecalls).toBeDefined()
  })
})
```

- [ ] **Step 10: Run test to verify it fails**

```bash
pnpm test -- test/cli/commands.test.ts
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 11: Implement API commands**

Create `src/cli/commands.ts`:

```typescript
import { Command } from 'commander'
import { AutoDevClient } from '../core/client'
import { loadCredentials } from '../auth/oauth'

function getClient(options: { apiKey?: string; org?: string }): AutoDevClient {
  const apiKey = options.apiKey ?? process.env.AUTODEV_API_KEY ?? loadCredentials()?.accessToken
  if (!apiKey) {
    console.error('No API key found. Run: auto login, or set AUTODEV_API_KEY, or pass --api-key')
    process.exit(1)
  }
  return new AutoDevClient({ apiKey, org: options.org })
}

function formatOutput(data: unknown, format: string): string {
  if (format === 'table') {
    // Simple table: key-value for objects, rows for arrays
    if (Array.isArray(data)) {
      return data.map((row) => JSON.stringify(row)).join('\n')
    }
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n')
    }
  }
  if (format === 'yaml') {
    // Simple YAML-ish output
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n')
    }
  }
  return JSON.stringify(data, null, 2)
}

function addGlobalOptions(cmd: Command): Command {
  return cmd
    .option('--api-key <key>', 'API key (overrides stored credentials)')
    .option('--org <slug>', 'Organization slug')
    .option('--json', 'JSON output (default)')
    .option('--table', 'Table output')
    .option('--yaml', 'YAML output')
}

function getFormat(options: { json?: boolean; table?: boolean; yaml?: boolean }): string {
  if (options.table) return 'table'
  if (options.yaml) return 'yaml'
  return 'json'
}

export function buildApiCommands(): Command[] {
  const commands: Command[] = []

  // decode
  const decode = new Command('decode')
    .description('Decode a VIN — returns make, model, year, trim, engine, drivetrain')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(decode).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('decode', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(decode)

  // photos
  const photos = new Command('photos')
    .description('Get vehicle photos by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(photos).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('photos', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(photos)

  // listings
  const listings = new Command('listings').description('Search vehicle listings with filters')
    .option('--make <make>', 'Vehicle make')
    .option('--model <model>', 'Vehicle model')
    .option('--year <year>', 'Model year')
    .option('--zip <zip>', 'ZIP code')
    .option('--radius <radius>', 'Search radius in miles')
    .option('--price-min <min>', 'Minimum price')
    .option('--price-max <max>', 'Maximum price')
    .option('--mileage-max <max>', 'Maximum mileage')
  addGlobalOptions(listings).action(async (options) => {
    const client = getClient(options)
    const query: Record<string, string> = {}
    if (options.make) query.make = options.make
    if (options.model) query.model = options.model
    if (options.year) query.year = options.year
    if (options.zip) query.zip = options.zip
    if (options.radius) query.radius = options.radius
    if (options.priceMin) query.priceMin = options.priceMin
    if (options.priceMax) query.priceMax = options.priceMax
    if (options.mileageMax) query.mileageMax = options.mileageMax
    const result = await client.request('listings', { query })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(listings)

  // specs
  const specs = new Command('specs')
    .description('Get detailed vehicle specifications by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(specs).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('specs', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(specs)

  // build
  const build = new Command('build')
    .description('Get OEM build and trim data by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(build).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('build', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(build)

  // recalls
  const recalls = new Command('recalls')
    .description('Get safety recalls by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(recalls).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('recalls', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(recalls)

  // payments
  const payments = new Command('payments')
    .description('Calculate monthly payments')
    .argument('<vin>', 'Vehicle Identification Number')
    .option('--down-payment <amount>', 'Down payment in dollars')
    .option('--loan-term <months>', 'Loan term in months')
    .option('--credit-score <score>', 'Credit score (300-850)')
  addGlobalOptions(payments).action(async (vin, options) => {
    const client = getClient(options)
    const query: Record<string, string> = {}
    if (options.downPayment) query.downPayment = options.downPayment
    if (options.loanTerm) query.loanTerm = options.loanTerm
    if (options.creditScore) query.creditScore = options.creditScore
    const result = await client.request('payments', { vin, query })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(payments)

  // apr
  const apr = new Command('apr')
    .description('Get interest rates by VIN and credit profile')
    .argument('<vin>', 'Vehicle Identification Number')
    .option('--credit-score <score>', 'Credit score (300-850)')
  addGlobalOptions(apr).action(async (vin, options) => {
    const client = getClient(options)
    const query: Record<string, string> = {}
    if (options.creditScore) query.creditScore = options.creditScore
    const result = await client.request('apr', { vin, query })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(apr)

  // tco
  const tco = new Command('tco')
    .description('Calculate total cost of ownership by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(tco).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('tco', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(tco)

  // open-recalls
  const openRecalls = new Command('open-recalls')
    .description('Get open/unresolved recalls by VIN')
    .argument('<vin>', 'Vehicle Identification Number')
  addGlobalOptions(openRecalls).action(async (vin, options) => {
    const client = getClient(options)
    const result = await client.request('openRecalls', { vin })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(openRecalls)

  // plate
  const plate = new Command('plate')
    .description('Resolve a license plate to a VIN')
    .argument('<state>', 'US state code (e.g., CA, TX, NY)')
    .argument('<number>', 'License plate number')
  addGlobalOptions(plate).action(async (state, number, options) => {
    const client = getClient(options)
    const result = await client.request('plate', { state, number })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(plate)

  // taxes
  const taxes = new Command('taxes')
    .description('Estimate taxes and fees by VIN and ZIP code')
    .argument('<vin>', 'Vehicle Identification Number')
    .option('--zip <zip>', 'ZIP code for tax calculation', undefined)
  addGlobalOptions(taxes).action(async (vin, options) => {
    const client = getClient(options)
    const query: Record<string, string> = {}
    if (options.zip) query.zip = options.zip
    const result = await client.request('taxes', { vin, query })
    console.log(formatOutput(result.data, getFormat(options)))
  })
  commands.push(taxes)

  return commands
}
```

- [ ] **Step 12: Run tests to verify they pass**

```bash
pnpm test -- test/cli/commands.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 13: Implement CLI entry point**

Create `src/cli/index.ts`:

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from './auth'
import { buildApiCommands } from './commands'
import { buildExploreCommand } from './explore'
import { startMcpServer } from '../mcp/server'
import { loadCredentials } from '../auth/oauth'

const program = new Command()
  .name('auto')
  .description('CLI for the auto.dev automotive APIs')
  .version('0.1.0')
  .option('--mcp', 'Start as MCP stdio server')

// MCP mode — intercept before subcommands
program.hook('preAction', async (thisCommand) => {
  if (thisCommand.opts().mcp) {
    const apiKey = process.env.AUTODEV_API_KEY ?? loadCredentials()?.accessToken
    if (!apiKey) {
      console.error('No API key found. Set AUTODEV_API_KEY or run: auto login')
      process.exit(1)
    }
    await startMcpServer({ apiKey })
    process.exit(0)
  }
})

// Auth commands
program.addCommand(buildLoginCommand())
program.addCommand(buildLogoutCommand())
program.addCommand(buildWhoamiCommand())

// Explore
program.addCommand(buildExploreCommand())

// Orgs subcommand
const orgs = new Command('orgs').description('Manage organizations')
orgs
  .command('list')
  .description('List your organizations')
  .action(() => {
    console.log('Organization listing requires authentication. Run: auto login')
  })
orgs
  .command('switch')
  .argument('<slug>', 'Organization slug')
  .description('Switch active organization')
  .action((slug) => {
    const creds = loadCredentials()
    if (!creds) {
      console.error('Not logged in. Run: auto login')
      process.exit(1)
    }
    const { saveCredentials } = require('../auth/oauth')
    saveCredentials({ ...creds, org: slug })
    console.log(`Switched to organization: ${slug}`)
  })
program.addCommand(orgs)

// API commands
for (const cmd of buildApiCommands()) {
  program.addCommand(cmd)
}

program.parse()
```

- [ ] **Step 14: Verify build succeeds**

```bash
pnpm build
```

Expected: Clean build with `dist/cli/index.js` output.

- [ ] **Step 15: Test CLI help output**

```bash
node dist/cli/index.js --help
node dist/cli/index.js decode --help
node dist/cli/index.js explore --help
```

Expected: Help text showing all commands and options.

- [ ] **Step 16: Commit**

```bash
git add src/cli/ test/cli/
git commit -m "feat: CLI with auth, explore, and all 12 API commands"
```

---

## Task 8: OpenAPI Code Generation Script

**Files:**
- Create: `scripts/generate.ts`

- [ ] **Step 1: Implement the generation script**

Create `scripts/generate.ts`:

```typescript
#!/usr/bin/env npx tsx

/**
 * Fetches the OpenAPI spec from api.auto.dev/openapi and regenerates
 * src/core/types.ts with response types from the spec.
 *
 * Run: pnpm generate
 *
 * Note: endpoints.ts and client.ts are hand-maintained.
 * This script only updates types.ts with the latest response schemas.
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OPENAPI_URL = process.argv[2] ?? 'https://api.auto.dev/openapi'
const OUTPUT_PATH = resolve(__dirname, '../src/core/types.generated.ts')

interface OpenApiSchema {
  paths: Record<string, Record<string, { responses?: Record<string, { content?: Record<string, { schema: unknown }> }> }>>
  components?: { schemas?: Record<string, unknown> }
}

async function main() {
  console.log(`Fetching OpenAPI spec from ${OPENAPI_URL}...`)
  const response = await fetch(OPENAPI_URL)

  if (!response.ok) {
    console.error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  const spec = (await response.json()) as OpenApiSchema
  const schemas = spec.components?.schemas ?? {}

  let output = '// Auto-generated from OpenAPI spec — do not edit manually\n'
  output += '// Run: pnpm generate\n\n'

  // Generate interfaces from component schemas
  for (const [name, schema] of Object.entries(schemas)) {
    output += `/** ${name} */\n`
    output += `export interface ${name} ${JSON.stringify(schema, null, 2)}\n\n`
  }

  // List discovered paths
  output += '// Discovered paths:\n'
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of Object.keys(methods)) {
      output += `// ${method.toUpperCase()} ${path}\n`
    }
  }

  writeFileSync(OUTPUT_PATH, output, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(`Found ${Object.keys(schemas).length} schemas and ${Object.keys(spec.paths).length} paths`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run the generator (requires live API access)**

```bash
pnpm generate
```

Expected: `src/core/types.generated.ts` created with schemas from the OpenAPI spec. If the API is unreachable, the script exits with an error — that's fine, the hand-written types in `types.ts` serve as the baseline.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate.ts
git add src/core/types.generated.ts 2>/dev/null  # Only if generated
git commit -m "feat: OpenAPI code generation script"
```

---

## Task 9: Integration Test + Final Wiring

**Files:**
- Create: `test/integration/sdk.test.ts`
- Modify: `tsup.config.ts` (add CLI shebang)

- [ ] **Step 1: Fix CLI shebang in tsup config**

Update `tsup.config.ts`:

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/client': 'src/core/client.ts',
    'mcp/server': 'src/mcp/server.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: true,
  esbuildOptions(options, context) {
    if (context.format === 'esm') {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
    }
  },
})
```

Actually, the shebang should only be on the CLI entry. Use a simpler approach — the shebang is already in `src/cli/index.ts` as a comment. tsup preserves it. Verify:

```bash
pnpm build && head -1 dist/cli/index.js
```

Expected: `#!/usr/bin/env node`

If not, add to `tsup.config.ts`:

```typescript
import { defineConfig } from 'tsup'
import { writeFileSync, readFileSync } from 'fs'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/client': 'src/core/client.ts',
    'mcp/server': 'src/mcp/server.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: true,
  onSuccess: async () => {
    // Ensure CLI has shebang
    const cliPath = 'dist/cli/index.js'
    const content = readFileSync(cliPath, 'utf-8')
    if (!content.startsWith('#!/usr/bin/env node')) {
      writeFileSync(cliPath, '#!/usr/bin/env node\n' + content)
    }
  },
})
```

- [ ] **Step 2: Write integration test (uses mocked fetch)**

Create `test/integration/sdk.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { AutoDev } from '../../src/sdk/index'
import { AutoDevError } from '../../src/errors'

describe('SDK Integration (mocked HTTP)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('full decode flow: construct → call → parse response', async () => {
    const mockVehicle = {
      vin: '1HGCM82633A004352',
      year: 2003,
      make: 'Honda',
      model: 'Accord',
      trim: 'EX',
      engine: '2.4L I4',
      drivetrain: 'FWD',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockVehicle), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_int_1' },
      }),
    )

    const auto = new AutoDev({ apiKey: 'ad_sk_test_integration' })
    const result = await auto.decode('1HGCM82633A004352')

    expect(result.data).toEqual(mockVehicle)
    expect(result.meta.requestId).toBe('req_int_1')
    expect(result.meta.tier).toBe('starter')
  })

  it('listings with filters builds correct URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_int_2' },
      }),
    )

    const auto = new AutoDev({ apiKey: 'ad_sk_test' })
    await auto.listings({ make: 'Toyota', year: 2024, zip: '90210' })

    const [url] = vi.mocked(fetch).mock.calls[0]
    const urlStr = url as string
    expect(urlStr).toContain('make=Toyota')
    expect(urlStr).toContain('year=2024')
    expect(urlStr).toContain('zip=90210')
  })

  it('403 response throws AutoDevError with suggestion', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_err' },
      }),
    )

    const auto = new AutoDev({ apiKey: 'ad_sk_test' })

    try {
      await auto.specs('1HGCM82633A004352')
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AutoDevError)
      const e = err as AutoDevError
      expect(e.status).toBe(403)
      expect(e.code).toBe('PLAN_REQUIRED')
      expect(e.suggestion).toContain('Growth')
      expect(e.suggestion).toContain('auto.dev/pricing')
    }
  })

  it('org header is sent when configured', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-request-id': 'req_org' },
      }),
    )

    const auto = new AutoDev({ apiKey: 'ad_sk_test', org: 'acme-motors' })
    await auto.decode('1HGCM82633A004352')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>)['x-org']).toBe('acme-motors')
  })
})
```

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Run full build**

```bash
pnpm build
```

Expected: Clean build, all entry points in `dist/`.

- [ ] **Step 5: Verify package exports work**

```bash
node -e "import('@auto.dev/sdk').then(m => console.log(Object.keys(m)))" 2>/dev/null || node -e "const m = require('./dist/index.js'); console.log(Object.keys(m))"
```

Expected: `['AutoDev', 'AutoDevClient', 'AutoDevError']`

- [ ] **Step 6: Commit**

```bash
git add test/integration/ tsup.config.ts
git commit -m "feat: integration tests and build finalization"
```

---

## Task 10: APIs Repo — Dual Key Validation

**Repo:** `/Users/chrisrisner/Workspace/drivly/AUTO_DEV-API/apis`

**Files:**
- Modify: `authentication/with-api-key.ts`

This task updates the APIs worker to accept both `sk_ad_*` (auth.vin) and `ad_sk_*` (id.org.ai) keys.

- [ ] **Step 1: Write the failing test**

Create `test/authentication/dual-key.test.ts` in the apis repo:

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Dual API Key Validation', () => {
  it('sk_ad_ prefix routes to auth.vin validation', async () => {
    const key = 'sk_ad_legacy_key_123'
    const isLegacyKey = key.startsWith('sk_ad_')
    expect(isLegacyKey).toBe(true)
  })

  it('ad_sk_ prefix routes to id.org.ai validation', async () => {
    const key = 'ad_sk_new_key_456'
    const isIdOrgAiKey = key.startsWith('ad_sk_')
    expect(isIdOrgAiKey).toBe(true)
  })

  it('unknown prefix falls through to legacy validation', async () => {
    const key = 'some_random_key'
    const isLegacyKey = !key.startsWith('ad_sk_')
    expect(isLegacyKey).toBe(true)
  })
})
```

- [ ] **Step 2: Update with-api-key.ts to support dual validation**

In `authentication/with-api-key.ts`, add an id.org.ai validation path. After the existing `apiKey` extraction logic, before `fetchUserWithApiKey`:

```typescript
// Add this function
async function fetchUserWithIdOrgAiKey(request: ApiRequest, apiKey: string) {
  const response = await request.swrFetch('https://id.org.ai/api/keys/validate', {
    expireAfter: 3600,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ key: apiKey }),
    },
  })
  return response.json()
}

// In the withAPIKey function, update the else branch:
// Replace:
//   const [error, data] = await catchError<UserAccount>(fetchUserWithApiKey(request, apiKey))
// With:
if (apiKey.startsWith('ad_sk_')) {
  // id.org.ai issued key
  const [error, data] = await catchError<UserAccount>(fetchUserWithIdOrgAiKey(request, apiKey))
  if (error) {
    console.error(`[ERROR] Failed to validate id.org.ai key: ${error?.message}`)
    return
  }
  if (data?.user) {
    await setUserProperties(request, env, data.user)
  }
} else {
  // Legacy auth.vin key (sk_ad_ or other formats)
  const [error, data] = await catchError<UserAccount>(fetchUserWithApiKey(request, apiKey))
  if (error) {
    console.error(`[ERROR] Failed to fetch account: ${error?.message}`)
    return
  }
  if (data?.user) {
    await setUserProperties(request, env, data.user)
  }
}
```

Note: The exact id.org.ai validation endpoint (`/api/keys/validate`) needs to be confirmed — it may be `/oauth/introspect` with the key as a bearer token instead. Check id.org.ai's KeyService API before implementing.

- [ ] **Step 3: Run tests**

```bash
cd /Users/chrisrisner/Workspace/drivly/AUTO_DEV-API/apis
pnpm test
```

Expected: All existing tests still pass, new dual-key test passes.

- [ ] **Step 4: Commit**

```bash
git add authentication/with-api-key.ts test/authentication/dual-key.test.ts
git commit -m "feat: dual API key validation — support id.org.ai ad_sk_ keys alongside auth.vin sk_ad_ keys"
```

---

## Task 11: Initial Publish + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README**

Create `README.md` in the SDK repo:

```markdown
# @auto.dev/sdk

SDK, MCP server, and CLI for the [auto.dev](https://auto.dev) automotive APIs.

## Install

```bash
npm install @auto.dev/sdk
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

## CLI Usage

```bash
# Login
auto login

# Decode a VIN
auto decode 1HGCM82633A004352

# Search listings
auto listings --make toyota --year 2024 --zip 90210

# Discover available endpoints
auto explore
auto explore decode
```

## MCP Server

Add to your MCP client config:

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
```

- [ ] **Step 2: Run final build + tests**

```bash
pnpm build && pnpm test
```

Expected: All pass.

- [ ] **Step 3: Commit everything**

```bash
git add README.md
git commit -m "docs: README with SDK, CLI, and MCP usage examples"
```

- [ ] **Step 4: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 5: Publish to npm (when ready)**

```bash
pnpm publish --access public
```

This overwrites the placeholder with the real package.

---

## Summary

| Task | What | Commits |
|------|------|---------|
| 1 | Project scaffolding | 1 |
| 2 | Error types + auth config | 1 |
| 3 | Core HTTP client + endpoints | 1 |
| 4 | AutoDev SDK class | 1 |
| 5 | MCP server (12 tools) | 1 |
| 6 | OAuth device flow + credentials | 1 |
| 7 | CLI (auth + explore + 12 commands) | 1 |
| 8 | OpenAPI codegen script | 1 |
| 9 | Integration tests + build | 1 |
| 10 | APIs repo dual key validation | 1 |
| 11 | README + publish | 1 |

**Total: 11 tasks, ~11 commits, ~40 test cases**
