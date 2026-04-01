import { describe, it, expect, vi } from 'vitest'
import { buildLoginCommand, buildLogoutCommand, buildWhoamiCommand } from '../../src/cli/auth'

describe('CLI Auth Commands', () => {
  it('buildLoginCommand returns a commander Command', () => {
    const cmd = buildLoginCommand()
    expect(cmd.name()).toBe('login')
  })

  it('buildLogoutCommand returns a commander Command', () => {
    const cmd = buildLogoutCommand()
    expect(cmd.name()).toBe('logout')
  })

  it('buildWhoamiCommand returns a commander Command', () => {
    const cmd = buildWhoamiCommand()
    expect(cmd.name()).toBe('whoami')
  })

  it('login command accepts --api-key option', () => {
    const cmd = buildLoginCommand()
    const option = cmd.options.find((o) => o.long === '--api-key')
    expect(option).toBeDefined()
  })
})
