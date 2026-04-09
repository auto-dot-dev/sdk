import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSpinner, SPINNER_MESSAGES } from '../src/cli/spinner'

describe('spinner', () => {
  let originalIsTTY: boolean | undefined
  let originalNoColor: string | undefined
  let writeStub: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalIsTTY = process.stderr.isTTY
    originalNoColor = process.env.NO_COLOR
    writeStub = vi.fn()
    vi.spyOn(process.stderr, 'write').mockImplementation(writeStub)
  })

  afterEach(() => {
    process.stderr.isTTY = originalIsTTY
    if (originalNoColor === undefined) {
      delete process.env.NO_COLOR
    } else {
      process.env.NO_COLOR = originalNoColor
    }
    vi.restoreAllMocks()
  })

  it('renders spinner frames to stderr on TTY', async () => {
    process.stderr.isTTY = true
    delete process.env.NO_COLOR

    const spinner = createSpinner('Loading...')

    // Let one frame render
    await new Promise((r) => setTimeout(r, 100))
    spinner.stop()

    expect(writeStub).toHaveBeenCalled()
    const firstCall = writeStub.mock.calls[0][0] as string
    // Should contain hide cursor escape and the message
    expect(firstCall).toContain('Loading...')
  })

  it('returns no-op when stderr is not a TTY', () => {
    process.stderr.isTTY = false
    delete process.env.NO_COLOR

    const spinner = createSpinner('Loading...')
    spinner.stop()

    // write should not have been called for spinner output
    expect(writeStub).not.toHaveBeenCalled()
  })

  it('returns no-op when NO_COLOR is set', () => {
    process.stderr.isTTY = true
    process.env.NO_COLOR = '1'

    const spinner = createSpinner('Loading...')
    spinner.stop()

    expect(writeStub).not.toHaveBeenCalled()
  })

  it('picks a random message when no label provided', async () => {
    process.stderr.isTTY = true
    delete process.env.NO_COLOR

    const spinner = createSpinner()

    await new Promise((r) => setTimeout(r, 100))
    spinner.stop()

    expect(writeStub).toHaveBeenCalled()
    const output = writeStub.mock.calls[0][0] as string
    const matchesAny = SPINNER_MESSAGES.some((msg) => output.includes(msg))
    expect(matchesAny).toBe(true)
  })

  it('stop clears the line and shows cursor', async () => {
    process.stderr.isTTY = true
    delete process.env.NO_COLOR

    const spinner = createSpinner('Test')

    await new Promise((r) => setTimeout(r, 100))
    spinner.stop()

    const allOutput = writeStub.mock.calls.map((c: unknown[]) => c[0]).join('')
    // Should contain show cursor escape
    expect(allOutput).toContain('\x1B[?25h')
    // Should contain clear line
    expect(allOutput).toContain('\x1B[K')
  })
})
