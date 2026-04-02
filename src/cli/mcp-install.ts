import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { Command } from 'commander'
import { getValidToken } from '../auth/oauth'

interface McpClient {
  name: string
  configPath: string
  key: string
  serverConfig: Record<string, unknown>
}

const BASE_SERVER_CONFIG = {
  command: 'npx',
  args: ['-y', '@auto.dev/sdk', '--mcp'],
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
        console.log('You need to log in first.\n')
        const { buildLoginCommand } = await import('./auth')
        const loginCmd = buildLoginCommand()
        await loginCmd.parseAsync(['login'], { from: 'user' })
      }

      // Detect clients
      const clients = detectClients()
      if (clients.length === 0) {
        console.log('No supported MCP clients detected.')
        console.log('Supported: Claude Code, Claude Desktop, Cursor')
        console.log('\nManual config:')
        console.log(JSON.stringify({ 'auto-dev': BASE_SERVER_CONFIG }, null, 2))
        return
      }

      let installed = 0
      for (const client of clients) {
        if (isInstalled(client)) {
          console.log(`${client.name}: already installed`)
        } else {
          install(client)
          console.log(`${client.name}: installed`)
          installed++
        }
      }

      if (installed > 0) {
        console.log('\nDone! Restart your AI tool to activate auto.dev tools.')
        console.log('No API key needed — uses your login automatically.')
      } else {
        console.log('\nauto.dev MCP is already configured in all detected clients.')
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
          console.log(`${client.name}: removed`)
        }
      }
      console.log('Done.')
    })

  mcp
    .command('status')
    .description('Check MCP installation status')
    .action(() => {
      const clients = detectClients()
      if (clients.length === 0) {
        console.log('No supported MCP clients detected.')
        return
      }
      for (const client of clients) {
        const status = isInstalled(client) ? 'installed' : 'not installed'
        console.log(`${client.name}: ${status}`)
      }
    })

  return mcp
}
