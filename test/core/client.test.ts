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

  describe('response stripping', () => {
    it('strips metadata by default', async () => {
      const mockResponse = {
        api: { name: 'api.auto.dev' },
        links: { home: 'https://api.auto.dev' },
        user: { name: 'Test' },
        examples: {},
        discover: {},
        actions: {},
        make: 'Kia',
        model: 'Soul',
      }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'content-type': 'application/json', 'x-request-id': 'req_strip' },
        }),
      )
      const client = new AutoDevClient({ apiKey: 'test-key' })
      const result = await client.request('decode', { vin: '1HGCM82633A004352' })
      expect(result.data).toEqual({ make: 'Kia', model: 'Soul' })
      fetchSpy.mockRestore()
    })

    it('returns raw when client option raw: true', async () => {
      const mockResponse = {
        api: { name: 'api.auto.dev' },
        make: 'Kia',
      }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'content-type': 'application/json', 'x-request-id': 'req_raw' },
        }),
      )
      const client = new AutoDevClient({ apiKey: 'test-key', raw: true })
      const result = await client.request('decode', { vin: '1HGCM82633A004352' })
      expect(result.data).toEqual({ api: { name: 'api.auto.dev' }, make: 'Kia' })
      fetchSpy.mockRestore()
    })

    it('per-request raw overrides client option', async () => {
      const mockResponse = {
        api: { name: 'api.auto.dev' },
        make: 'Kia',
      }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'content-type': 'application/json', 'x-request-id': 'req_override' },
        }),
      )
      const client = new AutoDevClient({ apiKey: 'test-key', raw: false })
      const result = await client.request('decode', { vin: '1HGCM82633A004352', raw: true })
      expect(result.data).toEqual({ api: { name: 'api.auto.dev' }, make: 'Kia' })
      fetchSpy.mockRestore()
    })
  })
})
