/**
 * CLI color theme for auto.dev — matches the website's purple/violet aesthetic.
 * Zero dependencies — uses raw ANSI escape codes.
 */

const enabled = process.env.NO_COLOR === undefined && process.stdout.isTTY !== false

function ansi(code: string) {
  return (text: string) => enabled ? `${code}${text}\x1b[0m` : text
}

// Core palette — matches auto.dev website
export const purple = ansi('\x1b[35m')        // brand accent
export const boldPurple = ansi('\x1b[1;35m')  // headers, command names
export const cyan = ansi('\x1b[36m')          // values, data
export const boldCyan = ansi('\x1b[1;36m')    // important values
export const dim = ansi('\x1b[2m')            // secondary info
export const bold = ansi('\x1b[1m')           // emphasis
export const green = ansi('\x1b[32m')         // success
export const boldGreen = ansi('\x1b[1;32m')   // success headers
export const red = ansi('\x1b[31m')           // errors
export const boldRed = ansi('\x1b[1;31m')     // error headers
export const yellow = ansi('\x1b[33m')        // warnings
export const white = ansi('\x1b[37m')         // neutral
export const boldWhite = ansi('\x1b[1;37m')   // labels

// Semantic aliases
export const brand = boldPurple
export const accent = purple
export const value = cyan
export const label = boldWhite
export const hint = dim
export const success = green
export const error = boldRed
export const warning = yellow

// Tier badge styling — consistent purple brand color
export function tierBadge(tier: string): string {
  return boldPurple(`[${tier.toUpperCase()}]`)
}

// Boxed header for commands like whoami
export function header(text: string): string {
  const line = '─'.repeat(text.length + 4)
  return `${dim('┌' + line + '┐')}\n${dim('│')}  ${brand(text)}  ${dim('│')}\n${dim('└' + line + '┘')}`
}

// Key-value pair formatting
export function kv(key: string, val: string, indent = 0): string {
  const pad = ' '.repeat(indent)
  return `${pad}${label(key)}  ${value(val)}`
}

// Error formatting
export function formatError(message: string, suggestion?: string): string {
  let out = `${boldRed('✖')} ${red(message)}`
  if (suggestion) {
    out += `\n  ${hint(suggestion)}`
  }
  return out
}

// Success formatting
export function formatSuccess(message: string): string {
  return `${boldPurple('✔')} ${message}`
}
