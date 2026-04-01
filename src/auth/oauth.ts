import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const DEFAULT_CONFIG_DIR = join(homedir(), '.config', 'auto-dev')

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export interface Credentials {
  accessToken: string
  refreshToken?: string
  org?: string
}

export async function requestDeviceCode(config: { idOrgAiUrl: string; clientId: string }): Promise<DeviceCodeResponse> {
  const response = await fetch(`${config.idOrgAiUrl}/oauth/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      scope: 'openid profile email',
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(`Device code request failed: ${(body as { error?: string }).error ?? response.statusText}`)
  }

  return response.json() as Promise<DeviceCodeResponse>
}

export async function pollForToken(config: {
  idOrgAiUrl: string
  clientId: string
  deviceCode: string
  interval: number
  expiresIn: number
}): Promise<TokenResponse> {
  const deadline = Date.now() + config.expiresIn * 1000

  while (Date.now() < deadline) {
    const response = await fetch(`${config.idOrgAiUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: config.clientId,
        device_code: config.deviceCode,
      }),
    })

    if (response.ok) {
      return response.json() as Promise<TokenResponse>
    }

    const body = (await response.json().catch(() => ({ error: 'unknown' }))) as { error?: string }

    if (body.error === 'authorization_pending') {
      await new Promise((resolve) => setTimeout(resolve, config.interval * 1000))
      continue
    }

    if (body.error === 'slow_down') {
      await new Promise((resolve) => setTimeout(resolve, (config.interval + 5) * 1000))
      continue
    }

    throw new Error(`Token request failed: ${body.error}`)
  }

  throw new Error('Device code expired. Please try logging in again.')
}

export function saveCredentials(credentials: Credentials, configDir: string = DEFAULT_CONFIG_DIR): void {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  writeFileSync(join(configDir, 'credentials.json'), JSON.stringify(credentials, null, 2), 'utf-8')
}

export function loadCredentials(configDir: string = DEFAULT_CONFIG_DIR): Credentials | null {
  const path = join(configDir, 'credentials.json')
  if (!existsSync(path)) return null

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Credentials
  } catch {
    return null
  }
}

export function clearCredentials(configDir: string = DEFAULT_CONFIG_DIR): void {
  const path = join(configDir, 'credentials.json')
  if (existsSync(path)) {
    rmSync(path)
  }
}
