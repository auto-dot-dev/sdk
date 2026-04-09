import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { Command } from 'commander'
import { authorizeDevice, pollForTokens, saveTokenData, saveApiKey, clearCredentials, getValidToken } from '../auth/oauth'
import { DEFAULT_AUTH_CONFIG } from '../auth/config'
import { brand, value, hint, header, kv, formatSuccess, formatError } from './colors'
import { createSpinner } from './spinner'

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
        console.log(formatSuccess('API key saved. You are now authenticated.'))
        return
      }

      try {
        const deviceSpinner = createSpinner()
        const deviceCode = await authorizeDevice(DEFAULT_AUTH_CONFIG.clientId)
        deviceSpinner.stop()

        const verifyUrl = deviceCode.verification_uri_complete || `${deviceCode.verification_uri}?user_code=${deviceCode.user_code}`
        console.log(`\n${brand('auto.dev')} ${hint('authentication')}`)
        console.log(`\nOpening browser to: ${value(verifyUrl)}`)
        console.log(`If it doesn't open, visit: ${value(deviceCode.verification_uri)}`)
        console.log(`Enter code: ${brand(deviceCode.user_code)}\n`)
        openBrowser(verifyUrl)
        console.log(hint('Waiting for authorization...'))

        const token = await pollForTokens(DEFAULT_AUTH_CONFIG.clientId, deviceCode.device_code, deviceCode.interval, deviceCode.expires_in)

        await saveTokenData(token)
        console.log(formatSuccess('Login successful!'))
      } catch (error) {
        console.error(formatError(`Login failed: ${(error as Error).message}`))
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
      console.log(formatSuccess('Logged out. Credentials cleared.'))
    })

  return cmd
}

export function buildWhoamiCommand(): Command {
  const cmd = new Command('whoami')
    .description('Show current user and active org')
    .action(async () => {
      const token = await getValidToken()
      if (!token) {
        console.log(formatError('Not logged in', 'Run: auto login'))
        return
      }
      const { getUser } = await import('../auth/oauth')
      const whoamiSpinner = createSpinner()
      const { user } = await getUser(token)
      whoamiSpinner.stop()
      if (user) {
        console.log(`\n${header('auto.dev')}`)
        console.log()
        console.log(kv('Email', user.email ?? 'unknown', 2))
        console.log(kv('Name ', user.name ?? 'unknown', 2))
        console.log(kv('ID   ', user.id, 2))
        if (user.organizationId) console.log(kv('Org  ', user.organizationId, 2))
        console.log()
      } else {
        console.log(hint('Authenticated (could not fetch user info)'))
      }
    })

  return cmd
}
