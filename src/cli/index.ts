#!/usr/bin/env node

import { createRequire } from 'node:module'
import { Command } from 'commander'
import { resolveAuth } from '../auth/resolve'
import { getValidToken } from '../auth/oauth'
import { getAliases, getDoc, listDocs, searchDocs } from '../docs/search.js'
import { startMcpServer } from '../mcp/server'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from './auth'
import { brand, formatError, hint, label, value } from './colors'
import { buildApiCommands } from './commands'
import { buildConfigCommand } from './config'
import { buildExploreCommand } from './explore'
import { buildMcpCommand } from './mcp-install'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json')

const program = new Command()
  .name('auto')
  .description('CLI for the auto.dev automotive APIs')
  .version(version)
  .option('--mcp', 'Start as MCP stdio server')

// Handle --mcp before commander parses subcommands
if (process.argv.includes('--mcp')) {
  ;(async () => {
    await startMcpServer({
      apiKey: () => resolveAuth(),
    })
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
