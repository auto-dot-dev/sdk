import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { Command } from 'commander'
import { authorizeDevice, pollForTokens, saveTokenData, saveApiKey, clearCredentials, getValidToken } from '../auth/oauth'
import { DEFAULT_AUTH_CONFIG } from '../auth/config'

function openBrowser(url: string): void {
  const cmd = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open'
  exec(`${cmd} "${url}"`)
}

export function buildLoginCommand(): Command {
  const cmd = new Command('login')
    .description('Log in to auto.dev via id.org.ai')
    .option('--api-key <key>', 'Use an API key directly (for CI/scripts)')
    .action(async (options) => {
      if (options.apiKey) {
        await saveApiKey(options.apiKey)
        console.log('API key saved. You are now authenticated.')
        return
      }

      try {
        const deviceCode = await authorizeDevice(DEFAULT_AUTH_CONFIG.clientId)
        const verifyUrl = deviceCode.verification_uri_complete || `${deviceCode.verification_uri}?user_code=${deviceCode.user_code}`
        console.log(`\nOpening browser to: ${verifyUrl}`)
        console.log(`If it doesn't open, visit: ${deviceCode.verification_uri}`)
        console.log(`Enter code: ${deviceCode.user_code}\n`)
        openBrowser(verifyUrl)
        console.log('Waiting for authorization...')

        const token = await pollForTokens(DEFAULT_AUTH_CONFIG.clientId, deviceCode.device_code, deviceCode.interval, deviceCode.expires_in)

        await saveTokenData(token)
        console.log('Login successful!')
      } catch (error) {
        console.error(`Login failed: ${(error as Error).message}`)
        process.exit(1)
      }
    })

  return cmd
}

export function buildLogoutCommand(): Command {
  const cmd = new Command('logout')
    .description('Log out and clear stored credentials')
    .action(async () => {
      await clearCredentials()
      console.log('Logged out. Credentials cleared.')
    })

  return cmd
}

export function buildWhoamiCommand(): Command {
  const cmd = new Command('whoami')
    .description('Show current user and active org')
    .action(async () => {
      const token = await getValidToken()
      if (!token) {
        console.log('Not logged in. Run: auto login')
        return
      }
      console.log('Authenticated')
    })

  return cmd
}
