import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'
import { Command } from 'commander'
import { getValidToken } from '../auth/oauth'
import { brand, label, value, hint, formatSuccess, formatError } from './colors'

interface McpClient {
  name: string
  configPath: string
  key: string
  serverConfig: Record<string, unknown>
}

const BASE_SERVER_CONFIG = {
  command: 'auto',
  args: ['--mcp'],
}

const MCP_CLIENTS: McpClient[] = [
  {
    name: 'Claude Code',
    configPath: join(homedir(), '.claude.json'),
    key: 'mcpServers',
    serverConfig: { type: 'stdio', ...BASE_SERVER_CONFIG },
  },
  {
    name: 'Claude Desktop',
    configPath: join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    key: 'mcpServers',
    serverConfig: { ...BASE_SERVER_CONFIG },
  },
  {
    name: 'Cursor',
    configPath: join(homedir(), '.cursor', 'mcp.json'),
    key: 'mcpServers',
    serverConfig: { ...BASE_SERVER_CONFIG },
  },
]

function detectClients(): McpClient[] {
  return MCP_CLIENTS.filter((c) => {
    if (c.configPath.endsWith('.claude.json')) return existsSync(c.configPath)
    const dir = join(c.configPath, '..')
    return existsSync(dir)
  })
}

function isInstalled(client: McpClient): boolean {
  if (!existsSync(client.configPath)) return false
  try {
    const config = JSON.parse(readFileSync(client.configPath, 'utf-8'))
    return !!config[client.key]?.['auto-dev']
  } catch {
    return false
  }
}

function install(client: McpClient): void {
  let config: Record<string, unknown> = {}
  if (existsSync(client.configPath)) {
    try {
      config = JSON.parse(readFileSync(client.configPath, 'utf-8'))
    } catch {
      config = {}
    }
  }

  if (!config[client.key]) {
    config[client.key] = {}
  }

  ;(config[client.key] as Record<string, unknown>)['auto-dev'] = client.serverConfig

  const dir = join(client.configPath, '..')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(client.configPath, JSON.stringify(config, null, 2), 'utf-8')
}

function uninstall(client: McpClient): void {
  if (!existsSync(client.configPath)) return
  try {
    const config = JSON.parse(readFileSync(client.configPath, 'utf-8'))
    if (config[client.key]?.['auto-dev']) {
      delete config[client.key]['auto-dev']
      writeFileSync(client.configPath, JSON.stringify(config, null, 2), 'utf-8')
    }
  } catch {
    // ignore
  }
}

export function buildMcpCommand(): Command {
  const mcp = new Command('mcp').description('Manage MCP server integration')

  mcp
    .command('install')
    .description('Install auto.dev MCP server into your AI tools')
    .action(async () => {
      // Check auth
      const token = await getValidToken()
      if (!token) {
        console.log(formatError('You need to log in first', 'Run: auto login'))
        console.log()
        const { buildLoginCommand } = await import('./auth')
        const loginCmd = buildLoginCommand()
        await loginCmd.parseAsync(['login'], { from: 'user' })
      }

      // Install globally so the `auto` binary is available
      console.log(`${brand('auto.dev')} ${hint('Installing globally...')}`)
      try {
        execSync('npm install -g @auto.dev/sdk', { stdio: 'inherit' })
      } catch {
        console.error(formatError('Failed to install globally', 'Try running: npm install -g @auto.dev/sdk'))
        return
      }

      // Detect clients
      const clients = detectClients()
      if (clients.length === 0) {
        console.log(formatError('No supported MCP clients detected'))
        console.log(hint('Supported: Claude Code, Claude Desktop, Cursor'))
        console.log(hint('\nManual config (add to your MCP settings):'))
        console.log(JSON.stringify({ 'auto-dev': { type: 'stdio', ...BASE_SERVER_CONFIG } }, null, 2))
        return
      }

      let installed = 0
      for (const client of clients) {
        if (isInstalled(client)) {
          console.log(formatSuccess(`${label(client.name)} ${hint('already installed')}`))
        } else {
          install(client)
          console.log(formatSuccess(`${label(client.name)} ${value('installed')}`))
          installed++
        }
      }

      if (installed > 0) {
        console.log(`\n${formatSuccess('Done! Restart your AI tool to activate auto.dev tools.')}`)
        console.log(hint('No API key needed — uses your login automatically.'))
      } else {
        console.log(`\n${hint('auto.dev MCP is already configured in all detected clients.')}`)
      }
    })

  mcp
    .command('uninstall')
    .description('Remove auto.dev MCP server from your AI tools')
    .action(() => {
      const clients = detectClients()
      for (const client of clients) {
        if (isInstalled(client)) {
          uninstall(client)
          console.log(formatSuccess(`${label(client.name)} ${hint('removed')}`))
        }
      }
      console.log(formatSuccess('Done.'))
    })

  mcp
    .command('status')
    .description('Check MCP installation status')
    .action(() => {
      console.log(`\n${brand('auto.dev')} ${hint('MCP Status')}\n`)
      const clients = detectClients()
      if (clients.length === 0) {
        console.log(formatError('No supported MCP clients detected'))
        return
      }
      for (const client of clients) {
        const installed = isInstalled(client)
        const icon = installed ? '✔' : '✖'
        const status = installed ? value('installed') : hint('not installed')
        console.log(`  ${installed ? brand(icon) : hint(icon)} ${label(client.name)}  ${status}`)
      }
      console.log()
    })

  return mcp
}
