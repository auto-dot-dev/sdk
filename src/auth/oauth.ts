/**
 * OAuth device flow and credential storage — delegates to id.org.ai CLI SDK.
 */

import { authorizeDevice, pollForTokens } from 'id.org.ai/cli/device'
import { logout, getUser } from 'id.org.ai/cli/auth'
import { createStorage } from 'id.org.ai/cli/storage'
import type { TokenStorage, StoredTokenData } from 'id.org.ai/cli/storage'
import type { DeviceAuthorizationResponse, TokenResponse } from 'id.org.ai/cli/device'
import { CANONICAL_AUTH_ORIGIN } from 'id.org.ai/auth'
import { AUTO_DEV_CLI_CLIENT_ID } from './config'

export type { DeviceAuthorizationResponse, TokenResponse }
export type { TokenStorage, StoredTokenData }

// Use id.org.ai's secure file storage (~/.id.org.ai/token)
const storage = createStorage()

const REFRESH_BUFFER_MS = 30_000

export { authorizeDevice, pollForTokens, logout, getUser, createStorage }

/**
 * Refresh an access token using the correct client_id for auto.dev CLI.
 */
async function refreshAccessToken(refreshToken: string): Promise<StoredTokenData | null> {
  try {
    const response = await fetch(`${CANONICAL_AUTH_ORIGIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AUTO_DEV_CLI_CLIENT_ID,
      }).toString(),
    })

    if (!response.ok) return null

    const data = (await response.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    }
  } catch {
    return null
  }
}

/**
 * Get a valid access token, auto-refreshing if needed.
 * Uses auto_dev_cli client_id for refresh (not id.org.ai's default).
 */
export async function getValidToken(): Promise<string | null> {
  const tokenData = await storage.getTokenData()
  if (!tokenData?.accessToken) return null

  const needsRefresh = tokenData.expiresAt && (tokenData.expiresAt - Date.now() < REFRESH_BUFFER_MS)

  if (!needsRefresh) return tokenData.accessToken

  if (tokenData.refreshToken) {
    const refreshed = await refreshAccessToken(tokenData.refreshToken)
    if (refreshed) {
      await storage.setTokenData(refreshed)
      return refreshed.accessToken
    }
  }

  // Refresh failed — return existing token, let the server decide
  return tokenData.accessToken
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
