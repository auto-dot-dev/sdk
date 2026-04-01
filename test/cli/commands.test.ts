import { describe, it, expect } from 'vitest'
import { buildApiCommands } from '../../src/cli/commands'

describe('CLI API Commands', () => {
  it('builds 12 API commands', () => {
    const commands = buildApiCommands()
    expect(commands).toHaveLength(12)
  })

  it('decode command has vin as required argument', () => {
    const commands = buildApiCommands()
    const decode = commands.find((c) => c.name() === 'decode')!
    expect(decode).toBeDefined()
    expect(decode.registeredArguments[0]?.required).toBe(true)
  })

  it('listings command has filter options', () => {
    const commands = buildApiCommands()
    const listings = commands.find((c) => c.name() === 'listings')!
    const optionNames = listings.options.map((o) => o.long)
    expect(optionNames).toContain('--make')
    expect(optionNames).toContain('--year')
    expect(optionNames).toContain('--zip')
  })

  it('plate command has state and number as required arguments', () => {
    const commands = buildApiCommands()
    const plate = commands.find((c) => c.name() === 'plate')!
    expect(plate.registeredArguments).toHaveLength(2)
  })

  it('open-recalls command exists (hyphenated)', () => {
    const commands = buildApiCommands()
    const openRecalls = commands.find((c) => c.name() === 'open-recalls')
    expect(openRecalls).toBeDefined()
  })
})
