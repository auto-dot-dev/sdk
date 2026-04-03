import { Command } from 'commander'
import { loadConfig, saveConfig } from '../core/config'
import { brand, hint, label, value, formatSuccess } from './colors'

export function buildConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage auto.dev CLI configuration')

  config
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key (e.g. raw)')
    .argument('<value>', 'Config value (true/false)')
    .action((key, val) => {
      const parsed = val === 'true' ? true : val === 'false' ? false : val
      saveConfig({ [key]: parsed })
      console.log(formatSuccess(`${label(key)} set to ${value(String(parsed))}`))
    })

  config
    .command('get')
    .description('Get a config value')
    .argument('<key>', 'Config key (e.g. raw)')
    .action((key) => {
      const cfg = loadConfig()
      const val = (cfg as Record<string, unknown>)[key]
      if (val === undefined) {
        console.log(hint('(not set)'))
      } else {
        console.log(`${label(key)}  ${value(String(val))}`)
      }
    })

  config
    .command('list')
    .description('Show all config settings')
    .action(() => {
      const cfg = loadConfig()
      const entries = Object.entries(cfg)
      if (entries.length === 0) {
        console.log(hint('No config settings. Use: auto config set <key> <value>'))
        return
      }
      console.log(`\n${brand('auto.dev')} ${hint('config')}\n`)
      for (const [key, val] of entries) {
        console.log(`  ${label(key)}  ${value(String(val))}`)
      }
      console.log()
    })

  return config
}
