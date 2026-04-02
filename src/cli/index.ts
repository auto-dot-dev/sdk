#!/usr/bin/env node

import { Command } from 'commander'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from './auth'
import { buildApiCommands } from './commands'
import { buildExploreCommand } from './explore'
import { startMcpServer } from '../mcp/server'
import { getValidToken } from '../auth/oauth'

const program = new Command()
  .name('auto')
  .description('CLI for the auto.dev automotive APIs')
  .version('0.1.0')
  .option('--mcp', 'Start as MCP stdio server')

program.hook('preAction', async (thisCommand) => {
  if (thisCommand.opts().mcp) {
    const apiKey = process.env.AUTODEV_API_KEY ?? await getValidToken()
    if (!apiKey) {
      console.error('No API key found. Set AUTODEV_API_KEY or run: auto login')
      process.exit(1)
    }
    await startMcpServer({ apiKey })
    process.exit(0)
  }
})

program.addCommand(buildLoginCommand())
program.addCommand(buildLogoutCommand())
program.addCommand(buildWhoamiCommand())
program.addCommand(buildExploreCommand())

const orgs = new Command('orgs').description('Manage organizations')
orgs.command('list').description('List your organizations').action(() => {
  console.log('Organization listing requires authentication. Run: auto login')
})
orgs.command('switch').argument('<slug>', 'Organization slug').description('Switch active organization').action(async (slug) => {
  const token = await getValidToken()
  if (!token) { console.error('Not logged in. Run: auto login'); process.exit(1) }
  // TODO: set org context once org management is implemented
  console.log(`Switched to organization: ${slug}`)
})
program.addCommand(orgs)

for (const cmd of buildApiCommands()) {
  program.addCommand(cmd)
}

program.parse()
