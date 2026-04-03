export const METADATA_KEYS = ['api', 'links', 'user', 'examples', 'discover', 'actions'] as const

export function stripMetadata(response: Record<string, unknown>): unknown {
  const stripped = Object.fromEntries(
    Object.entries(response).filter(([key]) => !(METADATA_KEYS as readonly string[]).includes(key))
  )
  const keys = Object.keys(stripped)
  if (keys.length === 1) return stripped[keys[0]!]
  return stripped
}
