import { describe, it, expect, vi } from 'vitest'

const ctorCalls: Array<Record<string, unknown>> = []

vi.mock('../../src/core/client.js', () => {
  class MockAutoDevClient {
    constructor(opts: Record<string, unknown>) {
      ctorCalls.push(opts)
    }
    async request() {
      return { data: {}, meta: { requestId: '', tier: '' } }
    }
  }
  return { AutoDevClient: MockAutoDevClient }
})

import { createMcpServer } from '../../src/mcp/server'

describe('createMcpServer wiring', () => {
  it('constructs AutoDevClient with clientType mcp-stdio', () => {
    ctorCalls.length = 0
    createMcpServer({ apiKey: 'test-key' })
    expect(ctorCalls).toHaveLength(1)
    expect(ctorCalls[0]?.clientType).toBe('mcp-stdio')
  })
})
