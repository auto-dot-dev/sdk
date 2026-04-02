import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { Command } from 'commander'
import { requestDeviceCode, pollForToken, saveCredentials, clearCredentials, loadCredentials } from '../auth/oauth'
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
        saveCredentials({ accessToken: options.apiKey })
        console.log('API key saved. You are now authenticated.')
        return
      }

      const config = {
        idOrgAiUrl: DEFAULT_AUTH_CONFIG.idOrgAiUrl,
        clientId: DEFAULT_AUTH_CONFIG.clientId,
      }

      try {
        const deviceCode = await requestDeviceCode(config)
        const verifyUrl = `${deviceCode.verification_uri}?user_code=${deviceCode.user_code}`
        console.log(`\nOpening browser to: ${verifyUrl}`)
        console.log(`If it doesn't open, visit: ${deviceCode.verification_uri}`)
        console.log(`Enter code: ${deviceCode.user_code}\n`)
        openBrowser(verifyUrl)
        console.log('Waiting for authorization...')

        const token = await pollForToken({
          ...config,
          deviceCode: deviceCode.device_code,
          interval: deviceCode.interval,
          expiresIn: deviceCode.expires_in,
        })

        saveCredentials({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
        })

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
    .action(() => {
      clearCredentials()
      console.log('Logged out. Credentials cleared.')
    })

  return cmd
}

export function buildWhoamiCommand(): Command {
  const cmd = new Command('whoami')
    .description('Show current user and active org')
    .action(() => {
      const creds = loadCredentials()
      if (!creds) {
        console.log('Not logged in. Run: auto login')
        return
      }
      console.log(`Authenticated${creds.org ? ` (org: ${creds.org})` : ''}`)
    })

  return cmd
}
