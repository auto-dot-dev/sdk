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

  // Sort by relevance: alias match > name term hits > content term hits > name length
  const aliasValues = new Set(Object.values(ALIASES))
  results.sort((a, b) => {
    const aLower = a.name.toLowerCase()
    const bLower = b.name.toLowerCase()
    const aSegs = aLower.split('-')
    const bSegs = bLower.split('-')

    // Check if any query term is a known alias that resolves to this doc
    const aAliasHit = terms.some((t) => ALIASES[t] === aLower) ? 1 : 0
    const bAliasHit = terms.some((t) => ALIASES[t] === bLower) ? 1 : 0
    if (aAliasHit !== bAliasHit) return bAliasHit - aAliasHit

    // Count how many query terms appear in the doc name or its segments
    const aNameHits = terms.filter((t) => aSegs.includes(t) || aLower.includes(t)).length
    const bNameHits = terms.filter((t) => bSegs.includes(t) || bLower.includes(t)).length
    if (aNameHits !== bNameHits) return bNameHits - aNameHits

    // Count how many query terms appear in the content
    const aContentLower = a.content.toLowerCase()
    const bContentLower = b.content.toLowerCase()
    const aContentHits = terms.filter((t) => aContentLower.includes(t)).length
    const bContentHits = terms.filter((t) => bContentLower.includes(t)).length
    if (aContentHits !== bContentHits) return bContentHits - aContentHits

    return aLower.length - bLower.length
  })

  return results
}
