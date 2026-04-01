import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestDeviceCode, pollForToken, loadCredentials, saveCredentials, clearCredentials } from '../../src/auth/oauth'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('OAuth Device Flow', () => {
  it('requestDeviceCode calls POST /oauth/device', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          device_code: 'dev_123',
          user_code: 'ABCD-1234',
          verification_uri: 'https://id.org.ai/device',
          expires_in: 600,
          interval: 5,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )

    const result = await requestDeviceCode({ idOrgAiUrl: 'https://id.org.ai', clientId: 'auto_dev_cli' })

    expect(result.device_code).toBe('dev_123')
    expect(result.user_code).toBe('ABCD-1234')
    expect(result.verification_uri).toBe('https://id.org.ai/device')

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://id.org.ai/oauth/device')
    expect(init?.method).toBe('POST')

    fetchSpy.mockRestore()
  })

  it('pollForToken retries on authorization_pending', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'authorization_pending' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'at_123',
            refresh_token: 'rt_456',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      )

    const result = await pollForToken({
      idOrgAiUrl: 'https://id.org.ai',
      clientId: 'auto_dev_cli',
      deviceCode: 'dev_123',
      interval: 0.01,
      expiresIn: 600,
    })

    expect(result.access_token).toBe('at_123')
    expect(result.refresh_token).toBe('rt_456')
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    fetchSpy.mockRestore()
  })
})

describe('Credential Storage', () => {
  const testDir = join(tmpdir(), 'auto-dev-test-' + Date.now())

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it('saves and loads credentials', () => {
    const creds = { accessToken: 'at_123', refreshToken: 'rt_456', org: 'acme' }
    saveCredentials(creds, testDir)

    const loaded = loadCredentials(testDir)
    expect(loaded).toEqual(creds)
  })

  it('returns null when no credentials exist', () => {
    const loaded = loadCredentials(testDir)
    expect(loaded).toBeNull()
  })

  it('clears credentials', () => {
    saveCredentials({ accessToken: 'at_123', refreshToken: 'rt_456' }, testDir)
    clearCredentials(testDir)

    const loaded = loadCredentials(testDir)
    expect(loaded).toBeNull()
  })
})
