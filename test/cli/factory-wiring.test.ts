import { describe, it, expect, vi, beforeEach } from 'vitest'

const ctorCalls: Array<Record<string, unknown>> = []
let requestImpl: (() => Promise<unknown>) | null = null

vi.mock('../../src/core/client', () => {
  class MockAutoDevClient {
    constructor(opts: Record<string, unknown>) {
      ctorCalls.push(opts)
    }
    async request() {
      if (requestImpl) return requestImpl()
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

  it('formats unexpected errors instead of rethrowing a raw stack trace', async () => {
    requestImpl = async () => {
      throw new Error('boom from below')
    }
    const cmd = makeCommand({ name: 'decode', description: 'Decode VIN' })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('__exit__')
    }) as never)

    await expect(cmd.parseAsync(['node', 'decode', '1HGCM82633A004352', '--json'])).rejects.toThrow('__exit__')

    expect(exitSpy).toHaveBeenCalledWith(1)
    const printed = errSpy.mock.calls.flat().join('\n')
    expect(printed).toContain('boom from below')

    logSpy.mockRestore()
    errSpy.mockRestore()
    exitSpy.mockRestore()
    requestImpl = null
  })
})
