import { describe, it, expect, vi, beforeEach } from 'vitest'

const ctorCalls: Array<Record<string, unknown>> = []

vi.mock('../../src/core/client', () => {
  class MockAutoDevClient {
    constructor(opts: Record<string, unknown>) {
      ctorCalls.push(opts)
    }
    async request() {
      return { data: {}, meta: { requestId: '', tier: 'starter' } }
    }
  }
  return { AutoDevClient: MockAutoDevClient, ENDPOINTS: {} }
})

vi.mock('../../src/auth/resolve', () => ({
  resolveAuth: async () => 'ad_sk_test',
}))

import { makeCommand } from '../../src/cli/factory'

describe('CLI makeCommand wiring', () => {
  beforeEach(() => {
    ctorCalls.length = 0
  })

  it('constructs AutoDevClient with clientType cli when command action runs', async () => {
    const cmd = makeCommand({ name: 'decode', description: 'Decode VIN' })
    // Suppress CLI chatter
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await cmd.parseAsync(['node', 'decode', '1HGCM82633A004352', '--json'])

    expect(ctorCalls).toHaveLength(1)
    expect(ctorCalls[0]?.clientType).toBe('cli')

    logSpy.mockRestore()
    errSpy.mockRestore()
  })
})
