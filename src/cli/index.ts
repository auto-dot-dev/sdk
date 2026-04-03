#!/usr/bin/env node

import { Command } from 'commander'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from './auth'
import { buildApiCommands } from './commands'
import { buildExploreCommand } from './explore'
import { buildMcpCommand } from './mcp-install'
import { buildConfigCommand } from './config'
import { startMcpServer } from '../mcp/server'
import { getValidToken } from '../auth/oauth'
import { listDocs, getDoc, searchDocs, getAliases } from '../docs/search.js'
import { brand, label, hint, value, formatError } from './colors'

const program = new Command()
  .name('auto')
  .description('CLI for the auto.dev automotive APIs')
  .version('0.1.0')
  .option('--mcp', 'Start as MCP stdio server')

// Handle --mcp before commander parses subcommands
if (process.argv.includes('--mcp')) {
  ;(async () => {
    const apiKey = process.env.AUTODEV_API_KEY ?? await getValidToken()
    if (!apiKey) {
      process.stderr.write('No API key found. Set AUTODEV_API_KEY or run: auto login\n')
      process.exit(1)
    }
    await startMcpServer({ apiKey })
  })()
} else {

  program.addCommand(buildLoginCommand())
  program.addCommand(buildLogoutCommand())
  program.addCommand(buildWhoamiCommand())
  program.addCommand(buildExploreCommand())
  program.addCommand(buildMcpCommand())
  program.addCommand(buildConfigCommand())

  const orgs = new Command('orgs').description('Manage organizations')
  orgs.command('list').description('List your organizations').action(() => {
    console.log('Organization listing requires authentication. Run: auto login')
  })
  orgs.command('switch').argument('<slug>', 'Organization slug').description('Switch active organization').action(async (slug) => {
    const token = await getValidToken()
    if (!token) { console.error('Not logged in. Run: auto login'); process.exit(1) }
    console.log(`Switched to organization: ${slug}`)
  })
  program.addCommand(orgs)

  const docs = new Command('docs')
    .description('Browse auto.dev API documentation')
    .argument('[query]', 'Endpoint name or search query')
    .action((query) => {
      if (!query) {
        const available = listDocs()
        if (available.length === 0) {
          console.log(formatError('No bundled docs found', 'Run: npm run build:docs'))
          return
        }
        console.log(`\n${brand('auto.dev')} ${hint('Documentation')}\n`)
        // Show in same order as explore endpoints
        const order = ['decode', 'photos', 'listings', 'specs', 'build', 'recalls', 'payments', 'apr', 'tco', 'openRecalls', 'plate', 'taxes']
        const aliases = getAliases()
        for (const shortcut of order) {
          const docName = aliases[shortcut] ?? shortcut
          if (available.includes(docName)) {
            console.log(`  ${label(shortcut.padEnd(16))} ${hint(docName)}`)
          }
        }
        console.log()
        return
      }

      const doc = getDoc(query)
      if (doc) {
        console.log(`\n${brand('auto.dev')} ${hint('docs')} ${value(query)}\n`)
        console.log(doc)
        return
      }

      const results = searchDocs(query)
      if (results.length === 0) {
        console.log(formatError(`No docs found for "${query}"`))
        const available = listDocs()
        if (available.length > 0) {
          console.log(`  ${hint('Available:')} ${available.map(n => value(n)).join(hint(', '))}`)
        }
        return
      }

      console.log(`\n${brand('auto.dev')} ${hint('docs')} ${value(results[0]!.name)}\n`)
      console.log(results[0]!.content)
      if (results.length > 1) {
        console.log(`\n${hint('Also related:')} ${results.slice(1).map((r) => value(r.name)).join(hint(', '))}`)
      }
    })

  program.addCommand(docs)

  for (const cmd of buildApiCommands()) {
    program.addCommand(cmd)
  }

  program.parse()
}
