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
