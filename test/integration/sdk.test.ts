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
