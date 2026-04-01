# id.org.ai Auth Middleware for auto.dev APIs

## Problem

The auto.dev CLI authenticates users via id.org.ai's OAuth device flow, which issues RS256 JWTs. The APIs worker currently only supports:
- **API keys** validated against `auth.vin/api/users/me` (`withAPIKey`)
- **Session cookies** verified with HS256 shared secret (`withJWT`)

CLI users sending `Authorization: Bearer <id.org.ai JWT>` are not authenticated by either middleware — the JWT gets skipped by `withAPIKey` (starts with `eyJ`) and missed by `withJWT` (not in a session cookie).

## Solution

Add a new `withIdOrgAi` middleware to the APIs worker that handles id.org.ai RS256 JWTs.

## Architecture

### Middleware Chain

```
withAPIKey → withJWT → withIdOrgAi
```

Each middleware checks `if (request.user?.authenticated) return` at the top. First one to authenticate wins, rest skip. No changes to existing middleware.

### withIdOrgAi Flow

```
1. If user already authenticated → return (skip)
2. Extract Bearer token from Authorization header
3. If no token or not a JWT (no eyJ prefix / not 3 dot-separated segments) → return (skip)
4. Verify JWT signature via id.org.ai JWKS
   - Fetch JWKS from https://id.org.ai/.well-known/jwks.json (cached via SWR)
   - Verify RS256 signature using jose library (already a dependency)
   - Validate issuer, expiration
5. Call id.org.ai /api/me with Bearer token (cached via SWR)
   - Response: { authenticated, user: { id, email, name, org } }
6. Look up user in auth.vin by email
   - Call auth.vin/api/users/by-email/{email} or similar (cached via SWR)
   - Get plan, role, usage data
7. Call setUserProperties(request, env, userData)
```

### JWT Verification Details

- **Algorithm:** RS256 (asymmetric)
- **JWKS endpoint:** `https://id.org.ai/.well-known/jwks.json`
- **Expected claims:**
  - `sub` — user ID (id.org.ai)
  - `client_id` — should be `auto_dev_cli`
  - `scope` — should include `openid email`
  - `iss` — id.org.ai issuer URL
  - `exp` — expiration timestamp
- **Library:** `jose` (already used by `withJWT` for HS256)

### Caching Strategy

Three external calls, all cacheable via the existing `request.swrFetch`:

| Call | Cache TTL | Purpose |
|------|-----------|---------|
| JWKS fetch | 3600s (1 hour) | Public keys rarely rotate |
| id.org.ai /api/me | 300s (5 min) | User profile, low churn |
| auth.vin user lookup | 3600s (1 hour) | Plan/billing data, already cached by withAPIKey |

### Edge Cases

- **id.org.ai down:** JWT verification fails → user not authenticated → falls through to 401
- **User has id.org.ai account but no auth.vin account:** No plan found → treat as Free tier (or return 403 with "Create an account at auto.dev")
- **Token expired:** jose verification rejects → skip
- **Wrong client_id:** Not `auto_dev_cli` → skip (don't process JWTs from other id.org.ai clients)
- **JWKS key rotation:** SWR cache ensures we pick up new keys within TTL

### auth.vin User Lookup by Email

The existing `fetchUserWithApiKey` calls `auth.vin/api/users/me` with an API key. For the id.org.ai flow, we need to look up by email instead. Two approaches:

auth.vin uses Payload CMS with MongoDB. Create a helper function that queries Payload's API to find a user by email (e.g., `GET /api/users?where[email][equals]=X`). This returns the same `UserAccount` shape with plan, role, etc.

If no auth.vin account exists for the email, the user gets Free tier access.

## Files

### APIs Repo (`/Users/chrisrisner/Workspace/drivly/AUTO_DEV-API/apis`)

- **Create:** `authentication/with-id-org-ai.ts` — new middleware
- **Modify:** `index.ts` — add `withIdOrgAi` to middleware chain after `withJWT`
- **Create:** `test/authentication/with-id-org-ai.test.ts` — tests

### No changes to existing files

- `with-api-key.ts` — untouched
- `with-jwt.ts` — untouched
- `helpers.ts` — reused (setUserProperties)

## Testing

Tests should mock:
- `fetch` for JWKS, id.org.ai /api/me, and auth.vin calls
- JWT creation with RS256 test keys (generate a test keypair)

Test cases:
1. Valid id.org.ai JWT → user authenticated with correct plan
2. Expired JWT → skipped, user not authenticated
3. Wrong client_id → skipped
4. Invalid signature → skipped
5. User exists in id.org.ai but not auth.vin → Free tier fallback
6. Already authenticated by withAPIKey → middleware skips
7. Non-JWT Bearer token → skipped
8. No Authorization header → skipped

## Resolved Questions

1. **auth.vin email lookup:** auth.vin uses Payload API — create a helper to find user by email via Payload's query API.
2. **client_id validation:** Strict — `client_id === 'auto_dev_cli'`. This client_id is used for both CLI and MCP server (same OAuth client, two consumption modes).
3. **Free tier fallback:** Users who authenticate via id.org.ai but have no auth.vin account get Free tier access.
