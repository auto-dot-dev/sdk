import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// At runtime this file is bundled into dist/ as a chunk, so docs/ is a sibling
const DOCS_DIR = join(__dirname, 'docs')

// Map explore/CLI command names to doc file names
const ALIASES: Record<string, string> = {
  decode: 'vin-decode',
  photos: 'vehicle-photos',
  listings: 'vehicle-listings',
  specs: 'specifications',
  build: 'oem-build-data',
  recalls: 'vehicle-recalls',
  payments: 'vehicle-payments',
  apr: 'interest-rates',
  tco: 'total-cost-ownership',
  openRecalls: 'open-recalls',
  'open-recalls': 'open-recalls',
  plate: 'plate-to-vin',
  taxes: 'taxes-fees',
}

export function getAliases(): Record<string, string> {
  return ALIASES
}

export interface DocEntry {
  name: string
  filename: string
  content: string
}

export function listDocs(): string[] {
  if (!existsSync(DOCS_DIR)) return []
  return readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => basename(f, '.md'))
}

export function getDoc(name: string): string | null {
  const resolved = ALIASES[name] ?? name
  const filePath = join(DOCS_DIR, `${resolved}.md`)
  if (!existsSync(filePath)) return null
  return readFileSync(filePath, 'utf-8')
}

export function searchDocs(query: string): DocEntry[] {
  if (!existsSync(DOCS_DIR)) return []

  const terms = query.toLowerCase().split(/\s+/)
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
  const results: DocEntry[] = []

  for (const file of files) {
    const content = readFileSync(join(DOCS_DIR, file), 'utf-8')
    const lower = content.toLowerCase()
    const nameMatch = terms.some((t) => file.toLowerCase().includes(t))
    const contentMatch = terms.some((t) => lower.includes(t))

    if (nameMatch || contentMatch) {
      results.push({
        name: basename(file, '.md'),
        filename: file,
        content,
      })
    }
  }

  // Sort by relevance: exact > last segment match > starts-with > shorter name (more specific) > content-only
  const queryLower = query.toLowerCase().replace(/([A-Z])/g, (m) => '-' + m.toLowerCase()) // camelCase → kebab
  results.sort((a, b) => {
    const aLower = a.name.toLowerCase()
    const bLower = b.name.toLowerCase()
    const aLastSeg = aLower.split('-').pop() ?? ''
    const bLastSeg = bLower.split('-').pop() ?? ''
    const aScore = aLower === queryLower ? 0
      : aLastSeg === queryLower ? 1          // "recalls" matches vehicle-recalls (last segment)
      : aLower.startsWith(queryLower) ? 2    // "open" matches open-recalls
      : aLower.includes(queryLower) ? 3
      : 4
    const bScore = bLower === queryLower ? 0
      : bLastSeg === queryLower ? 1
      : bLower.startsWith(queryLower) ? 2
      : bLower.includes(queryLower) ? 3
      : 4
    if (aScore !== bScore) return aScore - bScore
    return aLower.length - bLower.length     // shorter name = more specific
  })

  return results
}
