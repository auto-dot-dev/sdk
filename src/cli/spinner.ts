import { brand } from './colors'

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const FRAME_INTERVAL = 80

export const SPINNER_MESSAGES = [
  'Checking under the hood...',
  'Warming up the engine...',
  'Pulling into the data lane...',
  'Running the numbers...',
  'Scanning the lot...',
  'Revving up the search...',
  'Cruising through the records...',
  'Firing up the turbo...',
  'Shifting into gear...',
  'Rolling through the database...',
  'Tuning up the results...',
  'Popping the hood...',
  'Fueling up the query...',
  'Taking it for a spin...',
  'Hitting the open road...',
]

interface Spinner {
  stop(finalMessage?: string): void
}

const noopSpinner: Spinner = { stop() {} }

export function createSpinner(label?: string): Spinner {
  if (!process.stdout.isTTY || process.env.NO_COLOR !== undefined) {
    return noopSpinner
  }

  const message = label ?? SPINNER_MESSAGES[Math.floor(Math.random() * SPINNER_MESSAGES.length)]
  let frameIndex = 0
  let stopped = false

  // Hide cursor
  process.stdout.write('\x1B[?25l' + `\r\x1B[K${brand(FRAMES[frameIndex % FRAMES.length])} ${message}`)
  frameIndex++

  const interval = setInterval(() => {
    const frame = brand(FRAMES[frameIndex % FRAMES.length])
    process.stdout.write(`\r\x1B[K${frame} ${message}`)
    frameIndex++
  }, FRAME_INTERVAL)

  const cleanup = () => {
    if (stopped) return
    stopped = true
    clearInterval(interval)
    // Clear line and show cursor
    process.stdout.write(`\r\x1B[K\x1B[?25h`)
  }

  process.once('exit', cleanup)

  return {
    stop(finalMessage?: string) {
      cleanup()
      process.removeListener('exit', cleanup)
      if (finalMessage) {
        process.stdout.write(finalMessage + '\n')
      }
    },
  }
}
