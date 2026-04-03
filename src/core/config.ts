import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

export interface Config {
  raw?: boolean
}

const DEFAULT_CONFIG_PATH = join(homedir(), '.auto-dev', 'config.json')

export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): Config {
  try {
    const content = readFileSync(configPath, 'utf-8')
    return JSON.parse(content) as Config
  } catch {
    return {}
  }
}

export function saveConfig(updates: Partial<Config>, configPath: string = DEFAULT_CONFIG_PATH): void {
  mkdirSync(dirname(configPath), { recursive: true })
  const existing = loadConfig(configPath)
  const merged = { ...existing, ...updates }
  writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n')
}
