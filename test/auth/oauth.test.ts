import { describe, it, expect, vi } from 'vitest'
import { authorizeDevice, pollForTokens, saveTokenData, saveApiKey, loadToken, clearCredentials, getValidToken, createStorage } from '../../src/auth/oauth'

describe('OAuth module re-exports', () => {
  it('exports authorizeDevice from id.org.ai', () => {
    expect(typeof authorizeDevice).toBe('function')
  })

  it('exports pollForTokens from id.org.ai', () => {
    expect(typeof pollForTokens).toBe('function')
  })

  it('exports getValidToken', () => {
    expect(typeof getValidToken).toBe('function')
  })

  it('exports saveTokenData', () => {
    expect(typeof saveTokenData).toBe('function')
  })

  it('exports saveApiKey', () => {
    expect(typeof saveApiKey).toBe('function')
  })

  it('exports loadToken', () => {
    expect(typeof loadToken).toBe('function')
  })

  it('exports clearCredentials', () => {
    expect(typeof clearCredentials).toBe('function')
  })

  it('exports createStorage from id.org.ai', () => {
    expect(typeof createStorage).toBe('function')
  })
})

describe('Token Storage via id.org.ai', () => {
  it('createStorage returns a TokenStorage instance', () => {
    const storage = createStorage('/tmp/auto-dev-test-' + Date.now())
    expect(typeof storage.getToken).toBe('function')
    expect(typeof storage.setToken).toBe('function')
    expect(typeof storage.removeToken).toBe('function')
    expect(typeof storage.getTokenData).toBe('function')
    expect(typeof storage.setTokenData).toBe('function')
  })

  it('saves and loads token data', async () => {
    const testPath = '/tmp/auto-dev-test-' + Date.now()
    const storage = createStorage(testPath)

    await storage.setTokenData({ accessToken: 'at_123', refreshToken: 'rt_456' })
    const loaded = await storage.getTokenData()

    expect(loaded?.accessToken).toBe('at_123')
    expect(loaded?.refreshToken).toBe('rt_456')

    await storage.removeToken()
  })

  it('returns null when no token exists', async () => {
    const storage = createStorage('/tmp/auto-dev-test-empty-' + Date.now())
    const token = await storage.getToken()
    expect(token).toBeNull()
  })
})
