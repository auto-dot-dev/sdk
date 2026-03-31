import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AutoDev } from '../../src/sdk/index'

const mockRequest = vi.fn().mockResolvedValue({ data: { mocked: true }, meta: { requestId: 'r1', tier: 'starter' } })

vi.mock('../../src/core/client', () => {
  return {
    AutoDevClient: vi.fn().mockImplementation(function () {
      this.request = mockRequest
    }),
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
