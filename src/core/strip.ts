export const METADATA_KEYS = ['api', 'links', 'user', 'examples', 'discover', 'actions'] as const

export interface RawOptions {
  perRequest?: boolean
  consumer?: boolean
  config?: boolean
}

export function resolveRaw(options?: RawOptions): boolean {
  if (options?.perRequest !== undefined) return options.perRequest
  if (options?.consumer !== undefined) return options.consumer
  if (options?.config !== undefined) return options.config
  return false
}

export function stripMetadata(response: Record<string, unknown>): unknown {
  const stripped = Object.fromEntries(
    Object.entries(response).filter(([key]) => !(METADATA_KEYS as readonly string[]).includes(key))
  )
  const keys = Object.keys(stripped)
  if (keys.length === 1) return stripped[keys[0]!]
  return stripped
}
