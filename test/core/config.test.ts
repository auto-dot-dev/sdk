import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, saveConfig } from '../../src/core/config'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const testDir = join(tmpdir(), 'auto-dev-config-test-' + Date.now())

describe('config', () => {
  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('returns default config when file does not exist', () => {
    const config = loadConfig(join(testDir, 'nonexistent', 'config.json'))
    expect(config).toEqual({})
  })

  it('saves and loads config', () => {
    const configPath = join(testDir, 'config.json')
    saveConfig({ raw: true }, configPath)
    const config = loadConfig(configPath)
    expect(config).toEqual({ raw: true })
  })

  it('creates parent directory on save', () => {
    const configPath = join(testDir, 'nested', 'dir', 'config.json')
    saveConfig({ raw: false }, configPath)
    expect(existsSync(configPath)).toBe(true)
    const config = loadConfig(configPath)
    expect(config).toEqual({ raw: false })
  })

  it('merges into existing config', () => {
    const configPath = join(testDir, 'config.json')
    saveConfig({ raw: true }, configPath)
    saveConfig({ raw: false }, configPath)
    const config = loadConfig(configPath)
    expect(config).toEqual({ raw: false })
  })
})
