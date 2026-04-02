/**
 * OAuth device flow and credential storage — delegates to id.org.ai CLI SDK.
 */

import { authorizeDevice, pollForTokens } from 'id.org.ai/cli/device'
import { ensureValidToken, logout, getUser } from 'id.org.ai/cli/auth'
import { createStorage } from 'id.org.ai/cli/storage'
import type { TokenStorage, StoredTokenData } from 'id.org.ai/cli/storage'
import type { DeviceAuthorizationResponse, TokenResponse } from 'id.org.ai/cli/device'

export type { DeviceAuthorizationResponse, TokenResponse }
export type { TokenStorage, StoredTokenData }

// Use id.org.ai's secure file storage (~/.id.org.ai/token)
const storage = createStorage()

export { authorizeDevice, pollForTokens, ensureValidToken, logout, getUser, createStorage }

/**
 * Get a valid access token, auto-refreshing if needed.
 * Returns null if not authenticated.
 */
export async function getValidToken(): Promise<string | null> {
  return ensureValidToken(storage)
}

/**
 * Save token data after device flow login.
 */
export async function saveTokenData(data: { access_token: string; refresh_token?: string; expires_in?: number }): Promise<void> {
  await storage.setTokenData({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  })
}

/**
 * Save an API key directly (for --api-key flag).
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await storage.setTokenData({ accessToken: apiKey })
}

/**
 * Load the current access token (without refresh).
 */
export async function loadToken(): Promise<string | null> {
  return storage.getToken()
}

/**
 * Clear stored credentials and revoke tokens server-side.
 */
export async function clearCredentials(): Promise<void> {
  const tokenData = await storage.getTokenData()
  if (tokenData?.accessToken) {
    await logout(tokenData.accessToken, tokenData.refreshToken)
  }
  await storage.removeToken()
}
