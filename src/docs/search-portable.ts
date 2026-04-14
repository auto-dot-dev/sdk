/**
 * Workers-compatible docs search.
 * Uses bundled DOCS_DATA instead of filesystem access.
 * Same API as search.ts but works everywhere.
 */

import { DOCS_DATA } from './data'

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

export interface DocEntry {
  name: string
  filename: string
  content: string
}

export function listDocs(): string[] {
  return Object.keys(DOCS_DATA)
}

export function getDoc(name: string): string | null {
  const resolved = ALIASES[name] ?? name
  return DOCS_DATA[resolved] ?? null
}

export function searchDocs(query: string): DocEntry[] {
  const terms = query.toLowerCase().split(/\s+/)
  const results: DocEntry[] = []

  for (const [name, content] of Object.entries(DOCS_DATA)) {
    const lower = content.toLowerCase()
    const nameMatch = terms.some((t) => name.toLowerCase().includes(t))
    const contentMatch = terms.some((t) => lower.includes(t))

    if (nameMatch || contentMatch) {
      results.push({ name, filename: `${name}.md`, content })
    }
  }

  // Sort by relevance: alias match > name term hits > content term hits > name length
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
