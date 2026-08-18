import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Stub the stored-credential lookup so tests never read a real ~/.id.org.ai token
let storedToken: string | null = null

vi.mock('../../src/auth/oauth', () => ({
  getValidToken: async () => storedToken,
}))

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

  it('falls back to the stored login token', async () => {
    delete process.env.AUTODEV_API_KEY
    storedToken = 'stored_oauth_token'
    const { resolveAuth } = await import('../../src/auth/resolve')
    const key = await resolveAuth({})
    expect(key).toBe('stored_oauth_token')
    storedToken = null
  })

  it('throws a typed AutoDevError when no credentials exist anywhere', async () => {
    delete process.env.AUTODEV_API_KEY
    storedToken = null
    const { resolveAuth } = await import('../../src/auth/resolve')
    const { AutoDevError } = await import('../../src/errors')
    const err = await resolveAuth({}).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(AutoDevError)
    expect(err).toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'No API key found',
      suggestion: 'Set AUTODEV_API_KEY or run: auto login',
    })
  })
})
