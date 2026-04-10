import { describe, it, expect } from 'vitest'
import { handleError } from '../../src/mcp/factory'
import { AutoDevError } from '../../src/errors'

describe('handleError', () => {
  it('formats PLAN_REQUIRED error with upgrade link', () => {
    const err = new AutoDevError(402, 'PLAN_REQUIRED', 'Upgrade required', 'This endpoint requires a Growth plan. Upgrade at https://auto.dev/pricing')
    const result = handleError(err, 'specs')
    expect(result.content[0].text).toContain('requires a Growth plan')
    expect(result.content[0].text).toContain('https://auto.dev/pricing')
  })

  it('formats generic AutoDevError', () => {
    const err = new AutoDevError(404, 'NOT_FOUND', 'VIN not found')
    const result = handleError(err, 'decode')
    expect(result.content[0].text).toContain('404')
    expect(result.content[0].text).toContain('VIN not found')
  })

  it('formats unknown errors', () => {
    const err = new Error('Network failure')
    const result = handleError(err)
    expect(result.content[0].text).toContain('Network failure')
  })
})
