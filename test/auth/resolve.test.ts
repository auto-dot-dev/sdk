import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('resolveAuth', () => {
  let originalApiKey: string | undefined

  beforeEach(() => {
    originalApiKey = process.env.AUTODEV_API_KEY
  })

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.AUTODEV_API_KEY
    } else {
      process.env.AUTODEV_API_KEY = originalApiKey
    }
    vi.restoreAllMocks()
  })

  it('returns explicit apiKey when provided', async () => {
    const { resolveAuth } = await import('../../src/auth/resolve')
    const key = await resolveAuth({ apiKey: 'sk_explicit' })
    expect(key).toBe('sk_explicit')
  })

  it('falls back to AUTODEV_API_KEY env var', async () => {
    process.env.AUTODEV_API_KEY = 'sk_env'
    const { resolveAuth } = await import('../../src/auth/resolve')
    const key = await resolveAuth({})
    expect(key).toBe('sk_env')
  })
})
